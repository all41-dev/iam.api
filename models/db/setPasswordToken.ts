import {Table, Column, Model, ForeignKey, BelongsTo} from "sequelize-typescript";
import {DbUser} from './user'

@Table({ tableName: 'SetPasswordTokens'})
export class DbSetPasswordToken extends Model<DbSetPasswordToken>{
    //public Id: number | undefined;

    //@ForeignKey(() => DbUser)
    @Column
    public idUser!: number;

    @Column
    public message!: string;

    @Column
    public expires!: Date;

    @Column
    public tokenHash!: string;

    //@BelongsTo(() => DbUser)
    //public user!: DbUser;

    // public CreatedAt: number | undefined;// timestamp
    // public UpdatedAt: number | undefined// timestamp
}