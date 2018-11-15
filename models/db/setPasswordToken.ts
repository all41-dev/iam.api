import * as Sequelize from "sequelize";
import {DbEntity, SequelizeAttributes} from "@informaticon/base-microservice";
import {DbUser, DbUserInstance} from "./user";

export class DbSetPasswordToken extends DbEntity {
    //@ForeignKey(() => DbUser)
    public IdUser!: number;
    public Message!: string;
    public Expires!: Date;
    public TokenHash!: string;

    public user?: DbUser | DbUser['Id'];

    // public CreatedAt: number | undefined;// timestamp
    // public UpdatedAt: number | undefined// timestamp

    static factory = (sequelize: Sequelize.Sequelize): Sequelize.Model<DbSetPasswordTokenInstance, DbSetPasswordToken> => {
        const attr: SequelizeAttributes<DbSetPasswordToken> = {
            Id : { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
            IdUser : { type: Sequelize.INTEGER, },
            Message : { type: Sequelize.STRING, },
            Expires : { type: Sequelize.STRING, },// todo refactor type
            TokenHash: { type: Sequelize.STRING, }
        };
        const def =  sequelize.define<DbSetPasswordTokenInstance, DbSetPasswordToken>('dbSetPasswordToken', attr, { tableName: "SetPasswordTokens" });

        def.associate = models => {
            def.belongsTo(models.user, {as: 'user', foreignKey: 'IdUser'})
        };

        return def;
    };
}

export interface DbSetPasswordTokenInstance extends Sequelize.Instance<DbSetPasswordToken>, DbSetPasswordToken {
    getUser: Sequelize.BelongsToGetAssociationMixin<DbUserInstance>;
    setUser: Sequelize.BelongsToSetAssociationMixin<DbUserInstance, DbUserInstance['Id']>;
    createUser: Sequelize.BelongsToCreateAssociationMixin<DbUser, DbUserInstance>;
}