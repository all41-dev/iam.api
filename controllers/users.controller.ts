import { Router, Request, Response } from "express";
import {UsersApi} from "../users-api";
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
    const model = UsersApi.inst.sequelize.models.user;
    const entity = new EntityUser();

    try {
        entity.create(req, model, res);
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
    const model = UsersApi.inst.sequelize.models.user;
    const entity = new EntityUser();
    const options: FindOptions<DbUser> = {where: {Id: req.params.id}};

    try {
        entity.update(req, options, model, res);
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
            const eu = new EntityUser();
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