import {
    Sequelize,
    Instance,
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
import {DbSetPasswordToken, DbSetPasswordTokenInstance} from "./db-set-password-token";
import {DbAccessToken, DbAccessTokenInstance} from "./db-access-token";

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
    getSetPasswordTokens: HasManyGetAssociationsMixin<DbSetPasswordTokenInstance>;
    setSetPasswordTokens: HasManySetAssociationsMixin<DbSetPasswordTokenInstance, DbSetPasswordTokenInstance['Id']>;
    addSetPasswordTokens: HasManyAddAssociationsMixin<DbSetPasswordTokenInstance, DbSetPasswordTokenInstance['Id']>;
    addSetPasswordToken: HasManyAddAssociationMixin<DbSetPasswordTokenInstance, DbSetPasswordTokenInstance['Id']>;
    createSetPasswordToken: HasManyCreateAssociationMixin<DbSetPasswordToken, DbSetPasswordTokenInstance>;
    removeSetPasswordToken: HasManyRemoveAssociationMixin<DbSetPasswordTokenInstance, DbSetPasswordTokenInstance['Id']>;
    removeSetPasswordTokens: HasManyRemoveAssociationsMixin<DbSetPasswordTokenInstance, DbSetPasswordTokenInstance['Id']>;
    hasSetPasswordToken: HasManyHasAssociationMixin<DbSetPasswordTokenInstance, DbSetPasswordTokenInstance['Id']>;
    hasSetPasswordTokens: HasManyHasAssociationsMixin<DbSetPasswordTokenInstance, DbSetPasswordTokenInstance['Id']>;
    countSetPasswordTokens: HasManyCountAssociationsMixin;

    getAccessTokens: HasManyGetAssociationsMixin<DbAccessTokenInstance>;
    setAccessTokens: HasManySetAssociationsMixin<DbAccessTokenInstance, DbAccessTokenInstance['Id']>;
    addAccessTokens: HasManyAddAssociationsMixin<DbAccessTokenInstance, DbAccessTokenInstance['Id']>;
    addAccessToken: HasManyAddAssociationMixin<DbAccessTokenInstance, DbAccessTokenInstance['Id']>;
    createAccessToken: HasManyCreateAssociationMixin<DbAccessToken, DbAccessTokenInstance>;
    removeAccessToken: HasManyRemoveAssociationMixin<DbAccessTokenInstance, DbAccessTokenInstance['Id']>;
    removeAccessTokens: HasManyRemoveAssociationsMixin<DbAccessTokenInstance, DbAccessTokenInstance['Id']>;
    hasAccessToken: HasManyHasAssociationMixin<DbAccessTokenInstance, DbAccessTokenInstance['Id']>;
    hasAccessTokens: HasManyHasAssociationsMixin<DbAccessTokenInstance, DbAccessTokenInstance['Id']>;
    countAccessTokens: HasManyCountAssociationsMixin;
}
