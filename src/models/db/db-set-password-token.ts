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
import { DbUser, IDbUserInstance } from './db-user';

export class DbSetPasswordToken extends DbEntity {

  public static factory = (sequelize: Sequelize): Model<IDbSetPasswordTokenInstance, DbSetPasswordToken> => {
    const attr: SequelizeAttributes<DbSetPasswordToken> = {
      Expires: { type: DATE },
      Id: { type: INTEGER, autoIncrement: true, primaryKey: true },
      IdUser: { type: INTEGER },
      Message: { type: STRING },
      TokenHash: { type: STRING },
    };
    const def = sequelize.define<IDbSetPasswordTokenInstance, DbSetPasswordToken>('setPasswordToken', attr, { tableName: 'SetPasswordTokens' });

    def.associate = (models) => {
      def.belongsTo(models.user, { as: 'user', foreignKey: 'IdUser' });
    };

    return def as any;
  }

  // @ForeignKey(() => DbUser)
  public IdUser!: number;
  public Message!: string;
  public Expires!: Date;
  public TokenHash!: string;

  public user?: DbUser | DbUser['Id'];

  // public CreatedAt: number | undefined;// timestamp
  // public UpdatedAt: number | undefined// timestamp

}

export interface IDbSetPasswordTokenInstance extends Instance<DbSetPasswordToken>, DbSetPasswordToken {
  getUser: BelongsToGetAssociationMixin<IDbUserInstance>;
  setUser: BelongsToSetAssociationMixin<IDbUserInstance, IDbUserInstance['Id']>;
  createUser: BelongsToCreateAssociationMixin<DbUser, IDbUserInstance>;
}
