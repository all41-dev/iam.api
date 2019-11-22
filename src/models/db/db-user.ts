import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table, AllowNull, HasMany } from 'sequelize-typescript';
import { DbAccessToken } from './db-access-token';
import { DbSetPasswordToken } from './db-set-password-token';

// @dbEntity
@Table({ modelName: 'exchange', tableName: 'Exchange' })
export class DbUser extends Model<DbUser> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public Id?: number;

  @AllowNull(false)
  @Column(DataType.STRING(200))
  Email!: string;

  @AllowNull
  @Column(DataType.STRING(128))
  Hash?: string;

  @AllowNull
  @Column(DataType.STRING(128))
  Salt?: string;

  @HasMany((): typeof Model => DbSetPasswordToken)
  public SetPasswordTokens?: DbSetPasswordToken[];

  @HasMany((): typeof Model => DbAccessToken)
  public AccessTokens?: DbAccessToken[];
}
