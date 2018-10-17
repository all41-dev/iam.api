import { Router, Request, Response } from "express";
import * as crypto from "crypto"
import {UsersApi} from "../users-api";
import * as Sequelize from "sequelize";
import {DbUser} from "../models/db/user";
import {DbSetPasswordToken} from "../models/db/setPasswordToken";
import {FindOptions} from "sequelize";
import {EntityUser} from "../models/db/entity-user";

const router: Router = Router();

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

    entity.doGet(UsersApi.inst.sequelize.models.user, options, res);
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

    entity.doGet(UsersApi.inst.sequelize.models.user, options, res);
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

router.put('/change-password', (req: Request, res: Response) => {
    // Receives a change password token ( covers new user and lost password scenarios)
    // Receives a new password string
    // Try to retrieve the token from db
    // If exists and valid, invoke the save password process
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
    const email: string =  req.body.email.toLowerCase();

    if (!emailIsValid(email)) {
        res.statusCode = 400;
        res.send({message: `The email address ${email} is not valid. Creation has been canceled`});
        return;
    }
    userExists(email).then( (exists: boolean) => {
        if (exists){
            res.statusCode = 409;
            res.send({message: `The user ${email} already exists. Creation has been canceled.`});
            return;
        }

        // Email is valid and doesn't exists yet
        UsersApi.inst.sequelize.models.user.create({Email: email, Hash: "hashvalue", Salt: "saltvalue"})
            .then( (user: DbUser) => {
                createSetPasswordToken(user, 'create user message -> tbd');
                res.send(user);
            });
    });
});

/**
 *  @summary Sends a lost password token if email exists
 *  Verify that email exists in db
 *  if yes invoke the change password token process
 *  @param email
 */
router.post('/lost-password/:email', (req: Request, res: Response) => {
    const email: string =  req.body.email.toLowerCase();

    if (!emailIsValid(email)) {
        res.statusCode = 400;
        res.send({message: `The email address ${email} is not valid. The request has been canceled`});
        return;
    }
    if (!userExists(email)){
        res.statusCode = 409;
        res.send({message: `The user ${email} already exists. The request has been canceled.`});
        return;
    }

    UsersApi.inst.sequelize.models.user.find({where: {
            email: email
        }}).then((user: DbUser[]) => {
        createSetPasswordToken(user[0], 'lost password message -> tbd');
    });
});

// Save password (private function)
// receives email and password
// Considers that permission to set the password has been checked already
// Generates salt value
// Generate hash value from provided password and generated salt
// create or update user entry with salt and hash

const emailIsValid = (email: string) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

//const userExists = (email: string) => {
function userExists(email: string) {
    const options: any = {where: {
        email: email
    }};

    return UsersApi.inst.sequelize.models.user.count(options).then((nb: number) => nb > 0);
}

/** @summary Creates a change password token
 * Considers that permission to create the token has been checked already
 * Verify existing token for the user
 * if exists then update validity
 * if not exists create (generate token value and store)
 * Send an email to the user with the token value
 * Wording of the email will change whether the token is for a new user or a lost password
 */
const createSetPasswordToken = (user: DbUser, message: string) => {
    UsersApi.inst.sequelize.models.setPasswordToken.findAll({ where: {expires: { [Sequelize.Op.lt]: new Date()} }})
        .then((spts: any) => {
        // delete expired tokens for all users
         for (let spt of spts){
             spt.destroy();
         }

        const tokenDurationSec = 3600 * 24; //1 day
        let token : DbSetPasswordToken;
        //if(user.setPasswordTokens === undefined){
        //    user.setPasswordTokens = [];
        //}

        UsersApi.inst.sequelize.models.setPasswordToken.findAll({where: { idUser: user.Id}}).then( (spt: DbSetPasswordToken[])  => {
            if(spt !== null && spt !== undefined && spt.length > 0) {
                token = spt[0];
            } else
            {
                if(user.Id === undefined) {
                    throw new Error();
                }

                const dt = new Date();
                dt.setSeconds(dt.getSeconds() + tokenDurationSec);
                token = {
                    Id: undefined,
                    Expires: dt,
                    Message: message,
                    IdUser: user.Id,
                    TokenHash: crypto.randomBytes(64).toString('hex')
                };
            }

            UsersApi.inst.sequelize.models.setPasswordToken.create(token).then((t: DbSetPasswordToken) => {
                // send email to user
            });
        })
    });
};



console.log("registring example routes");
export const UsersController: Router = router;