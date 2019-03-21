import {Instance, Sequelize, Model, INTEGER, STRING, DATE, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, BelongsToCreateAssociationMixin} from "sequelize";
import {DbEntity, SequelizeAttributes} from "@informaticon/devops.base-microservice";
import {DbUser, DbUserInstance} from "./db-user";
import {DbClient, DbClientInstance} from "./db-client";

export class DbAccessToken extends DbEntity {
    public IdUser!: number;
    public IdClient!: number;
    public TokenValue!: string;
    public ExpiresAt!: Date;
    public Scopes!: string;

    public user?: DbUser | DbUser['Id'];
    public client?: DbClient | DbClient['Id'];

    // public CreatedAt: number | undefined;// timestamp
    // public UpdatedAt: number | undefined// timestamp

    static factory = (sequelize: Sequelize): Model<IDbAccessTokenInstance, DbAccessToken> => {
        const attr: SequelizeAttributes<DbAccessToken> = {
            Id : { type: INTEGER, autoIncrement: true, primaryKey: true},
            IdUser : { type: INTEGER, },
            IdClient : { type: INTEGER, },
            TokenValue : { type: STRING, },
            ExpiresAt : { type: DATE, },// todo refactor type
            Scopes: { type: STRING, }
        };
        const def =  sequelize.define<IDbAccessTokenInstance, DbAccessToken>('dbAccessToken', attr, { tableName: "AccessTokens" });

        def.associate = models => {
            def.belongsTo(models.user, {as: 'user', foreignKey: 'IdUser'});
            def.belongsTo(models.client, {as: 'client', foreignKey: 'IdClient'});
        };

        return def as any;
    };
}

export interface IDbAccessTokenInstance extends Instance<DbAccessToken>, DbAccessToken {
    getUser: BelongsToGetAssociationMixin<DbUserInstance>;
    setUser: BelongsToSetAssociationMixin<DbUserInstance, DbUserInstance['Id']>;
    createUser: BelongsToCreateAssociationMixin<DbUser, DbUserInstance>;

    getClient: BelongsToGetAssociationMixin<DbClientInstance>;
    setClient: BelongsToSetAssociationMixin<DbClientInstance, DbClientInstance['Id']>;
    createClient: BelongsToCreateAssociationMixin<DbClient, DbClientInstance>;
}
