import { Router, Request, Response } from "express";
import {UsersApi} from "../users-api";
import {DbUser, DbUserInstance} from "../models/db/user";
import {FindOptions, Model} from "sequelize";
import {EntityUser} from "../models/db/entity-user";
import * as Sequelize from "sequelize";
import {EntitySetPasswordToken} from "../models/db/entity-set-password-token";
import {DbSetPasswordToken, DbSetPasswordTokenInstance} from "../models/db/setPasswordToken";
import Rand from "csprng";
import * as Bcrypt from "bcrypt"

const router: Router = Router();

const getModel = (): Model<Sequelize.Instance<DbUser>, DbUser> => {
    return UsersApi.inst.sequelize.models.user as Model<Sequelize.Instance<DbUser>, DbUser>;
};

/**
 * Returns all users, if page or size are missing, returns all records
 * @param {number} page - page # to return
 * @param {number} size - page size
 * @param {string} filter - filter string
 */
router.get('/', (req: Request, res: Response) => {
    const options: FindOptions<DbUser> = {};
    const entity = new EntityUser();

    entity.setPagination(req, options);
    entity.setFilter(req, options);

    entity.doGet(getModel(), options, res);
});

router.get('/:id', (req: Request, res: Response): void => {
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

    entity.doGet(getModel(), options, res);
});

router.get('/from-token/:token', (req: Request, res: Response): void => {
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
router.post('/authenticate', (req: Request, res: Response) => {
    // to be implemented when oauth microservice will require this function
});

/**
 * @summary Receives a change password token ( covers new user and lost password scenarios)
 * Receives a new password string
 * Try to retrieve the token from db
 * If exists and valid, invoke the save password process
 */
router.patch('/change-password/:token', (req: Request, res: Response) => {
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
        tokenModel.find(options).then(async (spt: DbSetPasswordTokenInstance) =>
            spt.getUser().then(async (user) => {
                console.info('password: ' + req.body.password);
                const salt = Bcrypt.genSaltSync(10);
                const hash = Bcrypt.hashSync(req.body.password, salt);
                user.update({
                    Salt: salt,
                    Hash: hash
                }).then((updatedUser) => {
                    spt.destroy().then(() => res.json())
                })
            }));
    });
});

/**
 * @summary Creates a user entry
 * Receives email address
 * Validates correctness and uniqueness of the email
 * Saves new user in db
 * Invoke the change password token process
 * @param email
 */
router.post('/', (req: Request, res: Response) => {
    const entity = new EntityUser();

    try {
        entity.create(req, getModel(), res);
    } catch (e) {
        res.statusCode = 400;
        res.send({message: e.message});
    }
});

/**
 * @summary Creates a user entry
 * Receives email address
 * Validates correctness and uniqueness of the email
 * Saves new user in db
 * Invoke the change password token process
 * @param email
 */
router.patch('/:id', (req: Request, res: Response) => {
    const entity = new EntityUser();
    const options: FindOptions<DbUser> = {where: {Id: req.params.id}};

    try {
        entity.update(req, options, getModel(), res);
    } catch (e) {
        res.statusCode = 400;
        res.send({message: e.message});
    }
});

router.delete('/:id', (req: Request, res: Response) => {
    const entity = new EntityUser();
    const options: FindOptions<DbUser> = {where: {Id: req.params.id}};

    try {
        entity.delete(req, options, getModel(), res);
    } catch (e) {
        res.statusCode = 400;
        res.send({message: e.message});
    }
});

/**
 *  @summary Sends a lost password token if email exists
 *  Verify that email exists in db
 *  if yes invoke the change password token process
 *  @param email
 */
router.post('/lost-password/:email', (req: Request, res: Response) => {
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
            const eu = new EntitySetPasswordToken();
            eu.createSetPasswordToken(user[0], 'lost password message -> tbd');
    });
});

// Save password (private function)
// receives email and password
// Considers that permission to set the password has been checked already
// Generates salt value
// Generate hash value from provided password and generated salt
// create or update user entry with salt and hash


console.log("registring example routes");
export const UsersController: Router = router;