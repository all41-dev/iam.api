import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table, AllowNull, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { DbUser } from './db-user';

// @dbEntity
@Table({ modelName: 'exchange', tableName: 'Exchange' })
export class DbSetPasswordToken extends Model<DbSetPasswordToken> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public Id?: number;

  @ForeignKey((): typeof Model => DbUser)
  @AllowNull
  @Column(DataType.INTEGER)
  IdUser?: number;

  @AllowNull(false)
  @Column(DataType.DATE)
  Expires!: Date;

  @AllowNull
  @Column(DataType.STRING(2000))
  Message?: string;

  @AllowNull(false)
  @Column(DataType.STRING(200))
  TokenHash!: string;

  @BelongsTo((): typeof Model => DbUser)
  public User?: DbUser;
}
