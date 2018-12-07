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

        UsersApi.inst.req = req;
        UsersApi.inst.res = res;

        const oauthSrv = IftOAuth2Server.getInstance({
            requireClientAuthentication: {password: false},
            allowExtendedTokenAttributes: true
        });

        oauthSrv.token()(req, res, next).then((token: Token) => {
            console.info(inspect(token));
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

    public static getModel(): Model<Sequelize.Instance<DbUser>, DbUser> {
        return UsersApi.inst.sequelize.models.user as Model<Sequelize.Instance<DbUser>, DbUser>;
    }
}