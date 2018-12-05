import {Router, Request, Response, NextFunction} from "express";
import {UsersApi} from "../users-api";
import {DbUser} from "../models/db/user";
import {FindOptions, Model} from "sequelize";
import {EntityUser} from "../models/db/entity-user";
import * as Sequelize from "sequelize";
import {EntitySetPasswordToken} from "../models/db/entity-set-password-token";
import {DbSetPasswordToken, DbSetPasswordTokenInstance} from "../models/db/setPasswordToken";
import * as Bcrypt from "bcrypt"
import * as Jwt from "jsonwebtoken"
import {Client, OAuth2Server, Token, Request as OARequest, Response as OAResponse} from "oauth2-server"
import {IftOAuth2Server} from "../models/ift-oauth2-server";
import {ControllerBase} from '@informaticon/base-microservice'
import * as express from "express";
import { inspect } from 'util';
// import Rand from "csprng";

export class UsersController extends ControllerBase {
    constructor() {
        super();
    }

    public static create(baseUrl: string, server: express.Application) {
        let router: express.Router;
        router = express.Router();

        router.get('/', (req: Request, res: Response, next: NextFunction) => {
            new UsersController().getAll(req, res, next);
        });

        router.get('/:id', (req: Request, res: Response, next: NextFunction): void => {
            new UsersController().getById(req, res, next);
        });

        router.get('/from-token/:token', (req: Request, res: Response, next: NextFunction): void => {
            new UsersController().getFromToken(req, res, next);
        });

        /**
         * @summary validates user credentials
         * Make the hash from the user provided password and stored salt
         * Compare with stored hash
         * Returns true or false
         * NOTE: This method is to be consumed exclusively from the oauth microservice
         * @param email
         * @param password
         * @description
         */
        router.post('/authenticate', async (req: Request, res: Response, next: NextFunction) => {
            new UsersController().authenticate(req, res, next);
        });

        /**
         * @summary Receives a change password token ( covers new user and lost password scenarios)
         * Receives a new password string
         * Try to retrieve the token from db
         * If exists and valid, invoke the save password process
         */
        router.patch('/change-password/:token', (req: Request, res: Response, next: NextFunction) => {
            new UsersController().changePassword(req, res, next);
        });

        /**
         * @summary Creates a user entry
         * Receives email address
         * Validates correctness and uniqueness of the email
         * Saves new user in db
         * Invoke the change password token process
         * @param email
         */
        router.post('/', (req: Request, res: Response, next: NextFunction) => {
            new UsersController().create(req, res, next);
        });

        /**
         * @summary Updates a user entry
         */
        router.patch('/:id', (req: Request, res: Response, next: NextFunction) => {
            new UsersController().update(req, res, next);
        });

        router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
            new UsersController().remove(req, res, next);
        });

        /**
         *  @summary Sends a lost password token if email exists
         *  Verify that email exists in db
         *  if yes invoke the change password token process
         *  @param email
         */
        router.post('/lost-password/:email', (req: Request, res: Response, next: NextFunction) => {
            new UsersController().lostPassword(req, res, next);
        });

        server.use(baseUrl, router);
    }

    public getAll(req: Request, res: Response, next: NextFunction) {
        const options: FindOptions<DbUser> = {};
        const entity = new EntityUser();

        entity.setPagination(req, options);
        entity.setFilter(req, options);

        entity.doGet(UsersController.getModel(), options, res);
    }

    public getById(req: Request, res: Response, next: NextFunction) {
        const options: FindOptions<DbUser> = {};
        const entity = new EntityUser();

        entity.setPagination(req, options);

        const userId = Number(req.params.id);
        if(isNaN(userId)){
            throw new Error(`User id must be a number, received value is: ${req.params.id}`);
        }
        options.where = {
        Id: userId
        };

        entity.doGet(UsersController.getModel(), options, res);
    }

    public getFromToken(req: Request, res: Response, next: NextFunction) {
        const entity = new EntityUser();

        const token = req.params.token;
        if(token === undefined){
            throw new Error(`Token is not set`);
        }

        const options: FindOptions<DbSetPasswordToken> = {
            where: {
                TokenHash: token
            }
        };

        const setPasswordTokenModel = UsersApi.inst.sequelize.models.setPasswordToken as
            Model<Sequelize.Instance<DbSetPasswordToken>, DbSetPasswordToken>;

        entity.doGetFromToken(setPasswordTokenModel, options, res);
    }

    public authenticate(req: Request, res: Response, next: NextFunction) {
        const entity = new EntityUser();
        const model = UsersController.getModel();
        const grantType = req.body.grant_type;
        const nonce = req.body.nonce;
        const scope = req.body.scope;
        const username = req.body.username.toLowerCase();
        const password = req.body.password;

        const oauthSrv = IftOAuth2Server.getInstance();

        // const authRes: Token = await oauthSrv.authenticate({
        //     allowBearerTokensInQueryString: true,
        //     scope: 'ift-users'
        // })(req, res, next);
        oauthSrv.token({
            requireClientAuthentication: {password: false}
        })(req, res, next).then((obj: any) => {
            console.info(`authenticate passed, token: ${inspect(obj)}`)
        });

        // model.sync().then(() => {
        //     model.find({
        //         where: {
        //             Email: username
        //         }
        //     }).then((inst) => {
        //
        //         if(inst === null){
        //             const msg = 'user doesn\'t exist';
        //             console.error(msg);
        //             res.status(500).send(msg);
        //             return;
        //         }
        //
        //         const user = inst.toJSON();
        //         const authHash = Bcrypt.hashSync(req.body.password, user.Salt);
        //
        //         if (authHash !== user.Hash){
        //             res.json({error:'bad password'});
        //         }
        //
        //         const token = {
        //             client: {
        //                 id: 1, // is thin required?
        //                 client_id: 'democlient', // to be generated, must be unique (salt?)
        //                 scope: 'profile',
        //                 grants: [
        //                     'authorization_code',
        //                     'password',
        //                     'refresh_token',
        //                     'client_credentials'
        //                 ],
        //                 redirectUris: [
        //                     'http://localhost/cb'
        //                 ]
        //             },
        //             user: {
        //                 id: 2, // is this required?
        //                 username: user.Email,
        //                 scope: 'profile'
        //             },
        //             access_token: '637314e3e61b80effe8cfa4b9a5486c4c5d91c11',
        //             refresh_token: '9b0030f387666fa6f1ea90b539803101540ca1ec',
        //             accessToken: '637314e3e61b80effe8cfa4b9a5486c4c5d91c11',
        //             accessTokenExpiresAt: '2018-11-29T13:12:33.904Z',
        //             refreshToken: '9b0030f387666fa6f1ea90b539803101540ca1ec',
        //             refreshTokenExpiresAt: '2018-12-13T12:12:33.904Z',
        //             scope: 'profile',
        //             id_token: undefined
        //         };
        //
        //         token.id_token = UsersController.getIdToken(token, nonce);
        //
        //         res.json(token);
        //
        //     })});
    }

    public changePassword(req: Request, res: Response, next: NextFunction) {
        const tokenModel = UsersApi.inst.sequelize.models.setPasswordToken as
            Model<Sequelize.Instance<DbSetPasswordToken>, DbSetPasswordToken>;
        const userModel = UsersApi.inst.sequelize.models.user as
            Model<Sequelize.Instance<DbUser>, DbUser>;

        const token = req.params.token;
        tokenModel.sync().then(async () => {
            const options: FindOptions<DbSetPasswordToken> = {
                where: {
                    TokenHash: token
                }
            };
            tokenModel.find(options).then(async (spt: Sequelize.Instance<DbSetPasswordToken>|null) => {
                const inst = spt as DbSetPasswordTokenInstance;
                return inst.getUser().then(async (user) => {
                    if (user === null) throw new Error('user id null');

                    console.info('password: ' + req.body.password);
                    const salt = Bcrypt.genSaltSync(10);
                    const hash = Bcrypt.hashSync(req.body.password, salt);
                    user.update({
                        Salt: salt,
                        Hash: hash
                    }).then((updatedUser) => {
                        if (spt === null) throw new Error('setPasswordToken is null')
                        spt.destroy().then(() => res.json())
                    })
                })});
        });
    }

    public create(req: Request, res: Response, next: NextFunction) {
        const entity = new EntityUser();

        try {
            entity.create(req, UsersController.getModel(), res);
        } catch (e) {
            res.statusCode = 400;
            res.send({message: e.message});
        }
    }

    public update(req: Request, res: Response, next: NextFunction) {
        const entity = new EntityUser();
        const options: FindOptions<DbUser> = {where: {Id: req.params.id}};

        try {
            entity.update(req, options, UsersController.getModel(), res);
        } catch (e) {
            res.statusCode = 400;
            res.send({message: e.message});
        }
    }

    public remove(req: Request, res: Response, next: NextFunction) {
        const entity = new EntityUser();
        const options: FindOptions<DbUser> = {where: {Id: req.params.id}};

        try {
            entity.delete(req, options, UsersController.getModel(), res);
        } catch (e) {
            res.statusCode = 400;
            res.send({message: e.message});
        }
    }

    public lostPassword(req: Request, res: Response, next: NextFunction) {
        const email: string =  req.body.email.toLowerCase();

        if (!EntityUser.emailIsValid(email)) {
            res.statusCode = 400;
            res.send({message: `The email address ${email} is not valid. The request has been canceled`});
            return;
        }
        if (!EntityUser.userExists(email)){
            res.statusCode = 409;
            res.send({message: `The user ${email} already exists. The request has been canceled.`});
            return;
        }

        UsersApi.inst.sequelize.models.user.find({where: {
                email: email
            }}).then((user: DbUser[]) => {
                if (user.length === 0 || user[0].Id === undefined)
                    throw new Error('user not found')
                const eu = new EntitySetPasswordToken();
                eu.createSetPasswordToken(user[0].Id, 'lost password message -> tbd');
        });
    }

    private static getIdToken(token: Token, nonce: string){
        try {
            //const jwt = require('jsonwebtoken');
            return Jwt.sign({
                iss: 'http://localhost:3000',
                aud: token.client.client_id,
                sub: token.user.id,
                // jti: nonce,
                nonce: nonce
            }, '-----BEGIN RSA PRIVATE KEY-----\n' +
                'MIIEowIBAAKCAQEAsphx6KhpetKXk/oR8vrDxwN8aaLsiBsYNvrWCA9oDcubuDD/\n' +
                'YLnXH65QnNoRdlOW0+dCAStZVB3VtHR9qyUbqCvS443xC59nDrEHEpTO8+zeHzkk\n' +
                'Ip4zVU0vvowZlkVqZZA032dCEaB4LSIzZoxWa1OHSfmQgR90zMVDCI98YCNvTGrd\n' +
                'J66GrYRVdjnd5Jg5ebZVtfa9VMN1WBro02pLJ8K/cux/i7KO0zovDYhID90wNU/q\n' +
                '8F1nzlDcs5TiPPBBTNWfGLMRVec2xbIpQ9T3Ou0Yn4xPUimwVRSrvkcCF1MTbm55\n' +
                '/Jv9EdRbrVk46n3qZMbx0cHDGCUjaAcKbkVkcQIDAQABAoIBAAHUG751Evdl9pVW\n' +
                'Rx7EwIJmH7z5JRDTrjDJ6q0Uc01I22RMZCD6ZiB16W9hsDIU8wNiZ8OZTQXWdFyv\n' +
                'oKXC8ICNSlB4IJKs5CI7X8Yp7eCDeVa6gAs2sXHbI3UA/DYUqd02V8Q9y2hgyzoz\n' +
                'EnGnWC8rIMR6IKehydFa56/LwEs/rT/qyB3BwI8BC0pfQu/WONR9ufGeZ2RdGIte\n' +
                'SBWZ+59pIhVIRTvw04hpFiE78gxy/w3SSn0lESNODNorP3H5xsv8Fm10ZLVGWGHq\n' +
                'o/Y+8J+7DVvYesGzY/qcvodyKp80CIGu+kfRah/ELosI1O4RPpRREXJ/e/NweIAM\n' +
                'wc7WnAECgYEA2i0SugRnjWSzde7P0WoSApIg2CxkIMNNezAgp8P8lDre+x5W+lml\n' +
                '4BYdNlOUQFtD9IkdlH0NW+J+lK1Z2WJ3hoqUd71iKOHDYcsCspVI0vVewAUjQdn9\n' +
                'E2GjKbzRAEC5pT9z8QZVQeNFoi+5bec+PyUm6vFPsSqzyL8tI3BvkbECgYEA0Y68\n' +
                'dt3kCioQeYEZbhw6a0hHHOGSOdfbHXXfwa1aK+bg6GqTzBPi6owK1YET+EtIKKqJ\n' +
                '+Ax4wuiyjiPzdL0Ci4qYvv6sytJa5s+Qm1njLY3JcpXk0R7XqAOSpWodFkye4eRl\n' +
                'wYFEFSbPdwYQvI2siXXveR3lf9Wgr4o7PoOW7sECgYApbT2NDKEM+/4Hep0DSny4\n' +
                '+D48TdGFVxAzP+QzdsdS7grA6/Xf+32/mvNZCW2w+qNgn1h6hXQv6kXWvUO+PzAq\n' +
                '381pHxCwao3K191fQ3FcfTLMiy0yp82iDHwKxMt6nM+jTPUa4vT1Wc4zCZTQBYSQ\n' +
                'QOGu4rsbDNyuVX6gqAzHQQKBgB/YJ+2MRIYC5GQCaUHhSkNZRW0vHhBqK+LrMah1\n' +
                '1lkLiavn3jPJ5dasl0zgg49cqUd8uuCVzJgZ0mBlOC7KNiPMWO/VNZ7Qnn2qlxf0\n' +
                'beBTRoSCILZikHT4rgUy/d6QoChFk+z23si0EBzPMCXnBYwR/uUR1Pk7FmL2h5A1\n' +
                'YO9BAoGBAJFE2g4unWFbJHi+XEXl7MHfrx4nEVrD6NKWSxLOoS4YEmJmdnmVQ8qy\n' +
                'YWz+7C0Jxb7m2c+TWWvsmMDfSXiVammCke2kf6FYp+7ZmGo/eFStaSuZ/VY05uQ1\n' +
                'xunvG66XSKQwIIU61jf35Ltj+RLhsBkOgYxdwa4ADQ6/znXI7JzU\n' +
                '-----END RSA PRIVATE KEY-----', {algorithm: 'RS256', keyid: '4129db2ea1860d2e871ee48506287fb05b04ca3f'});
        } catch (ex) {
            console.error(ex.toString());
        }
    }

    public static getModel(): Model<Sequelize.Instance<DbUser>, DbUser> {
        return UsersApi.inst.sequelize.models.user as Model<Sequelize.Instance<DbUser>, DbUser>;
    }
}