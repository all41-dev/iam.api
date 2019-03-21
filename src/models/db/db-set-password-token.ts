import {Instance, Sequelize, Model, INTEGER, STRING, DATE, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, BelongsToCreateAssociationMixin} from "sequelize";
import {DbEntity, SequelizeAttributes} from "@informaticon/devops.base-microservice";
import {DbUser, DbUserInstance} from "./db-user";

export class DbSetPasswordToken extends DbEntity {
    //@ForeignKey(() => DbUser)
    public IdUser!: number;
    public Message!: string;
    public Expires!: Date;
    public TokenHash!: string;

    public user?: DbUser | DbUser['Id'];

    // public CreatedAt: number | undefined;// timestamp
    // public UpdatedAt: number | undefined// timestamp

    public static factory = (sequelize: Sequelize): Model<IDbSetPasswordTokenInstance, DbSetPasswordToken> => {
        const attr: SequelizeAttributes<DbSetPasswordToken> = {
            Id : { type: INTEGER, autoIncrement: true, primaryKey: true},
            IdUser : { type: INTEGER, },
            Message : { type: STRING, },
            Expires : { type: DATE, },
            TokenHash: { type: STRING, }
        };
        const def = sequelize.define<IDbSetPasswordTokenInstance, DbSetPasswordToken>('dbSetPasswordToken', attr, { tableName: "SetPasswordTokens" });

        def.associate = models => {
            def.belongsTo(models.user, {as: 'user', foreignKey: 'IdUser'})
        };

        return def as any;
    };
}

export interface IDbSetPasswordTokenInstance extends Instance<DbSetPasswordToken>, DbSetPasswordToken {
    getUser: BelongsToGetAssociationMixin<DbUserInstance>;
    setUser: BelongsToSetAssociationMixin<DbUserInstance, DbUserInstance['Id']>;
    createUser: BelongsToCreateAssociationMixin<DbUser, DbUserInstance>;
}
