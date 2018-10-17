import * as Sequelize from "sequelize";

export class DbSetPasswordToken {
    public Id: number | undefined;

    //@ForeignKey(() => DbUser)
    public IdUser!: number;

    public Message!: string;

    public Expires!: Date;

    public TokenHash!: string;

    //@BelongsTo(() => DbUser)
    //public user!: DbUser;

    // public CreatedAt: number | undefined;// timestamp
    // public UpdatedAt: number | undefined// timestamp

    public static MODEL_NAME = 'dbSetPasswordToken';
    public static MODEL_DEFINITION = {
        Id : { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
        IdUser : { type: Sequelize.INTEGER, },
        Message : { type: Sequelize.STRING, },
        Expires : { type: Sequelize.STRING, },// todo refactor type
        TokenHash: { type: Sequelize.STRING, }
    };
    public static MODEL_OPTIONS = {
        tableName: "SetPasswordTokens",
    }
}