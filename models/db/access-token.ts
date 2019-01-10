import * as Sequelize from "sequelize";
import {DbEntity, SequelizeAttributes} from "@informaticon/devops.base-microservice";
import {DbUser, DbUserInstance} from "./user";
import {DbClient, DbClientInstance} from "./client";

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

    static factory = (sequelize: Sequelize.Sequelize): Sequelize.Model<DbAccessTokenInstance, DbAccessToken> => {
        const attr: SequelizeAttributes<DbAccessToken> = {
            Id : { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
            IdUser : { type: Sequelize.INTEGER, },
            IdClient : { type: Sequelize.INTEGER, },
            TokenValue : { type: Sequelize.STRING, },
            ExpiresAt : { type: Sequelize.DATE, },// todo refactor type
            Scopes: { type: Sequelize.STRING, }
        };
        const def =  sequelize.define<DbAccessTokenInstance, DbAccessToken>('dbAccessToken', attr, { tableName: "AccessTokens" });

        def.associate = models => {
            def.belongsTo(models.user, {as: 'user', foreignKey: 'IdUser'});
            def.belongsTo(models.client, {as: 'client', foreignKey: 'IdClient'});
        };

        return def;
    };
}

export interface DbAccessTokenInstance extends Sequelize.Instance<DbAccessToken>, DbAccessToken {
    getUser: Sequelize.BelongsToGetAssociationMixin<DbUserInstance>;
    setUser: Sequelize.BelongsToSetAssociationMixin<DbUserInstance, DbUserInstance['Id']>;
    createUser: Sequelize.BelongsToCreateAssociationMixin<DbUser, DbUserInstance>;

    getClient: Sequelize.BelongsToGetAssociationMixin<DbClientInstance>;
    setClient: Sequelize.BelongsToSetAssociationMixin<DbClientInstance, DbClientInstance['Id']>;
    createClient: Sequelize.BelongsToCreateAssociationMixin<DbClient, DbClientInstance>;
}
