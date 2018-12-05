import {Entity} from "@informaticon/base-microservice/index";
import {Request} from "express";
import {FindOptions} from "sequelize";
import {SetPasswordToken} from "@informaticon/users-model";
import {DbSetPasswordToken, DbSetPasswordTokenInstance} from "./setPasswordToken";
import {DbUser} from "./user";
import {UsersApi} from "../../users-api";
import * as Sequelize from "sequelize";
import * as crypto from "crypto";
import * as NodeMailer from "nodemailer"

export class EntitySetPasswordToken extends Entity<DbSetPasswordToken, SetPasswordToken> {
    tokenDurationSec = 3600 * 24; //1 day

    // noinspection JSMethodCanBeStatic
    public setFilter(req: Request, options: FindOptions<DbSetPasswordToken>): void {
        const filter: string | undefined = req.query.filter;
        if (filter !== undefined) {
            options.where = {
                // Email: {[UsersApi.inst.sequelize.Op.like]: `%${filter}%`}
            }
        }
    }

    // noinspection JSMethodCanBeStatic
    public dbToClient(inst: DbSetPasswordTokenInstance): SetPasswordToken {
        const dbObj = inst.get();
        return new SetPasswordToken(
            dbObj.Id,
            dbObj.IdUser,
            dbObj.Message,
            dbObj.Expires,
            dbObj.TokenHash,
        );
    }

    // noinspection JSMethodCanBeStatic
    public jsonToClient(obj: any): SetPasswordToken {
        return new SetPasswordToken(
            obj.id === undefined ? null : obj.id,
            obj.idUser === undefined ? undefined : obj.idUser,
            obj.message === undefined ? undefined : obj.message,
            obj.expires === undefined ? undefined : obj.expires,
            obj.tokenHash === undefined ? undefined : obj.tokenHash,
        );
    }

    // noinspection JSMethodCanBeStatic
    public clientToDb(clientObj: SetPasswordToken): DbSetPasswordToken {
        const obj = new DbSetPasswordToken();

        if(clientObj.id !== null) {
            obj.Id = clientObj.id;
        }
        if(clientObj.idUser === undefined || clientObj.expires === undefined || clientObj.tokenHash === undefined)
            throw new Error('invalid clientObj');

        obj.IdUser = clientObj.idUser;
        obj.Message = clientObj.message === undefined ?'' : clientObj.message;
        obj.Expires = clientObj.expires;
        obj.TokenHash = clientObj.tokenHash;

        return obj;
    }

    public async preCreation(spt: SetPasswordToken) : Promise<void> {
        spt.tokenHash = crypto.randomBytes(64).toString('hex')

        const dt = new Date();
        dt.setSeconds(dt.getSeconds() + this.tokenDurationSec);
        spt.expires = dt;
    }
    public postCreation(inst: DbSetPasswordTokenInstance) {
        return this.notifyUser(inst);
    }

    public async preUpdate(user: SetPasswordToken) : Promise<void> {
        // console.info(user);
        // if (!EntityUser.emailIsValid(user.email)) {
        //     throw new Error(`The email address ${user.email} is not valid. Update has been canceled`);
        // }
    };

    public async preDelete(id: number): Promise<number> {
        // throw new Error('not implemented yet');
        return 0;
    }

    /** @summary Creates a change password token
     * Considers that permission to create the token has been checked already
     * Verify existing token for the user
     * if exists then update validity
     * if not exists create (generate token value and store)
     * Send an email to the user with the token value
     * Wording of the email will change whether the token is for a new user or a lost password
     */
    createSetPasswordToken = (userId: number, message: string) => {
        UsersApi.inst.sequelize.models.setPasswordToken.findAll({ where: {expires: { [Sequelize.Op.lt]: new Date()} }})
            .then((spts: any) => {
                // delete expired tokens for all users
                for (let spt of spts){
                    spt.destroy();
                }

                let token : DbSetPasswordToken;
                //if(user.setPasswordTokens === undefined){
                //    user.setPasswordTokens = [];
                //}

                UsersApi.inst.sequelize.models.setPasswordToken.findAll({where: { idUser: userId}}).then( (spt: DbSetPasswordToken[])  => {
                    if(spt !== null && spt !== undefined && spt.length > 0) {
                        token = spt[0];
                    } else
                    {
                        if(userId === undefined) {
                            throw new Error();
                        }

                        const dt = new Date();
                        dt.setSeconds(dt.getSeconds() + this.tokenDurationSec);
                        token = {
                            Id: undefined,
                            Expires: dt,
                            Message: message,
                            IdUser: userId,
                            TokenHash: crypto.randomBytes(64).toString('hex')
                        };
                    }

                    UsersApi.inst.sequelize.models.setPasswordToken.create(token).then((t) => this.notifyUser(t));
                })
            });
    };
    notifyUser = async (t: DbSetPasswordTokenInstance): Promise<void> => {
        // send email to user
        const user = await t.getUser();
        if (user === null)
            throw new Error('user not found from setPasswordToken');

        const smtp = NodeMailer.createTransport({
            port: 465,//587,
            host: 'smtp-relay.gmail.com',
            secure: true,
        });
        return smtp.sendMail({
            from: 'user-management@informaticon.com',
            to: user.Email,
            subject: 'Informaticon microservice password change',
            text: `http://localhost:4201/change-password/${t.TokenHash}`,
            html: `<a href="http://localhost:4201/change-password/${t.TokenHash}">change your password</a>`
        });
    };
}