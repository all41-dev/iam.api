import {ApiBase} from "@informaticon/devops.base-microservice";
import * as Sequelize from "sequelize";
import {DbUser} from "./models/db/user";
import {DbSetPasswordToken} from "./models/db/setPasswordToken";
import {UsersController} from "./controllers/users.controller";
import {SetPasswordTokenController} from "./controllers/set-password-token.controller";
import {OAuthController} from "./controllers/oauth.controller";
import {DbAccessToken} from "./models/db/access-token";
import {DbClient} from "./models/db/client";

// export * from "./controllers/users.controller";

/** Hosts route definitions and sequelize model initialization */
export class UsersApi extends ApiBase{
    public registerRoutes() {
        // todo: doesn't work, nice to have for API documentation
        //this.express.use('/api', express.static("static"));

        UsersController.create("/api/users", this.express);
        SetPasswordTokenController.create("/api/set-password-token", this.express);
        OAuthController.create("", this.express)
    };

    public registerModels() : Sequelize.Models {
        const models : Sequelize.Models = this.sequelize.models = {
            user : DbUser.factory(this.sequelize),
            setPasswordToken : DbSetPasswordToken.factory(this.sequelize),
            accessToken : DbAccessToken.factory(this.sequelize),
            client : DbClient.factory(this.sequelize),
        };

        Object.keys(models).forEach((entityName: string) => {
            const model = models[entityName];
            if(model.associate) {
                model.associate(models)
            }
        });

        return models;
    }
}
