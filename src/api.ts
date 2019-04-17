import { ApiBase, IApiOptions } from '@informaticon/devops.base-microservice';
import { Request, Response } from 'express';
import { OAuthController } from './controllers/oauth.controller';
import { SetPasswordTokenController } from './controllers/set-password-token.controller';
import { UsersController } from './controllers/users.controller';
import { DbAccessToken } from './models/db/db-access-token';
import { DbClient } from './models/db/db-client';
import { DbSetPasswordToken } from './models/db/db-set-password-token';
import { DbUser } from './models/db/db-user';

/** Hosts route definitions and sequelize model initialization */
export class Api extends ApiBase {
  public static req: Request;
  public static res: Response;
  public static accessMsRootUrl: string;

  public init(options: IApiOptions) {
    if (options && options.config) {
      Api.accessMsRootUrl = (options.config as any).accessMsRootUrl;
    }
    this.sequelizeInit(options.sequelize, {
      accessToken: DbAccessToken,
      client: DbClient,
      setPasswordToken: DbSetPasswordToken,
      user: DbUser,
    });

    this.router.use('/api/users', UsersController.create());
    this.router.use('/api/set-password-token', SetPasswordTokenController.create());
    this.router.use('/', OAuthController.create());

    return this.router;
  }
}
