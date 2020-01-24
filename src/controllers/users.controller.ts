import { ControllerBase } from '@harps/server';
import * as Bcrypt from 'bcrypt';
import { NextFunction, Request, Response, Router } from 'express';
import { FindOptions, Model } from 'sequelize';
import { IdentityApi } from '../api';
import { EntitySetPasswordToken } from '../models/business/entity-set-password-token';
import { EntityUser } from '../models/business/entity-user';
import { DbSetPasswordToken } from '../models/db/db-set-password-token';
import { DbRessource } from '../models/db/db-ressource';
import { IftOAuth2Server } from '../models/ift-oauth2-server';

// tslint:disable-next-line: no-var-requires
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

export class UsersController extends ControllerBase {
  public static create() {
    const router = Router();

    router.get('/', UsersController.checkAccess(['Access/Read', 'Microservices/Identity-Service/Users']), UsersController.getAll);
    router.get('/:id', UsersController.checkAccess(['Access/Read', 'Microservices/Identity-Service/Users']), UsersController.getById);
    // tslint:disable-next-line: max-line-length
    router.get('/from-token/:token', UsersController.getFromToken);
    router.post('/authenticate', UsersController.authenticate);
    // tslint:disable-next-line: max-line-length
    router.patch('/change-password/:token', UsersController.changePassword);
    router.post('/', UsersController.checkAccess(['Access/Create', 'Microservices/Identity-Service/Users']), UsersController.post);
    router.patch('/:id', UsersController.checkAccess(['Access/Update', 'Microservices/Identity-Service/Users']), UsersController.update);
    router.delete('/:id', UsersController.checkAccess(['Access/Delete', 'Microservices/Identity-Service/Users']), UsersController.remove);
    router.post('/lost-password/:email', UsersController.lostPassword);

    return router;
  }

  // noinspection JSUnusedLocalSymbols
  public static getAll(req: Request, res: Response, next: NextFunction) {
    // Since here, the user is considered as authorized
    const entity = new EntityUser();

    entity.setFilter(req.query.filter);
    entity.setIncludes(req.query.include);

    entity.get().then((data): void => {
      res.json(data);
    }, (reason): void => {
      res.status(500);
      res.json(reason);
    });
  }

  // noinspection JSUnusedLocalSymbols
  public static getById(req: Request, res: Response, next: NextFunction) {
    const entity = new EntityUser();
    entity.setIncludes(req.query.include);
    entity.getByPk(req.params.id).then((data): void => {
      res.json(data);
    }, (reason): void => {
      res.status(500);
      res.json(reason);
    });
  }

  // noinspection JSUnusedLocalSymbols
  public static getFromToken(req: Request, res: Response, next: NextFunction) {
    const entity = new EntityUser();

    const token = req.params.token;
    if (token === undefined) {
      throw new Error('Token is not set');
    }

    const options: FindOptions = {
      where: {
        TokenHash: token,
      },
    };

    entity.doGetFromToken(options, res);
  }

  public static authenticate(req: Request, res: Response, next: NextFunction): void {
    IdentityApi.req = req;
    IdentityApi.res = res;

    const oauthSrv = IftOAuth2Server.getInstance({
      allowExtendedTokenAttributes: true,
      requireClientAuthentication: { password: false },
    });
    oauthSrv.token()(req, res, next);
  }

  public static changePassword(req: Request, res: Response, next: NextFunction) {
    const token = req.params.token;
    const options: FindOptions = {
      where: {
        TokenHash: token,
      },
    };
    DbSetPasswordToken.findOne(options).then(async (spt: DbSetPasswordToken | null) => {
      const inst = spt as DbSetPasswordToken;
      const user = inst.User;
      if (!user) {
        throw new Error('user id null');
      }

      const salt = Bcrypt.genSaltSync(10);
      const hash = Bcrypt.hashSync(req.body.password, salt);
      user.update({
        Hash: hash,
        Salt: salt,
      }).then(() => {
        if (spt === null) {
          throw new Error('setPasswordToken is null');
        }
        spt.destroy().then(() => {
          const eu = new EntityUser();
          res.json(eu.dbToClient(user));
        });
      });
    });
  }

  public static post(req: Request, res: Response, next: NextFunction) {
    const entity = new EntityUser();

    entity.post(req.body).then((data): void => {
      res.json(data);
    }, (reason): void => {
      res.status(500);
      res.json(reason);
    });
  }

  public static update(req: Request, res: Response, next: NextFunction) {
    const entity = new EntityUser();
    if (!req.params.id || !parseInt(req.params.id)) { throw new Error('number id parameter must be provided when updating an exchange'); }

    entity.put(req.body).then((data): void => {
      res.json(data);
    }, (reason): void => {
      res.status(500);
      res.json(reason);
    });
  }

  public static remove(req: Request, res: Response, next: NextFunction) {
    const entity = new EntityUser();

    try {
      entity.del(req.params.id, 'uuid');
    } catch (e) {
      res.statusCode = 400;
      res.send({ message: e.message });
    }
  }

  public static async lostPassword(req: Request, res: Response, next: NextFunction) {
    const email: string = req.body.email.toLowerCase();

    if (!EntityUser.emailIsValid(email)) {
      res.statusCode = 400;
      res.send({ message: `The email address ${email} is not valid. The request has been canceled` });
      return;
    }
    if (!await EntityUser.userExists(email)) {
      res.statusCode = 409;
      res.send({ message: `The user ${email} already exists. The request has been canceled.` });
      return;
    }

    DbRessource.findOne({
      where: {
        email,
      },
    }).then((user: DbRessource|null) => {
      if (!user || user.uuid === undefined) {
        throw new Error('user not found');
      }
      const eu = new EntitySetPasswordToken();

      // tslint:disable-next-line: max-line-length
      eu.createSetPasswordToken(user.uuid, 'You have requested to reset you password for Informaticon Devops, please click the link below to proceed. If you didn\'t request this, you can ignore this e-mail.');
    });
  }
}
