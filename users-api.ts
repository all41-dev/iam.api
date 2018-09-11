import express from "express";
import * as Sequelize from "sequelize";
import {UsersController} from "./controllers/users.controller";

export * from "./controllers/users.controller";

/** Hosts route definitions and sequelize model initialization */
export class UsersApi {
    public static model: any;
    public static sequelize: Sequelize.Sequelize;

    public static registerRoutes = (app: express.Application) => {
        app.use("/api/users", UsersController);
    }
    public static registerModel: any = (sequelize: Sequelize.Sequelize, ) => {
        UsersApi.sequelize = sequelize;

        UsersApi.model = {
            sample : sequelize.define("sample", {
                Name: {
                    type: Sequelize.STRING,
                },
            }),
            user : sequelize.define("user", {
                Id : { type: Sequelize.INTEGER, },
                Email : { type: Sequelize.STRING, },
                Hash : { type: Sequelize.STRING, },
                Salt : { type: Sequelize.STRING, }
            }, {
                tableName: "Users"
            }),
            setPasswordToken : sequelize.define("setPasswordToken", {
                Id : { type: Sequelize.INTEGER, },
                IdUser : { type: Sequelize.INTEGER, },
                Message : { type: Sequelize.STRING, },
                Expires : { type: Sequelize.STRING, },// todo refactor type
            })
        };
        UsersApi.model.user.hasMany(UsersApi.model.setPasswordToken, {
            foreignKey: 'IdUser'
        });
        UsersApi.model.setPasswordToken.belongsTo(UsersApi.model.user, {
            foreignKey: 'IdUser'
        });

        return UsersApi.model;
    }
}
