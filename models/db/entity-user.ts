import {Entity} from "@informaticon/base-microservice/index";
import {Request} from "express";
import {FindOptions} from "sequelize";
import * as Sequelize from "sequelize";
import * as crypto from "crypto"
import {DbUser} from "./user";
import {User} from "@informaticon/users-model";
import {UsersApi} from "../../users-api";
import {DbSetPasswordToken} from "./setPasswordToken";

export class EntityUser extends Entity<DbUser, User> {
    // noinspection JSMethodCanBeStatic
    public setFilter(req: Request, options: FindOptions<DbUser>): void {
        const filter: string | undefined = req.query.filter;
        if (filter !== undefined) {
            options.where = {
                Email: {[UsersApi.inst.sequelize.Op.like]: `%${filter}%`}
            }
        }
    }

    // noinspection JSMethodCanBeStatic
    public dbToClient(dbObj: DbUser): User {
        return new User(
            dbObj.Id,
            dbObj.Email
        );
    }

    // noinspection JSMethodCanBeStatic
    public jsonToClient(obj: any): User {
        const email: string =  obj.email.toLowerCase();

        return new User(
            obj.id === undefined ? null : obj.id,
            obj.email === undefined ? undefined : email,
        );
    }

    // noinspection JSMethodCanBeStatic
    public clientToDb(clientObj: User): DbUser {
        const obj = new DbUser();

        if(clientObj.id !== null) {
            obj.Id = clientObj.id;
        }

        obj.Email = clientObj.email;
        obj.Hash = "hashvalue";
        obj.Salt = "saltvalue";

        return obj;
    }

    public static emailIsValid = (email: string | undefined) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return email === undefined ? false : re.test(email);
    };

    public static userExists(email: string | undefined) {
        if(email === undefined){
            throw new Error("No email address provided (undefined)");
        }
        const options: any = {where: {
                email: email
            }};

        return UsersApi.inst.sequelize.models.user.count(options).then((nb: number) => nb > 0);
    }

    public async preCreation(user: User) : Promise<void> {
        if (!EntityUser.emailIsValid(user.email)) {
            throw new Error(`The email address ${user.email} is not valid. Creation has been canceled`);
        }

        await EntityUser.userExists(user.email).then( (exists: boolean) => {
            if (exists){
                throw new Error(`The user ${user.email} already exists. Creation has been canceled.`);
            }

            // Email is valid and doesn't exists yet
        }).catch((e) => {
            throw e;
        });
    }
    public postCreation(user: DbUser) {
        this.createSetPasswordToken(user, 'create user message -> tbd');
    }

    public async preUpdate(user: User) : Promise<void> {
        console.info(user);
        if (!EntityUser.emailIsValid(user.email)) {
            throw new Error(`The email address ${user.email} is not valid. Update has been canceled`);
        }
    };

    /** @summary Creates a change password token
     * Considers that permission to create the token has been checked already
     * Verify existing token for the user
     * if exists then update validity
     * if not exists create (generate token value and store)
     * Send an email to the user with the token value
     * Wording of the email will change whether the token is for a new user or a lost password
     */
    createSetPasswordToken = (user: DbUser, message: string) => {
        UsersApi.inst.sequelize.models.setPasswordToken.findAll({ where: {expires: { [Sequelize.Op.lt]: new Date()} }})
            .then((spts: any) => {
                // delete expired tokens for all users
                for (let spt of spts){
                    spt.destroy();
                }

                const tokenDurationSec = 3600 * 24; //1 day
                let token : DbSetPasswordToken;
                //if(user.setPasswordTokens === undefined){
                //    user.setPasswordTokens = [];
                //}

                UsersApi.inst.sequelize.models.setPasswordToken.findAll({where: { idUser: user.Id}}).then( (spt: DbSetPasswordToken[])  => {
                    if(spt !== null && spt !== undefined && spt.length > 0) {
                        token = spt[0];
                    } else
                    {
                        if(user.Id === undefined) {
                            throw new Error();
                        }

                        const dt = new Date();
                        dt.setSeconds(dt.getSeconds() + tokenDurationSec);
                        token = {
                            Id: undefined,
                            Expires: dt,
                            Message: message,
                            IdUser: user.Id,
                            TokenHash: crypto.randomBytes(64).toString('hex')
                        };
                    }

                    UsersApi.inst.sequelize.models.setPasswordToken.create(token).then((t: DbSetPasswordToken) => {
                        // send email to user
                    });
                })
            });
    };
}