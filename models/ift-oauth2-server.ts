import ExpressOAuthServer = require("express-oauth-server");
import {AuthorizationCode, Callback, Client, Falsey, Token, User} from "oauth2-server";
import {UsersController} from "../controllers/users.controller";
import Bluebird = require("bluebird");

export class IftOAuth2Server {
    static getInstance() {
        return new ExpressOAuthServer({
            model: {
                getAccessToken: (accessToken: string) => {
                    console.info('In getAccessToken OAuth method');
                    return new Promise<false|""|0|Token>(() => {
                        return Promise.resolve(0);
                    });
                },
                getClient: (clientId: string, clientSecret: string): Promise<Client|Falsey>|any => {
                    console.info('In getClient OAuth method');

                    const model = UsersController.getModel();

                    const resp = model.findOne({
                        where: {
                            Email: 'eric@youri.ch'
                        }
                    }).then((inst) => {
                        const obj = {
                            id: clientId,
                            accessTokenLifetime: 3600,
                            grants: ['authorization_code', 'password', 'refresh_token', 'client_credentials'], // ['password', 'client_credentials'],
                            refreshTokenLifetime: 3600 * 24,
                            redirectUris: 'http://localhost:1234',
                            // added, probably not required
                            name: 'foo',
                            client_id: clientId,
                            client_secret: 'sldslkd',
                            grant_types: 'dsldksdl',
                            scope: 'sdddd'
                        };

                        return obj;
                    });// .catch(() => {console.info('error (harps)')});

                    console.info('ready to return promise');
                    return resp;
                },
                saveToken: (token: Token, client: Client, user: User): any => {
                    console.info('In saveToken OAuth method');

                    const model = UsersController.getModel();

                    const resp = model.findOne({
                        where: {
                            Email: 'eric@youri.ch'
                        }
                    }).then((inst) => {
                        let user: User;

                        if (!inst || !(user = inst.get()))
                            throw new Error('user not found');

                        // const obj: Token = {
                        //     id: user.Id,
                        //     username: user.Email
                        // };
                        token.client = client;
                        token.user = user;

                        return token;
                    });// .catch(() => {console.info('error (harps)')});

                    return resp;
                },
                verifyScope: (token: Token, scope: string|string[]) => {
                    console.info('In verifyScope OAuth method');
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