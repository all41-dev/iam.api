import {Request, Response, NextFunction} from "express";
import {UsersApi} from "../users-api";
import {DbSetPasswordToken} from "../models/db/setPasswordToken";
import {FindOptions, Model} from "sequelize";
import {EntitySetPasswordToken} from "../models/db/entity-set-password-token";
import * as Sequelize from "sequelize";
import {ControllerBase} from "@informaticon/devops.base-microservice";
import * as express from "express";

console.log("registring example routes");
export class SetPasswordTokenController extends ControllerBase {
    constructor() {
        super();
    }

    public static create(baseUrl: string, server: express.Application) {
        const router = ControllerBase.getNewRouter();

        router.get('/user/:id', (req: Request, res: Response, next: NextFunction) => {
            new SetPasswordTokenController().getByUser(req, res, next);
        });

        router.post('/', (req: Request, res: Response, next: NextFunction) => {
            new SetPasswordTokenController().create(req, res, next);
        });

        router.patch('/:id', (req: Request, res: Response, next: NextFunction) => {
            new SetPasswordTokenController().update(req, res, next);
        });

        router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
            new SetPasswordTokenController().remove(req, res, next);
        });

        server.use(baseUrl, router);
    }

    // noinspection JSMethodCanBeStatic, JSUnusedLocalSymbols
    public getByUser(req: Request, res: Response, next: NextFunction) {
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

        entity.doGet(SetPasswordTokenController.getModel(), options, res);
    }

    // noinspection JSUnusedLocalSymbols, JSMethodCanBeStatic
    public create(req: Request, res: Response, next: NextFunction) {
        const entity = new EntitySetPasswordToken();

        try {
            entity.create(req, SetPasswordTokenController.getModel(), res);
        } catch (e) {
            res.statusCode = 400;
            res.send({message: e.message});
        }

    }

    // noinspection JSUnusedLocalSymbols, JSMethodCanBeStatic
    public update(req: Request, res: Response, next: NextFunction) {
        const entity = new EntitySetPasswordToken();
        const options: FindOptions<DbSetPasswordToken> = {where: {Id: req.params.id}};

        try {
            entity.update(req, options, SetPasswordTokenController.getModel(), res);
        } catch (e) {
            res.statusCode = 400;
            res.send({message: e.message});
        }
    }

    // noinspection JSUnusedLocalSymbols, JSMethodCanBeStatic
    public remove(req: Request, res: Response, next: NextFunction) {
        const entity = new EntitySetPasswordToken();
        const options: FindOptions<DbSetPasswordToken> = {where: {Id: req.params.id}};

        try {
            entity.delete(req, options, SetPasswordTokenController.getModel(), res);
        } catch (e) {
            res.statusCode = 400;
            res.send({message: e.message});
        }
    }

    private static getModel(): Model<Sequelize.Instance<DbSetPasswordToken>, DbSetPasswordToken> {
        return UsersApi.inst.sequelize.models.setPasswordToken as Model<Sequelize.Instance<DbSetPasswordToken>, DbSetPasswordToken>;
    }
}
