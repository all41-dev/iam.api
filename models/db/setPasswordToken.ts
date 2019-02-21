import {
    Instance,
    Model,
    INTEGER,
    STRING,
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin, BelongsToCreateAssociationMixin, Sequelize, DATE
} from "sequelize";
import {DbEntity, SequelizeAttributes} from "@informaticon/devops.base-microservice";
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

    static factory = (sequelize: Sequelize): Model<DbSetPasswordTokenInstance, DbSetPasswordToken> => {
        const attr: SequelizeAttributes<DbSetPasswordToken> = {
            Id : { type: INTEGER, autoIncrement: true, primaryKey: true},
            IdUser : { type: INTEGER, },
            Message : { type: STRING, },
            Expires : { type: DATE, },
            TokenHash: { type: STRING, }
        };
        const def = sequelize.define<DbSetPasswordTokenInstance, DbSetPasswordToken>('dbSetPasswordToken', attr, { tableName: "SetPasswordTokens" });

        def.associate = models => {
            def.belongsTo(models.user, {as: 'user', foreignKey: 'IdUser'})
        };

        return def as any;
    };
}

export interface DbSetPasswordTokenInstance extends Instance<DbSetPasswordToken>, DbSetPasswordToken {
    getUser: BelongsToGetAssociationMixin<DbUserInstance>;
    setUser: BelongsToSetAssociationMixin<DbUserInstance, DbUserInstance['Id']>;
    createUser: BelongsToCreateAssociationMixin<DbUser, DbUserInstance>;
}
