export class DbSetPasswordToken {
    //public Id: number | undefined;

    //@ForeignKey(() => DbUser)
    public idUser!: number;

    public message!: string;

    public expires!: Date;

    public tokenHash!: string;

    //@BelongsTo(() => DbUser)
    //public user!: DbUser;

    // public CreatedAt: number | undefined;// timestamp
    // public UpdatedAt: number | undefined// timestamp
}