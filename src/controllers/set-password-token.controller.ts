import { ControllerBase } from '@informaticon/devops.base-microservice';
import { NextFunction, Request, Response, Router } from 'express';
import { FindOptions, Instance, Model } from 'sequelize';
import { Api } from '../api';
import { EntitySetPasswordToken } from '../models/business/entity-set-password-token';
import { DbSetPasswordToken, IDbSetPasswordTokenInstance } from '../models/db/db-set-password-token';

export class SetPasswordTokenController extends ControllerBase {

  public static create() {
    const router = Router();

    // tslint:disable-next-line: max-line-length
    router.get('/user/:id', SetPasswordTokenController.checkAccess(['Access/Read', 'Microservices/Identity-Service/Tokens']), SetPasswordTokenController.getByUser);
    // tslint:disable-next-line: max-line-length
    router.post('', SetPasswordTokenController.checkAccess(['Access/Create', 'Microservices/Identity-Service/Tokens']), SetPasswordTokenController.post);
    // tslint:disable-next-line: max-line-length
    router.patch('/:id', SetPasswordTokenController.checkAccess(['Access/Read', 'Microservices/Identity-Service/Tokens']), SetPasswordTokenController.update);
    // tslint:disable-next-line: max-line-length
    router.delete('/:id', SetPasswordTokenController.checkAccess(['Access/Delete', 'Microservices/Identity-Service/Tokens']), SetPasswordTokenController.remove);

    return router;
  }

  public static getByUser(req: Request, res: Response) {
    const options: FindOptions<DbSetPasswordToken> = {};
    const entity = new EntitySetPasswordToken();

    entity.setPagination(req, options);

    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      throw new Error(`User id must be a number, received value is: ${req.params.id}`);
    }
    options.where = {
      IdUser: userId,
    };

    entity.doGet(SetPasswordTokenController.getModel(), options, res);
  }

  // noinspection JSUnusedLocalSymbols, JSMethodCanBeStatic
  public static post(req: Request, res: Response, next: NextFunction) {
    Api.req = req;
    Api.res = res;

    const entity = new EntitySetPasswordToken();

    try {
      entity.create(req, SetPasswordTokenController.getModel(), res);
    } catch (e) {
      res.statusCode = 400;
      res.send({ message: e.message });
    }

  }

  // noinspection JSUnusedLocalSymbols, JSMethodCanBeStatic
  public static update(req: Request, res: Response, next: NextFunction) {
    const entity = new EntitySetPasswordToken();
    const options: FindOptions<DbSetPasswordToken> = { where: { Id: req.params.id } };

    try {
      entity.update(req, options, SetPasswordTokenController.getModel(), res);
    } catch (e) {
      res.statusCode = 400;
      res.send({ message: e.message });
    }
  }

  // noinspection JSUnusedLocalSymbols, JSMethodCanBeStatic
  public static remove(req: Request, res: Response, next: NextFunction) {
    const entity = new EntitySetPasswordToken();
    const options: FindOptions<DbSetPasswordToken> = { where: { Id: req.params.id } };

    try {
      entity.delete(req, options, SetPasswordTokenController.getModel(), res);
    } catch (e) {
      res.statusCode = 400;
      res.send({ message: e.message });
    }
  }

  private static getModel(): Model<IDbSetPasswordTokenInstance, DbSetPasswordToken> {
    return Api.inst.sequelize.models.setPasswordToken as Model<IDbSetPasswordTokenInstance, DbSetPasswordToken>;
  }

  constructor() {
    super();
  }
}
