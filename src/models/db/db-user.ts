import { DbEntity, SequelizeAttributes } from '@informaticon/devops.base-microservice';
import {
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManySetAssociationsMixin,
  Instance,
  INTEGER,
  Model,
  Sequelize,
  STRING,
} from 'sequelize';
import { DbAccessToken, IDbAccessTokenInstance } from './db-access-token';
import { DbSetPasswordToken, IDbSetPasswordTokenInstance } from './db-set-password-token';

export class DbUser extends DbEntity {

  public static factory = (sequelize: Sequelize): Model<IDbUserInstance, DbUser> => {
    const attr: SequelizeAttributes<DbUser> = {
      Email: { type: STRING },
      Hash: { type: STRING },
      Id: { type: INTEGER, autoIncrement: true, primaryKey: true },
      Salt: { type: STRING },
    };
    const def = sequelize.define<IDbUserInstance, DbUser>('user', attr, { tableName: 'Users' });

    def.associate = (models) => {
      def.hasMany(models.setPasswordToken, { as: 'setPasswordTokens', foreignKey: 'IdUser' });
      def.hasMany(models.accessToken, { as: 'accessTokens', foreignKey: 'IdUser' });
    };

    return def as any;
  }

  public Email: string | undefined;
  public Hash?: string;
  public Salt?: string;

  public setPasswordTokens?: DbSetPasswordToken[] | Array<DbSetPasswordToken['Id']>;
  public accessTokens?: DbAccessToken[] | Array<DbAccessToken['Id']>;

}

export interface IDbUserInstance extends Instance<DbUser>, DbUser {
  getSetPasswordTokens: HasManyGetAssociationsMixin<IDbSetPasswordTokenInstance>;
  setSetPasswordTokens: HasManySetAssociationsMixin<IDbSetPasswordTokenInstance, IDbSetPasswordTokenInstance['Id']>;
  addSetPasswordTokens: HasManyAddAssociationsMixin<IDbSetPasswordTokenInstance, IDbSetPasswordTokenInstance['Id']>;
  addSetPasswordToken: HasManyAddAssociationMixin<IDbSetPasswordTokenInstance, IDbSetPasswordTokenInstance['Id']>;
  createSetPasswordToken: HasManyCreateAssociationMixin<DbSetPasswordToken, IDbSetPasswordTokenInstance>;
  removeSetPasswordToken: HasManyRemoveAssociationMixin<IDbSetPasswordTokenInstance, IDbSetPasswordTokenInstance['Id']>;
  removeSetPasswordTokens: HasManyRemoveAssociationsMixin<IDbSetPasswordTokenInstance, IDbSetPasswordTokenInstance['Id']>;
  hasSetPasswordToken: HasManyHasAssociationMixin<IDbSetPasswordTokenInstance, IDbSetPasswordTokenInstance['Id']>;
  hasSetPasswordTokens: HasManyHasAssociationsMixin<IDbSetPasswordTokenInstance, IDbSetPasswordTokenInstance['Id']>;
  countSetPasswordTokens: HasManyCountAssociationsMixin;

  getAccessTokens: HasManyGetAssociationsMixin<IDbAccessTokenInstance>;
  setAccessTokens: HasManySetAssociationsMixin<IDbAccessTokenInstance, IDbAccessTokenInstance['Id']>;
  addAccessTokens: HasManyAddAssociationsMixin<IDbAccessTokenInstance, IDbAccessTokenInstance['Id']>;
  addAccessToken: HasManyAddAssociationMixin<IDbAccessTokenInstance, IDbAccessTokenInstance['Id']>;
  createAccessToken: HasManyCreateAssociationMixin<DbAccessToken, IDbAccessTokenInstance>;
  removeAccessToken: HasManyRemoveAssociationMixin<IDbAccessTokenInstance, IDbAccessTokenInstance['Id']>;
  removeAccessTokens: HasManyRemoveAssociationsMixin<IDbAccessTokenInstance, IDbAccessTokenInstance['Id']>;
  hasAccessToken: HasManyHasAssociationMixin<IDbAccessTokenInstance, IDbAccessTokenInstance['Id']>;
  hasAccessTokens: HasManyHasAssociationsMixin<IDbAccessTokenInstance, IDbAccessTokenInstance['Id']>;
  countAccessTokens: HasManyCountAssociationsMixin;
}
