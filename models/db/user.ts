import * as Sequelize from "sequelize";
import {DbEntity} from "@informaticon/base-microservice";

export class DbUser extends DbEntity {
    public Id!: number | undefined;
    public Email!: string | undefined;
    public Hash!: string;
    public Salt!: string;
    public CreatedAt!: number;// timestamp
    public UpdatedAt!: number;// timestamp

    public static MODEL_NAME = 'user';
    public static MODEL_DEFINITION = {
        Id : { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        Email : { type: Sequelize.STRING, },
        Hash : { type: Sequelize.STRING, },
        Salt : { type: Sequelize.STRING, }
    };
    public static MODEL_OPTIONS = {
        tableName: "Users",
    }
}