import { Router, Request, Response } from "express";
import {UsersApi} from "../users-api";
import {DbSetPasswordToken} from "../models/db/setPasswordToken";
import {FindOptions} from "sequelize";
import {EntitySetPasswordToken} from "../models/db/entity-set-password-token";

const router: Router = Router();

/**
 * Returns all users, if page or size are missing, returns all records
 * @param {number} page - page # to return
 * @param {number} size - page size
 * @param {string} filter - filter string
 */
router.get('/', (req: Request, res: Response) => {
    const options: FindOptions<DbSetPasswordToken> = {};
    const entity = new EntitySetPasswordToken();

    entity.setPagination(req, options);
    entity.setFilter(req, options);

    entity.doGet(UsersApi.inst.sequelize.models.setPasswordToken, options, res);
});

router.get('/user/:id', (req: Request, res: Response): void => {
    const options: FindOptions<DbSetPasswordToken> = {};
    const entity = new EntitySetPasswordToken();

    entity.setPagination(req, options);

    const userId = Number(req.params.id);
    if(isNaN(userId)){
        throw new Error(`User id must be a number, received value is: ${req.params.id}`);
    }
    options.where = {
        IdUser: userId
    };

    entity.doGet(UsersApi.inst.sequelize.models.setPasswordToken, options, res);
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
    const model = UsersApi.inst.sequelize.models.setPasswordToken;
    const entity = new EntitySetPasswordToken();

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
    const model = UsersApi.inst.sequelize.models.setPasswordToken;
    const entity = new EntitySetPasswordToken();
    const options: FindOptions<DbSetPasswordToken> = {where: {Id: req.params.id}};

    try {
        entity.update(req, options, model, res);
    } catch (e) {
        res.statusCode = 400;
        res.send({message: e.message});
    }
});

router.delete('/:id', (req: Request, res: Response) => {
    const model = UsersApi.inst.sequelize.models.setPasswordToken;
    const entity = new EntitySetPasswordToken();
    const options: FindOptions<DbSetPasswordToken> = {where: {Id: req.params.id}};

    try {
        entity.delete(req, options, model, res);
    } catch (e) {
        res.statusCode = 400;
        res.send({message: e.message});
    }
});

console.log("registring example routes");
export const SetPasswordTokenController: Router = router;