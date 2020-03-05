import { Db } from '@all41/server';
import { DbAccessToken } from './db-access-token';
import { DbRessource } from './db-ressource';
import { DbSetPasswordToken } from './db-set-password-token';
import { DbScope } from './db-scope';

export class IamDb extends Db {
  public async init(): Promise<void> {
    await this._init();
    IamDb.inst = this;
    this.sequelize.addModels([DbRessource, DbAccessToken, DbSetPasswordToken, DbScope]);
  }
}
