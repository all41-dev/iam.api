import { Default, Column, DataType, Model, PrimaryKey, Table, AllowNull, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { DbRessource } from './db-ressource';

// @dbEntity
@Table({ modelName: 'accessToken', tableName: 'accessToken' })
export class DbAccessToken extends Model<DbAccessToken> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    public uuid?: string;
  
    @ForeignKey((): typeof Model => DbRessource)
    @AllowNull(false)
    @Column(DataType.UUID)
    IdClient!: string;

    @ForeignKey((): typeof Model => DbRessource)
    @AllowNull(false)
    @Column(DataType.UUID)
    IdUser!: string;

    @AllowNull
    @Column(DataType.TEXT)
    Scopes?: string;

    @AllowNull(false)
    @Column(DataType.STRING(256))
    TokenValue!: string;

    @AllowNull(false)
    @Column(DataType.DATE)
    ExpiresAt!: Date;

    @BelongsTo((): typeof Model => DbRessource)
    public client?: DbRessource;

    @BelongsTo((): typeof Model => DbRessource)
    public user?: DbRessource;
}
