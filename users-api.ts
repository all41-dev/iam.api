import {ApiBase} from "@informaticon/base-microservice";
import * as Sequelize from "sequelize";
import {DbUser} from "./models/db/user";
import {DbSetPasswordToken} from "./models/db/setPasswordToken";
import {UsersController} from "./controllers/users.controller";
import {SetPasswordTokenController} from "./controllers/set-password-token.controller";

export * from "./controllers/users.controller";

/** Hosts route definitions and sequelize model initialization */
export class UsersApi extends ApiBase{
    public registerRoutes() {
        // todo: doesn't work, nice to have for API documentation
        //this.express.use('/api', express.static("static"));

        this.express.use("/api/users", UsersController);
        this.express.use("/api/set-password-token", SetPasswordTokenController);
    };


    public registerModels() : Sequelize.Models {
        const models = this.sequelize.models = {
            user : DbUser.factory(this.sequelize),
            setPasswordToken : DbSetPasswordToken.factory(this.sequelize),
        };

        Object.keys(models).forEach(entityName => {
            if(models[entityName].associate) {
                models[entityName].associate(models)
            }
        });

        return models;
    }
}
