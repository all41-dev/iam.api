import { ControllerBase } from '@all41-dev/server';
import { Request, Response, Router } from 'express';
import { EntitySetPasswordToken } from '../models/business/entity-set-password-token';

export class SetPasswordTokenController extends ControllerBase {
  constructor() {
    super();
  }

  public static create(): Router {
    const router = Router();

    router.get('/user/:id', SetPasswordTokenController.checkAccess(['/root']), SetPasswordTokenController.getByUser);
    router.post('', SetPasswordTokenController.checkAccess(['/root']), SetPasswordTokenController.post);
    router.patch('/:id', SetPasswordTokenController.checkAccess(['/root']), SetPasswordTokenController.update);
    router.delete('/:id', SetPasswordTokenController.checkAccess(['/root']), SetPasswordTokenController.remove);

    return router;
  }

  public static getByUser(req: Request): void {
    const entity = new EntitySetPasswordToken();

    entity.get(req.params.id, 'IdUser');
  }

  public static post(req: Request, res: Response): void {
    const entity = new EntitySetPasswordToken();
    
    entity.post(req.body).then((data): void => {
      res.json(data);
    }, (reason): void => {
      res.status(500);
      res.json(reason);
    });

  }

  public static update(req: Request, res: Response): void {
    const entity = new EntitySetPasswordToken();

    entity.put(req.body).then((data): void => {
      res.json(data);
    }, (reason): void => {
      res.status(500);
      res.json(reason);
    });
  }

  public static remove(req: Request, res: Response): void {
    const entity = new EntitySetPasswordToken();

    entity.del(req.params.id, 'IdUser').then((data): void => {
      res.json(data);
    }, (reason): void => {
      res.status(500);
      res.json(reason);
    });
  }
}
