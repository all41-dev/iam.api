import {Sequelize, INTEGER, STRING, Model, Instance, HasManyGetAssociationsMixin, HasManySetAssociationsMixin, HasManyAddAssociationsMixin, HasManyAddAssociationMixin, HasManyCreateAssociationMixin, HasManyRemoveAssociationMixin, HasManyRemoveAssociationsMixin, HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyCountAssociationsMixin} from "sequelize";
import {DbEntity, SequelizeAttributes} from "@informaticon/devops.base-microservice";
import {DbAccessToken, IDbAccessTokenInstance} from "./db-access-token";

export class DbClient extends DbEntity {
    ClientId!: string;
    ClientSecret?: string;
    Name!: string;
    RedirectUris?: string;
    Grants?: string;

    public accessTokens?: DbAccessToken[] | DbAccessToken['Id'][];

    static factory = (sequelize: Sequelize): Model<DbClientInstance, DbClient> => {
        const attr: SequelizeAttributes<DbClient> = {
            Id : { type: INTEGER, autoIncrement: true, primaryKey: true },
            ClientId : { type: STRING, },
            ClientSecret : { type: STRING, },
            Name : { type: STRING, },
            RedirectUris : { type: STRING, },
            Grants: { type: STRING, },
        };
        const def = sequelize.define<DbClientInstance, DbClient>('client', attr, { tableName: "Clients"});

        def.associate = models => {
            def.hasMany(models.accessToken, {as: 'accessTokens', foreignKey: 'IdClient'});
        };

        return def as any;
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

export interface DbClientInstance extends Instance<DbClient>, DbClient {
    getAccessTokens: HasManyGetAssociationsMixin<IDbAccessTokenInstance>;
    setAccessTokens: HasManySetAssociationsMixin<IDbAccessTokenInstance, IDbAccessTokenInstance['Id']>;
    addAccessTokens: HasManyAddAssociationsMixin<IDbAccessTokenInstance, IDbAccessTokenInstance['Id']>;
    addAccessToken: HasManyAddAssociationMixin<IDbAccessTokenInstance, IDbAccessTokenInstance['Id']>;
    createAccessToken: HasManyCreateAssociationMixin<DbAccessToken, IDbAccessTokenInstance>;
    removeAccessToken: HasManyRemoveAssociationMixin<IDbAccessTokenInstance, IDbAccessTokenInstance['Id']>;
    removeAccessTokens: HasManyRemoveAssociationsMixin<IDbAccessTokenInstance, IDbAccessTokenInstance['Id']>;
    hasAccessToken: HasManyHasAssociationMixin<IDbAccessTokenInstance, IDbAccessTokenInstance['Id']>;
    hasAccessTokens: HasManyHasAssociationsMixin<IDbAccessTokenInstance, IDbAccessTokenInstance['Id']>;
    countAccessTokens: HasManyCountAssociationsMixin;
}
