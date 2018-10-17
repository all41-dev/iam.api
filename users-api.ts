import {ApiBase} from "@informaticon/base-microservice";
import * as Sequelize from "sequelize";
import {DbUser} from "./models/db/user";
import {DbSetPasswordToken} from "./models/db/setPasswordToken";
import {UsersController} from "./controllers/users.controller";

export * from "./controllers/users.controller";

/** Hosts route definitions and sequelize model initialization */
export class UsersApi extends ApiBase{
    public registerRoutes() {
        // todo: doesn't work, nice to have for API documentation
        //this.express.use('/api', express.static("static"));

        this.express.use("/api/users", UsersController);
    };


    public registerModels() : Sequelize.Models {
        this.sequelize.models = {
            user : this.sequelize.define(DbUser.MODEL_NAME, DbUser.MODEL_DEFINITION , DbUser.MODEL_OPTIONS),
            setPasswordToken : this.sequelize.define(DbSetPasswordToken.MODEL_NAME, DbSetPasswordToken.MODEL_DEFINITION , DbSetPasswordToken.MODEL_OPTIONS),
        };

        this.sequelize.models.user.hasMany(this.sequelize.models.setPasswordToken, {
            foreignKey: 'IdUser'
        });
        this.sequelize.models.setPasswordToken.belongsTo(this.sequelize.models.user, {
            foreignKey: 'IdUser'
        });

        return this.sequelize.models;
    }
}
