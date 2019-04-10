import { ControllerBase } from '@informaticon/devops.base-microservice';
import * as Bcrypt from 'bcrypt';
import { NextFunction, Request, Response, Router } from 'express';
import { FindOptions, Instance, Model } from 'sequelize';
import { Api } from '../api';
import { EntitySetPasswordToken } from '../models/business/entity-set-password-token';
import { EntityUser } from '../models/business/entity-user';
import { DbSetPasswordToken, IDbSetPasswordTokenInstance } from '../models/db/db-set-password-token';
import { DbUser, IDbUserInstance } from '../models/db/db-user';
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
    const options: FindOptions<DbUser> = {};
    const entity = new EntityUser();

    entity.setPagination(req, options);
    entity.setFilter(req, options);

    entity.doGet(UsersController.getModel(), options, res);
  }

  // noinspection JSUnusedLocalSymbols
  public static getById(req: Request, res: Response, next: NextFunction) {
    const options: FindOptions<DbUser> = {};
    const entity = new EntityUser();

    entity.setPagination(req, options);

    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      throw new Error(`User id must be a number, received value is: ${req.params.id}`);
    }
    options.where = {
      Id: userId,
    };

    entity.doGet(UsersController.getModel(), options, res);
  }

  // noinspection JSUnusedLocalSymbols
  public static getFromToken(req: Request, res: Response, next: NextFunction) {
    const entity = new EntityUser();

    const token = req.params.token;
    if (token === undefined) {
      throw new Error('Token is not set');
    }

    const options: FindOptions<DbSetPasswordToken> = {
      where: {
        TokenHash: token,
      },
    };

    const setPasswordTokenModel = Api.inst.sequelize.models.setPasswordToken as
      Model<Instance<DbSetPasswordToken>, DbSetPasswordToken>;

    entity.doGetFromToken(setPasswordTokenModel, options, res);
  }

  public static authenticate(req: Request, res: Response, next: NextFunction) {
    Api.req = req;
    Api.res = res;

    const oauthSrv = IftOAuth2Server.getInstance({
      allowExtendedTokenAttributes: true,
      requireClientAuthentication: { password: false },
    });

    oauthSrv.token()(req, res, next);
  }

  public static changePassword(req: Request, res: Response, next: NextFunction) {
    const tokenModel = Api.inst.sequelize.models.setPasswordToken as
      Model<Instance<DbSetPasswordToken>, DbSetPasswordToken>;
    const userModel = Api.inst.sequelize.models.user as
      Model<Instance<DbUser>, DbUser>;

    const token = req.params.token;
    tokenModel.sync().then(async () => {
      const options: FindOptions<DbSetPasswordToken> = {
        where: {
          TokenHash: token,
        },
      };
      tokenModel.find(options).then(async (spt: Instance<DbSetPasswordToken> | null) => {
        const inst = spt as IDbSetPasswordTokenInstance;
        return inst.getUser().then(async (user: IDbUserInstance | null) => {
          if (user === null) {
            throw new Error('user id null');
          }

          const salt = Bcrypt.genSaltSync(10);
          const hash = Bcrypt.hashSync(req.body.password, salt);
          user.update({
            Hash: hash,
            Salt: salt,
          }).then((updatedUser) => {
            if (spt === null) {
              throw new Error('setPasswordToken is null');
            }
            spt.destroy().then(() => {
              const eu = new EntityUser();
              res.json(eu.dbToClient(user));
            });
          });
        });
      });
    });
  }

  public static post(req: Request, res: Response, next: NextFunction) {
    Api.req = req;
    Api.res = res;
    const entity = new EntityUser();

    try {
      entity.create(req, UsersController.getModel(), res);
    } catch (e) {
      res.statusCode = 400;
      res.send({ message: e.message });
    }
  }

  public static update(req: Request, res: Response, next: NextFunction) {
    const entity = new EntityUser();
    const options: FindOptions<DbUser> = { where: { Id: req.params.id } };

    try {
      entity.update(req, options, UsersController.getModel(), res);
    } catch (e) {
      res.statusCode = 400;
      res.send({ message: e.message });
    }
  }

  public static remove(req: Request, res: Response, next: NextFunction) {
    const entity = new EntityUser();
    const options: FindOptions<DbUser> = { where: { Id: req.params.id } };

    try {
      entity.delete(req, options, UsersController.getModel(), res);
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

    Api.inst.sequelize.models.user.find({
      where: {
        email,
      },
    }).then((user: DbUser[]) => {
      if (user.length === 0 || user[0].Id === undefined) {
        throw new Error('user not found');
      }
      const eu = new EntitySetPasswordToken();
      eu.createSetPasswordToken(user[0].Id, 'You have requested to reset you password for Informaticon Devops, please click the link below to proceed. If you didn\'t request this, you can ignore this e-mail.');
    });
  }

  public static getModel(): Model<Instance<DbUser>, DbUser> {
    return Api.inst.sequelize.models.user as Model<Instance<DbUser>, DbUser>;
  }

  constructor() {
    super();
  }
}
