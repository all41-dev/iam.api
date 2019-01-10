import {Request, Response, NextFunction} from "express";
import {UsersApi} from "../users-api";
import {DbUser} from "../models/db/user";
import {FindOptions, Model} from "sequelize";
import {EntityUser} from "../models/db/entity-user";
import * as Sequelize from "sequelize";
import {EntitySetPasswordToken} from "../models/db/entity-set-password-token";
import {DbSetPasswordToken, DbSetPasswordTokenInstance} from "../models/db/setPasswordToken";
import * as Bcrypt from "bcrypt"
import * as Jwt from "jsonwebtoken"
import {OAuth2Server} from "oauth2-server"
import {IftOAuth2Server} from "../models/ift-oauth2-server";
import {ControllerBase} from '@informaticon/devops.base-microservice'
import * as express from "express";
import NodeRSA from 'node-rsa';
let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

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

    // noinspection JSUnusedLocalSymbols
    public getAll(req: Request, res: Response, next: NextFunction) {
        if( !this.hasAccess([
            'Access/Read',
            'Microservices/Users/Users'
        ], req.headers.authorization)) {
            res.status(403)
            res.send();
            return;
        }
        //Since here, the user is considered as authorized
        const options: FindOptions<DbUser> = {};
        const entity = new EntityUser();

        entity.setPagination(req, options);
        entity.setFilter(req, options);

        entity.doGet(UsersController.getModel(), options, res);
    }

    // noinspection JSUnusedLocalSymbols
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

    // noinspection JSUnusedLocalSymbols
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
        UsersApi.inst.req = req;
        UsersApi.inst.res = res;

        const oauthSrv = IftOAuth2Server.getInstance({
            requireClientAuthentication: {password: false},
            allowExtendedTokenAttributes: true
        });

        oauthSrv.token()(req, res, next);
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
        if( !this.hasAccess([
            'Access/Create',
            'Microservices/Users/Users'
        ], req.headers.authorization)) {
            res.status(403)
            res.send();
            return;
        }
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

    private hasAccess(scope: string[], authorizationHeader: string|undefined): boolean {
        if (authorizationHeader === undefined || !authorizationHeader.toLowerCase().startsWith('bearer ')){
            return false;
        }
        const jwtString = authorizationHeader.substr(7);
        const tokenWithHeader = Jwt.decode(jwtString, { complete: true }) as any;

        if ( tokenWithHeader === null){ return false; }
        const kid = tokenWithHeader.header.kid;

        const certs = JSON.parse(this.httpGet('http://localhost:3000/oauth2/certs'));
        const keyDef = (certs.keys as [{kid: string, n: string, e: string}]).find(k => k.kid === kid);
        if(keyDef === undefined) { return false; }

        const key = new NodeRSA({ b: 256});
        key.importKey({
           n: Buffer.from(keyDef.n, 'base64'),
           e: Buffer.from(keyDef.e, 'base64')
        }/*, 'pkcs1-public-pem'*/);
        const publicKey = key.exportKey('pkcs1-public-pem');

        const token = Jwt.verify(jwtString, publicKey) as {scope: string};
        if (token === null) {
            throw new Error('Expected the token to be an Object')
        }

        const permissionsStr = token.scope;
        //concat flatten array of arrays to array
        const permissions: string[][] = [].concat.apply([], permissionsStr.split(';')
            .map((p: string) => {
                // functions for cartesian product, from -> https://stackoverflow.com/a/43053803/1073588
                const f = (a: any, b: any) => [].concat(...a.map((d: any) => b.map((e: any) => [].concat(d, e))));
                const cartesian = (a: string[], b?: string[], ...c: string[][]): string[] => (b ? cartesian(f(a, b), ...c) : a);

                const permissionScopes = p.split('+')
                    .map((scope: string) => {
                        // process permission scope
                        if (scope.indexOf('|') === -1) {
                            return [scope]
                        }
                        // the scope path contains '|', then build one scope by combination
                        const optionsArr = scope.split('/')
                            .map(slashPart => slashPart.split('|'));
                        if (optionsArr === undefined){}
                        const cart =  cartesian(optionsArr[0], ...optionsArr.slice(1)).map((sc: any) => sc.join('/'));
                        return cart;
                    });
                const cart2 = cartesian(permissionScopes[0], ...permissionScopes.slice(1));
                // console.info(cart2);
                // console.info('---');
                return cart2;
            }));
        return permissions.some(p => {
            if (scope.length !== p.length) {  return false; }
            let localScope: string[] = JSON.parse(JSON.stringify(scope))
            let matches = 0;

            for(;localScope.length > 0;) {
                for(let i = 0;i < p.length; i++) {
                    if (localScope[0].startsWith(p[i])) {
                        matches++;
                        //break;
                    }
                }
                localScope = localScope.slice(1);
            }
            console.info(p);
            console.info(scope);
            console.info(`matches: ${matches} scopes: ${scope.length}`);
            return matches === scope.length;
        });
    }

    private httpGet(url: string): string
    {
        if(url === 'http://localhost:3000/oauth2/certs'){
            //server calling himself causes a freeze
            return '{\n' +
                '            "keys": [\n' +
                '                {\n' +
                '                    "kty": "RSA",\n' +
                '                    "alg": "RS256",\n' +
                '                    "use": "sig",\n' +
                '                    "kid": "4129db2ea1860d2e871ee48506287fb05b04ca3f",\n' +
                '                    "n": "sphx6KhpetKXk/oR8vrDxwN8aaLsiBsYNvrWCA9oDcubuDD/YLnXH65QnNoRdlOW0+dCAStZVB3VtHR9qyUbqCvS443xC59nDrEHEpTO8+zeHzkkIp4zVU0vvowZlkVqZZA032dCEaB4LSIzZoxWa1OHSfmQgR90zMVDCI98YCNvTGrdJ66GrYRVdjnd5Jg5ebZVtfa9VMN1WBro02pLJ8K/cux/i7KO0zovDYhID90wNU/q8F1nzlDcs5TiPPBBTNWfGLMRVec2xbIpQ9T3Ou0Yn4xPUimwVRSrvkcCF1MTbm55/Jv9EdRbrVk46n3qZMbx0cHDGCUjaAcKbkVkcQ==",\n' +
                '                    "e": "AQAB"\n' +
                '                }\n' +
                '            ]\n' +
                '        }'
        }
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", url, false ); // false for synchronous request
        xmlHttp.send( null );
        return xmlHttp.responseText;
    }
}
