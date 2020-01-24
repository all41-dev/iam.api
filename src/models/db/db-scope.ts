import { Default, Column, DataType, Model, PrimaryKey, Table, AllowNull } from 'sequelize-typescript';

// @dbEntity
@Table({ modelName: 'scope', tableName: 'scope' })
export class DbScope extends Model<DbScope> {

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public uuid?: string;

  @AllowNull(false)
  @Column(DataType.STRING(20000))
  public ressourcePaths!: string;

  @AllowNull
  @Column(DataType.STRING(200))
  description?: string;
}
