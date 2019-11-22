import { Db } from '@harps/server';
import { DbAccessToken } from './db-access-token';
import { DbClient } from './db-client';
import { DbSetPasswordToken } from './db-set-password-token';
import { DbUser } from './db-user';

export class ManagerDb extends Db {
  public async init(): Promise<void> {
    await this._init();
    ManagerDb.inst = this;
    this.sequelize.addModels([DbAccessToken, DbClient, DbSetPasswordToken, DbUser]);
  }
}
