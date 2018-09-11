import { Router, Request, Response } from "express";
import * as crypto from "crypto"
import {UsersApi} from "../users-api";
import {Sequelize} from "sequelize";
import {DbUser} from "../models/db/user";

const router: Router = Router();

/**
 * Returns all users, if page or size are missing, returns all records
 * @param {number} page - page # to return
 * @param {number} size - page size
 * @param {string} filter - filter string
 */
router.get('/', (req: Request, res: Response) => {
    const page: number | undefined = req.query.page;
    const size: number | undefined = req.query.pageSize;
    const filter: string | undefined = req.query.filter;

    const options: any = page !== undefined && size !== undefined ?
        // if both page & size are set, then apply pagination
        { offset : (page - 1) * size, limit : +size } :
        // no pagination
        {};

    if (filter !== undefined) {
        options.where = {
            email: {[UsersApi.sequelize.Op.like]: `%${filter}%`}
        }
    }

    UsersApi.model.user.all(options).then((users: any) => {
        res.send(users);
    });

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
        res.send({message: `The email address ${email} is not valid. Creation has been canceled`})
        return;
    }
    if (userExists(email)){
        res.statusCode = 409;
        res.send({message: `The user ${email} already exists. Creation has been canceled.`})
        return;
    }

    // Email is valid and doesn't exists yet
    UsersApi.model.user.create({Email: email})
        .then( (user: DbUser) => {
            createSetPasswordToken(user, 'create user message -> tbd');
            res.send(user);
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

    const user = UsersApi.model.user.find({where: {
            email: email
        }});
    createSetPasswordToken(user, 'lost password message -> tbd');
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
function* userExists(email: string) {
    const options: any = {where: {
        email: email
    }};

    const res = yield UsersApi.model.user.find(options);
    return res.length > 0;
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
    DbSetPasswordToken.findAll({ where: {expires: { [Sequelize.Op.lt]: new Date()} }})
        .then((spts: DbSetPasswordToken[]) => {
        // delete expired tokens for all users
         for (let spt of spts){
             spt.destroy();
         }
    });
    const tokenDurationSec = 3600 * 24; //1 day
    let token : DbSetPasswordToken;
    //if(user.setPasswordTokens === undefined){
    //    user.setPasswordTokens = [];
    //}

    DbSetPasswordToken.findAll({where: { idUser: user.id}}).then(spt => {
        if(spt !== null && spt !== undefined) {

        //if(user.setPasswordTokens.length > 0) {
        //    token = user.setPasswordTokens[0];
        } else
        {
            token = new DbSetPasswordToken({
                tokenHash: crypto.randomBytes(64).toString('hex'),
                idUser: user.id
            });
            // user.$add('setPasswordTokens', token);
        }

        const dt = new Date();
        dt.setSeconds(dt.getSeconds() + tokenDurationSec);
        token.expires = dt;
        token.message = message;
        token.save().then(t => {
            // send email to user
        });
    })
};



console.log("registring example routes");
export const UsersController: Router = router;