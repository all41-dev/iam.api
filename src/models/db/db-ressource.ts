import { Default, Column, DataType, Model, PrimaryKey, Table, AllowNull, HasMany } from 'sequelize-typescript';
import { DbAccessToken } from './db-access-token';
import { DbSetPasswordToken } from './db-set-password-token';

// @dbEntity
@Table({ modelName: 'ressource', tableName: 'ressource' })
export class DbRessource extends Model<DbRessource> {

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public uuid?: string;

  @AllowNull(false)
  @Column(DataType.STRING(2000))
  public path!: string;

  /** for application ressource */
  @AllowNull
  @Column(DataType.STRING(200))
  secret?: string;

  /** for application ressource */
  @AllowNull
  @Column(DataType.STRING(2000))
  redirectUris?: string;

  /** for users */
  @AllowNull
  @Column(DataType.STRING(200))
  email?: string;

  /** for users, groups, clients(app), and optionnaly all ressources */
  @AllowNull
  @Column(DataType.STRING(200))
  name?: string;

  /** for users */
  @AllowNull
  @Column(DataType.STRING(128))
  hash?: string;

  /** for users */
  @AllowNull
  @Column(DataType.STRING(128))
  salt?: string;

  @AllowNull
  @Column(DataType.UUID)
  public parentUuid?: string;

  /** for users and groups */
  @AllowNull
  @Column(DataType.STRING(2000))
  public scopeUuids?: string;

  /** for users (and groups while nested groups implemented) */
  @AllowNull
  @Column(DataType.STRING(2000))
  public groupUuids?: string;

  @HasMany((): typeof Model => DbSetPasswordToken)
  public setPasswordTokens?: DbSetPasswordToken[];

  @HasMany((): typeof Model => DbAccessToken)
  public accessTokens?: DbAccessToken[];
}
