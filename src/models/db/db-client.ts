import * as Sequelize from "sequelize";
import {DbEntity, SequelizeAttributes} from "@informaticon/devops.base-microservice";
import {DbAccessToken, DbAccessTokenInstance} from "./db-access-token";

export class DbClient extends DbEntity {
    ClientId!: string;
    ClientSecret?: string;
    Name!: string;
    RedirectUris?: string;
    Grants?: string;

    public accessTokens?: DbAccessToken[] | DbAccessToken['Id'][];

    static factory = (sequelize: Sequelize.Sequelize): Sequelize.Model<DbClientInstance, DbClient> => {
        const attr: SequelizeAttributes<DbClient> = {
            Id : { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            ClientId : { type: Sequelize.STRING, },
            ClientSecret : { type: Sequelize.STRING, },
            Name : { type: Sequelize.STRING, },
            RedirectUris : { type: Sequelize.STRING, },
            Grants: { type: Sequelize.STRING, },
        };
        const def = sequelize.define<DbClientInstance, DbClient>('client', attr, { tableName: "Clients"});

        def.associate = models => {
            def.hasMany(models.accessToken, {as: 'accessTokens', foreignKey: 'IdClient'});
        };

        return def;
    };

    static getGrants = (client: DbClient): string[]|undefined => {
        return client.Grants ?
            client.Grants.split('|') :
            undefined;
    };

    // noinspection JSUnusedGlobalSymbols
    static setGrants = (client: DbClient, grants: string[]): void => {
        client.Grants = grants.join('|');
    }
}

export interface DbClientInstance extends Sequelize.Instance<DbClient>, DbClient {
    getAccessTokens: Sequelize.HasManyGetAssociationsMixin<DbAccessTokenInstance>;
    setAccessTokens: Sequelize.HasManySetAssociationsMixin<DbAccessTokenInstance, DbAccessTokenInstance['Id']>;
    addAccessTokens: Sequelize.HasManyAddAssociationsMixin<DbAccessTokenInstance, DbAccessTokenInstance['Id']>;
    addAccessToken: Sequelize.HasManyAddAssociationMixin<DbAccessTokenInstance, DbAccessTokenInstance['Id']>;
    createAccessToken: Sequelize.HasManyCreateAssociationMixin<DbAccessToken, DbAccessTokenInstance>;
    removeAccessToken: Sequelize.HasManyRemoveAssociationMixin<DbAccessTokenInstance, DbAccessTokenInstance['Id']>;
    removeAccessTokens: Sequelize.HasManyRemoveAssociationsMixin<DbAccessTokenInstance, DbAccessTokenInstance['Id']>;
    hasAccessToken: Sequelize.HasManyHasAssociationMixin<DbAccessTokenInstance, DbAccessTokenInstance['Id']>;
    hasAccessTokens: Sequelize.HasManyHasAssociationsMixin<DbAccessTokenInstance, DbAccessTokenInstance['Id']>;
    countAccessTokens: Sequelize.HasManyCountAssociationsMixin;
}
