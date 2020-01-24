import { Db } from '@harps/server';
import { DbAccessToken } from './db-access-token';
import { DbRessource } from './db-ressource';
import { DbSetPasswordToken } from './db-set-password-token';
import { DbScope } from './db-scope';

export class ManagerDb extends Db {
  public async init(): Promise<void> {
    await this._init();
    ManagerDb.inst = this;
    this.sequelize.addModels([DbAccessToken, DbRessource, DbSetPasswordToken, DbScope]);
  }
}
