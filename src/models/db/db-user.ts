import {
    Instance,
    Sequelize,
    Model,
    INTEGER,
    STRING,
    HasManyGetAssociationsMixin,
    HasManySetAssociationsMixin,
    HasManyAddAssociationsMixin,
    HasManyAddAssociationMixin,
    HasManyCreateAssociationMixin,
    HasManyRemoveAssociationMixin,
    HasManyRemoveAssociationsMixin,
    HasManyHasAssociationMixin,
    HasManyHasAssociationsMixin, HasManyCountAssociationsMixin
} from "sequelize";
import {DbEntity, SequelizeAttributes} from "@informaticon/devops.base-microservice";
import {DbSetPasswordToken, IDbSetPasswordTokenInstance} from "./db-set-password-token";
import {DbAccessToken, IDbAccessTokenInstance} from "./db-access-token";

export class DbUser extends DbEntity {
    Email: string | undefined;
    Hash?: string;
    Salt?: string;

    public setPasswordTokens?: DbSetPasswordToken[] | DbSetPasswordToken['Id'][];
    public accessTokens?: DbAccessToken[] | DbAccessToken['Id'][];

    static factory = (sequelize: Sequelize): Model<DbUserInstance, DbUser> => {
        const attr: SequelizeAttributes<DbUser> = {
            Id : { type: INTEGER, autoIncrement: true, primaryKey: true },
            Email : { type: STRING, },
            Hash : { type: STRING, },
            Salt : { type: STRING, }
        };
        const def = sequelize.define<DbUserInstance, DbUser>('user', attr, { tableName: "Users" });

        def.associate = models => {
            def.hasMany(models.setPasswordToken, {as: 'setPasswordTokens', foreignKey: 'IdUser'});
            def.hasMany(models.accessToken, {as: 'accessTokens', foreignKey: 'IdUser'});
        };

        return def as any;
    };
}

export interface DbUserInstance extends Instance<DbUser>, DbUser {
    getSetPasswordTokens: HasManyGetAssociationsMixin<IDbSetPasswordTokenInstance>;
    setSetPasswordTokens: HasManySetAssociationsMixin<IDbSetPasswordTokenInstance, IDbSetPasswordTokenInstance['Id']>;
    addSetPasswordTokens: HasManyAddAssociationsMixin<IDbSetPasswordTokenInstance, IDbSetPasswordTokenInstance['Id']>;
    addSetPasswordToken: HasManyAddAssociationMixin<IDbSetPasswordTokenInstance, IDbSetPasswordTokenInstance['Id']>;
    createSetPasswordToken: HasManyCreateAssociationMixin<DbSetPasswordToken, IDbSetPasswordTokenInstance>;
    removeSetPasswordToken: HasManyRemoveAssociationMixin<IDbSetPasswordTokenInstance, IDbSetPasswordTokenInstance['Id']>;
    removeSetPasswordTokens: HasManyRemoveAssociationsMixin<IDbSetPasswordTokenInstance, IDbSetPasswordTokenInstance['Id']>;
    hasSetPasswordToken: HasManyHasAssociationMixin<IDbSetPasswordTokenInstance, IDbSetPasswordTokenInstance['Id']>;
    hasSetPasswordTokens: HasManyHasAssociationsMixin<IDbSetPasswordTokenInstance, IDbSetPasswordTokenInstance['Id']>;
    countSetPasswordTokens: HasManyCountAssociationsMixin;

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
