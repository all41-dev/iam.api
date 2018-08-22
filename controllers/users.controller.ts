import { Router, Request, Response } from "express";
import {UsersApi} from "../users-api";
import {Sequelize} from "sequelize";

const router: Router = Router();

/**
 * Returns all users, if page or size are missing, returns all records
 * @param {number} page - page # to return
 * @param {number} size - page size
 * @param {string} filter - filter string
 */
router.get('/', (req: Request, res: Response) => {
    const page = req.query.page;
    const size = req.query.pageSize;
    const filter = req.query.filter;

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
router.post('/authenticate', (req: Request, res: Response) => {
    // Receives the user email and password
    // Retrieves the user record
    // Make the hash from the user provided password and stored salt
    // Compare with stored hash
    // Returns true or false
    // NOTE: This method is to be consumed exclusively from the oauth microservice
});
router.put('/change-password', (req: Request, res: Response) => {
    // Receives a change password token ( covers new user and lost password scenarios)
    // Receives a new password string
    // Try to retrieve the token from db
    // If exists and valid, invoke the save password process
});
router.post('/', (req: Request, res: Response) => {
    // Receives email address
    // Validates correctness and uniqueness of the email
    // Saves new user in db
    // Invoke the change password token process
});
router.post('/lost-password/:email', (req: Request, res: Response) => {
    // Receives email address
    // Verify that email exists in db
    // if yes invoke the change password token process
});

// Save password (private function)
// receives email and password
// Considers that permission to set the password has been checked already
// Generates salt value
// Generate hash value from provided password and generated salt
// create or update user entry with salt and hash

// Create change password token
// Considers that permission to create the token has been checked already
// Verify existing token for the user
// if exists then update validity
// if not exists create (generate token value and store)
// Send an email to the user with the token value
// Wording of the email will change whether the token is for a new user or a lost password

console.log("registring example routes");
export const UsersController: Router = router;