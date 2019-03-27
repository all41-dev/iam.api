import { DbEntity, SequelizeAttributes } from '@informaticon/devops.base-microservice';
import {
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  DATE,
  Instance,
  INTEGER,
  Model,
  Sequelize,
  STRING,
} from 'sequelize';
import { DbClient, IDbClientInstance } from './db-client';
import { DbUser, IDbUserInstance } from './db-user';

export class DbAccessToken extends DbEntity {

  // public CreatedAt: number | undefined;// timestamp
  // public UpdatedAt: number | undefined// timestamp

  public static factory = (sequelize: Sequelize): Model<IDbAccessTokenInstance, DbAccessToken> => {
    const attr: SequelizeAttributes<DbAccessToken> = {
      ExpiresAt: { type: DATE }, // todo refactor type
      Id: { type: INTEGER, autoIncrement: true, primaryKey: true },
      IdClient: { type: INTEGER },
      IdUser: { type: INTEGER },
      Scopes: { type: STRING },
      TokenValue: { type: STRING },
    };
    const def = sequelize.define<IDbAccessTokenInstance, DbAccessToken>('dbAccessToken', attr, { tableName: 'AccessTokens' });

    def.associate = (models) => {
      def.belongsTo(models.user, { as: 'user', foreignKey: 'IdUser' });
      def.belongsTo(models.client, { as: 'client', foreignKey: 'IdClient' });
    };

    return def as any;
  }

  public IdUser!: number;
  public IdClient!: number;
  public TokenValue!: string;
  public ExpiresAt!: Date;
  public Scopes!: string;

  public user?: DbUser | DbUser['Id'];
  public client?: DbClient | DbClient['Id'];
}

export interface IDbAccessTokenInstance extends Instance<DbAccessToken>, DbAccessToken {
  getUser: BelongsToGetAssociationMixin<IDbUserInstance>;
  setUser: BelongsToSetAssociationMixin<IDbUserInstance, IDbUserInstance['Id']>;
  createUser: BelongsToCreateAssociationMixin<DbUser, IDbUserInstance>;

  getClient: BelongsToGetAssociationMixin<IDbClientInstance>;
  setClient: BelongsToSetAssociationMixin<IDbClientInstance, IDbClientInstance['Id']>;
  createClient: BelongsToCreateAssociationMixin<DbClient, IDbClientInstance>;
}
