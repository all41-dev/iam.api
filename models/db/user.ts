import * as Sequelize from "sequelize";
import {DbEntity, SequelizeAttributes} from "@informaticon/base-microservice";
import {DbSetPasswordToken, DbSetPasswordTokenInstance} from "./setPasswordToken";

export class DbUser extends DbEntity {
    Email: string | undefined;
    Hash?: string;
    Salt?: string;

    public setPasswordTokens?: DbSetPasswordToken[] | DbSetPasswordToken['Id'][];

    static factory = (sequelize: Sequelize.Sequelize): Sequelize.Model<DbUserInstance, DbUser> => {
        const attr: SequelizeAttributes<DbUser> = {
            Id : { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            Email : { type: Sequelize.STRING, },
            Hash : { type: Sequelize.STRING, },
            Salt : { type: Sequelize.STRING, }
        };
        const def = sequelize.define<DbUserInstance, DbUser>('user', attr, { tableName: "Users" });

        def.associate = models => {
            def.hasMany(models.setPasswordToken, {as: 'setPasswordTokens', foreignKey: 'IdUser'});
        };

        return def;
    };
}

export interface DbUserInstance extends Sequelize.Instance<DbUser>, DbUser {
    getSetPasswordTokens: Sequelize.HasManyGetAssociationsMixin<DbSetPasswordTokenInstance>;
    setSetPasswordTokens: Sequelize.HasManySetAssociationsMixin<DbSetPasswordTokenInstance, DbSetPasswordTokenInstance['Id']>;
    addSetPasswordTokens: Sequelize.HasManyAddAssociationsMixin<DbSetPasswordTokenInstance, DbSetPasswordTokenInstance['Id']>;
    addSetPasswordToken: Sequelize.HasManyAddAssociationMixin<DbSetPasswordTokenInstance, DbSetPasswordTokenInstance['Id']>;
    createSetPasswordToken: Sequelize.HasManyCreateAssociationMixin<DbSetPasswordToken, DbSetPasswordTokenInstance>;
    removeSetPasswordToken: Sequelize.HasManyRemoveAssociationMixin<DbSetPasswordTokenInstance, DbSetPasswordTokenInstance['Id']>;
    removeSetPasswordTokens: Sequelize.HasManyRemoveAssociationsMixin<DbSetPasswordTokenInstance, DbSetPasswordTokenInstance['Id']>;
    hasSetPasswordToken: Sequelize.HasManyHasAssociationMixin<DbSetPasswordTokenInstance, DbSetPasswordTokenInstance['Id']>;
    hasSetPasswordTokens: Sequelize.HasManyHasAssociationsMixin<DbSetPasswordTokenInstance, DbSetPasswordTokenInstance['Id']>;
    countSetPasswordTokens: Sequelize.HasManyCountAssociationsMixin;
}