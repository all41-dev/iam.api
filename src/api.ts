import {ApiBase, IApiOptions} from "@informaticon/devops.base-microservice";
import {DbUser} from "./models/db/db-user";
import {DbSetPasswordToken} from "./models/db/db-set-password-token";
import {UsersController} from "./controllers/users.controller";
import {SetPasswordTokenController} from "./controllers/set-password-token.controller";
import {OAuthController} from "./controllers/oauth.controller";
import {DbAccessToken} from "./models/db/db-access-token";
import {DbClient} from "./models/db/db-client";
import {Request, Response} from "express";

/** Hosts route definitions and sequelize model initialization */
export class Api extends ApiBase{
    public static req: Request;
    public static res: Response;

    public init(options: IApiOptions) {
        this.sequelizeInit(options.sequelize, {
            user : DbUser,
            setPasswordToken : DbSetPasswordToken,
            accessToken : DbAccessToken,
            client : DbClient,
        })

        this.router.use('/users', UsersController.create());
        this.router.use('/set-password-token', SetPasswordTokenController.create());
        this.router.use("/oauth", OAuthController.create())

        return this.router;
    }
}
