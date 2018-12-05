import ExpressOAuthServer = require("express-oauth-server");
import {AuthorizationCode, Callback, Client, Falsey, Token, User} from "oauth2-server";
import {UsersController} from "../controllers/users.controller";
import Bluebird = require("bluebird");
import {UsersApi} from "../users-api";
import {Model} from "sequelize";
import * as Sequelize from "sequelize";
import {DbUser} from "./db/user";
import {DbClient, DbClientInstance} from "./db/client";
import {DbAccessToken} from "./db/access-token";

export class IftOAuth2Server {
    static getInstance() {
        return new ExpressOAuthServer({
            model: {
                getAccessToken: (accessToken: string): any => {
                    console.info('In getAccessToken OAuth method');

                    const model = UsersApi.inst.sequelize.models.accessToken as
                        Model<Sequelize.Instance<DbAccessToken>, DbAccessToken>;

                    const resp = model.findOne({
                        where: {
                            TokenValue: accessToken,
                        },
                        include: [ UsersApi.inst.sequelize.models.client, UsersApi.inst.sequelize.models.user ]
                    }).then((inst: Sequelize.Instance<DbAccessToken>|null) => {
                        let token: DbAccessToken;

                        if (!inst || !(token = inst.get()))
                            throw new Error('user not found');

                        const obj = {
                            accessToken: token.TokenValue,
                            accessTokenExpiresAt: token.ExpiresAt,
                            scope: token.Scopes,
                            client: token.client,
                            user: token.user,
                        };

                        return obj;
                    });// .catch(() => {console.info('error (harps)')});

                    console.info('ready to return promise');
                    return resp;
                },
                getClient: (clientId: string, clientSecret: string): Promise<Client|Falsey>|any => {
                    console.info('In getClient OAuth method');

                    const model = UsersApi.inst.sequelize.models.client as
                        Model<Sequelize.Instance<DbClient>, DbClient>;

                    const resp = model.findOne({
                        where: {
                            ClientId: clientId,
                            //For mobile and native apps only, not used yet
                            //ClientSecret: clientSecret
                        }
                    }).then((inst: Sequelize.Instance<DbClient>|null) => {
                        let client: DbClient;

                        if (!inst || !(client = inst.get()))
                            throw new Error('user not found');

                        const obj = {
                            id: client.Id,
                            client_id: client.ClientId,
                            client_name: client.Name,
                            redirectUris: client.RedirectUris,
                            grants: DbClient.getGrants(client)
                            // accessTokenLifetime: 3600,
                            // grants: ['authorization_code', 'password', 'refresh_token', 'client_credentials'], // ['password', 'client_credentials'],
                            // refreshTokenLifetime: 3600 * 24,
                            // redirectUris: 'http://localhost:1234',
                            // // added, probably not required
                            // name: 'foo',
                            // client_id: clientId,
                            // client_secret: 'sldslkd',
                            // grant_types: 'dsldksdl',
                            // scope: 'sdddd'
                        };

                        return obj;
                    });// .catch(() => {console.info('error (harps)')});

                    console.info('ready to return promise');
                    return resp;
                },
                saveToken: (token: Token, client: Client, user: User): any => {
                    console.info('In saveToken OAuth method');
                    const model = UsersApi.inst.sequelize.models.accessToken as
                        Model<Sequelize.Instance<DbAccessToken>, DbAccessToken>;
                    const resp = model.findOne({
                        where: {
                            TokenValue: token.accessToken,
                        },
                        include: [ UsersApi.inst.sequelize.models.client, UsersApi.inst.sequelize.models.user ]
                    }).then(async (inst: Sequelize.Instance<DbAccessToken>|null) => {
                        let t: DbAccessToken;

                        if (!inst || !(t = inst.get())) {
                            //token not found -> create
                            inst = await model.create({
                                Scopes: token.scope === undefined ?
                                    '' : Array.isArray(token.scope) ?
                                        token.scope.join('|') : token.scope,
                                ExpiresAt: token.accessTokenExpiresAt === undefined ? new Date() : token.accessTokenExpiresAt,
                                TokenValue: token.accessToken,
                                IdUser: user.id,
                                IdClient: 1, //todo: retrieve the client then use pk
                            });
                            t = inst.get();
                        }

                        const obj = {
                            accessToken: t.TokenValue,
                            accessTokenExpiresAt: t.ExpiresAt,
                            scope: t.Scopes,
                            client: t.client,
                            user: t.user,
                        };

                        return obj;
                    });// .catch(() => {console.info('error (harps)')});

                    return resp;
                },
                verifyScope: (token: Token, scope: string|string[]) => {
                    console.info('In verifyScope OAuth method');
                    //todo: next
                    return new Promise<boolean>(() => {
                        return Promise.resolve(false);
                    });
                },
                // optional, see -> https://oauth2-server.readthedocs.io/en/latest/model/spec.html#generateaccesstoken-client-user-scope-callback
                // generateAccessToken: (client: Client, user: User, scope: string|string[]): any => {
                //     console.info('In generateAccessToken OAuth method');
                //
                //     const model = UsersController.getModel();
                //
                //     const resp = model.findOne({
                //         where: {
                //             Email: 'eric@youri.ch'
                //         }
                //     }).then((inst) => {
                //         let user: User;
                //
                //         if (!inst || !(user = inst.get()))
                //             throw new Error('user not found');
                //
                //         const obj: string = 'access-token-value';
                //
                //         return obj;
                //     });// .catch(() => {console.info('error (harps)')});
                //
                //     return resp;
                // },
                // optional, see -> https://oauth2-server.readthedocs.io/en/latest/model/spec.html#generaterefreshtoken-client-user-scope-callback
                // generateRefreshToken: (client: Client, user: User, scope: string|string[]) => {
                //     console.info('In generateRefreshToken OAuth method');
                //     return new Promise<string>(() => {
                //         return Promise.resolve('');
                //     });
                // },
                generateAuthorizationCode: (client: Client, user: User, scope: string|string[]) => {
                    console.info('In generateAuthorizationCode OAuth method');
                    return new Promise<string>(() => {
                        return Promise.resolve('');
                    });
                },
                getAuthorizationCode: (authorizationCode: string) => {
                    console.info('In getAuthorizationCode OAuth method');
                    return new Promise<AuthorizationCode|Falsey>(() => {
                        return Promise.resolve('');
                    });
                },
                saveAuthorizationCode: (code: AuthorizationCode, client: Client, user: User) => {
                    console.info('In saveAuthorizationCode OAuth method');
                    return new Promise<AuthorizationCode|Falsey>(() => {
                        return Promise.resolve('');
                    });
                },
                revokeAuthorizationCode: (code: AuthorizationCode) => {
                    console.info('In revokeAuthorizationCode OAuth method');
                    return new Promise<boolean>(() => {
                        return Promise.resolve(false);
                    });
                },
                // optional, see -> https://oauth2-server.readthedocs.io/en/latest/model/spec.html#validatescope-user-client-scope-callback
                // validateScope: (user: User, client: Client, scope: string|string[]) => {
                //     console.info('In validateScope OAuth method');
                //     return new Promise<string|string[]|Falsey>(() => {
                //         return Promise.resolve('');
                //     });
                // },
                getUserFromClient: (client: Client) => {
                    console.info('In getUserFromClient OAuth method');
                    return new Promise<User|Falsey>(() => {
                        return Promise.resolve('');
                    });
                },
                getUser: (username: string, password: string) => {
                    console.info('In getUser OAuth method');

                    const model = UsersController.getModel();

                    const resp = model.findOne({
                        where: {
                            Email: username
                        }
                    }).then((inst) => {
                        let user: User;

                        if (!inst || !(user = inst.get()))
                            throw new Error('user not found');

                        const obj: User = {
                            id: user.Id,
                            username: user.Email
                        };

                        return obj;
                    });// .catch(() => {console.info('error (harps)')});

                    return resp;
                },
            },
        })
    }
}