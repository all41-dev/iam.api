import { Api } from '@all41-dev/server';
import { Router, Request, Response } from 'express';
import { OAuthController } from './controllers/oauth.controller';
import { SetPasswordTokenController } from './controllers/set-password-token.controller';
import { UsersController } from './controllers/users.controller';

/** Hosts route definitions and sequelize model initialization */
export class IdentityApi extends Api<IdentityApi> {
  public static inst: IdentityApi;
  public static req: Request;
  public static res: Response;
  public setStaticInst(): void { IdentityApi.inst = this; }

  public init(): Router {

    this.router.use('/api/users', UsersController.create());
    this.router.use('/api/set-password-token', SetPasswordTokenController.create());
    this.router.use('/', OAuthController.create());
    this.router.use('/iam', OAuthController.create());

    return this.router;
  }
}
