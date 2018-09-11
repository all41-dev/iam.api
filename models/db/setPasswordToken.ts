export class DbSetPasswordToken {
    //public Id: number | undefined;

    //@ForeignKey(() => DbUser)
    public IdUser!: number;

    public Message!: string;

    public Expires!: Date;

    public TokenHash!: string;

    //@BelongsTo(() => DbUser)
    //public user!: DbUser;

    // public CreatedAt: number | undefined;// timestamp
    // public UpdatedAt: number | undefined// timestamp
}