import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table, AllowNull, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { DbClient } from './db-client';
import { DbUser } from './db-user';

// @dbEntity
@Table({ modelName: 'exchange', tableName: 'Exchange' })
export class DbAccessToken extends Model<DbAccessToken> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    public Id?: number;

    @ForeignKey((): typeof Model => DbClient)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    IdClient!: number;

    @ForeignKey((): typeof Model => DbUser)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    IdUser!: number;

    @AllowNull
    @Column(DataType.TEXT)
    Scopes?: string;

    @AllowNull(false)
    @Column(DataType.STRING(256))
    TokenValue!: string;

    @AllowNull(false)
    @Column(DataType.DATE)
    ExpiresAt!: Date;

    @BelongsTo((): typeof Model => DbClient)
    public client?: DbClient;

    @BelongsTo((): typeof Model => DbUser)
    public user?: DbUser;
}
