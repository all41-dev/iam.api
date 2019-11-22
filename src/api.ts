import { Api } from '@harps/server';
import { Router } from 'express';
import { OAuthController } from './controllers/oauth.controller';
import { SetPasswordTokenController } from './controllers/set-password-token.controller';
import { UsersController } from './controllers/users.controller';

/** Hosts route definitions and sequelize model initialization */
export class IdentityApi extends Api {
  public static inst: IdentityApi;
  public setStaticInst(): void { IdentityApi.inst = this; }

  public init(): Router {

    this.router.use('/api/users', UsersController.create());
    this.router.use('/api/set-password-token', SetPasswordTokenController.create());
    this.router.use('/', OAuthController.create());

    return this.router;
  }
}
