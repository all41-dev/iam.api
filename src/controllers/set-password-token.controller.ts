import { ControllerBase } from '@harps/server';
import { NextFunction, Request, Response, Router } from 'express';
import { FindOptions } from 'sequelize';
import { EntitySetPasswordToken } from '../models/business/entity-set-password-token';
import { DbSetPasswordToken } from '../models/db/db-set-password-token';
import { RequestHandler, ParamsDictionary } from 'express-serve-static-core';

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
    const options: FindOptions = {};
    const entity = new EntitySetPasswordToken();

    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      throw new Error(`User id must be a number, received value is: ${req.params.id}`);
    }
    options.where = {
      IdUser: userId,
    };

    entity.get(req.params.id);
  }

  // noinspection JSUnusedLocalSymbols, JSMethodCanBeStatic
  public static post(req: Request, res: Response, next: NextFunction) {
    const entity = new EntitySetPasswordToken();
    
    entity.post(req.body).then((data): void => {
        res.json(data);
      }, (reason): void => {
        res.status(500);
        res.json(reason);
      });

  }

  // noinspection JSUnusedLocalSymbols, JSMethodCanBeStatic
  public static update(req: Request, res: Response, next: NextFunction) {
    const entity = new EntitySetPasswordToken();

      entity.put(req.body).then((data): void => {
        res.json(data);
      }, (reason): void => {
        res.status(500);
        res.json(reason);
      });
  }

  // noinspection JSUnusedLocalSymbols, JSMethodCanBeStatic
  public static remove(req: Request, res: Response, next: NextFunction) {
    const entity = new EntitySetPasswordToken();

      entity.del(req.params.id).then((data): void => {
        res.json(data);
      }, (reason): void => {
        res.status(500);
        res.json(reason);
      });
  }

  constructor() {
    super();
  }
}
