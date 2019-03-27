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

export class DbClient extends DbEntity {

  public static factory = (sequelize: Sequelize): Model<IDbClientInstance, DbClient> => {
    const attr: SequelizeAttributes<DbClient> = {
      ClientId: { type: STRING },
      ClientSecret: { type: STRING },
      Grants: { type: STRING },
      Id: { type: INTEGER, autoIncrement: true, primaryKey: true },
      Name: { type: STRING },
      RedirectUris: { type: STRING },
    };
    const def = sequelize.define<IDbClientInstance, DbClient>('client', attr, { tableName: 'Clients' });

    def.associate = (models) => {
      def.hasMany(models.accessToken, { as: 'accessTokens', foreignKey: 'IdClient' });
    };

    return def as any;
  }

  public static getGrants = (client: DbClient): string[] | undefined => {
    return client.Grants ?
      client.Grants.split('|') :
      undefined;
  }

  // noinspection JSUnusedGlobalSymbols
  public static setGrants = (client: DbClient, grants: string[]): void => {
    client.Grants = grants.join('|');
  }

  public ClientId!: string;
  public ClientSecret?: string;
  public Name!: string;
  public RedirectUris?: string;
  public Grants?: string;

  public accessTokens?: DbAccessToken[] | Array<DbAccessToken['Id']>;

}

export interface IDbClientInstance extends Instance<DbClient>, DbClient {
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
