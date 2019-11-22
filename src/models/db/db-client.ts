import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table, AllowNull, HasMany } from 'sequelize-typescript';
import { DbAccessToken } from './db-access-token';

// @dbEntity
@Table({ modelName: 'exchange', tableName: 'Exchange' })
export class DbClient extends Model<DbClient> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    public Id?: number;

    @AllowNull(false)
    @Column(DataType.STRING(80))
    ClientId!: string;

    @AllowNull
    @Column(DataType.STRING(256))
    public ClientSecret?: string;

    @AllowNull
    @Column(DataType.TEXT)
    Grants?: string;

    @AllowNull(false)
    @Column(DataType.STRING(100))
    Name!: string;

    @AllowNull
    @Column(DataType.TEXT)
    RedirectUris?: string;

    @HasMany((): typeof Model => DbAccessToken)
    public AccessTokens?: DbAccessToken[];
}
