import {Entity} from "@informaticon/devops.base-microservice";
import {Request} from "express";
import {FindOptions} from "sequelize";
import {SetPasswordToken} from "@informaticon/devops.identity-model";
import {DbSetPasswordToken, IDbSetPasswordTokenInstance} from "../db/db-set-password-token";
import {Api} from "../../api";
import * as Sequelize from "sequelize";
import * as crypto from "crypto";
import * as NodeMailer from "nodemailer"

export class EntitySetPasswordToken extends Entity<DbSetPasswordToken, SetPasswordToken> {
    tokenDurationSec = 3600 * 24; //1 day

    public setIncludes(includePaths: string[], options: FindOptions<DbSetPasswordToken>): void{}

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
    public async dbToClient(inst: IDbSetPasswordTokenInstance): Promise<SetPasswordToken> {
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

    public async preCreation(spt: SetPasswordToken) : Promise<SetPasswordToken> {
        spt.tokenHash = crypto.randomBytes(64).toString('hex');

        const dt = new Date();
        dt.setSeconds(dt.getSeconds() + this.tokenDurationSec);
        spt.expires = dt;
        return spt;
    }
    public async postCreation(inst: IDbSetPasswordTokenInstance): Promise<IDbSetPasswordTokenInstance> {
        await this.notifyUser(inst);
        return inst;
    }

    public async preUpdate(user: SetPasswordToken) : Promise<SetPasswordToken> {
        // console.info(user);
        // if (!EntityUser.emailIsValid(user.email)) {
        //     throw new Error(`The email address ${user.email} is not valid. Update has been canceled`);
        // }
        return user;
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
        Api.inst.sequelize.models.setPasswordToken.findAll({ where: {expires: { [Sequelize.Op.lt]: new Date()} }})
            .then((spts: any) => {
                // delete expired tokens for all users
                for (let spt of spts){
                    spt.destroy();
                }

                let token : DbSetPasswordToken;
                //if(user.setPasswordTokens === undefined){
                //    user.setPasswordTokens = [];
                //}

                Api.inst.sequelize.models.setPasswordToken.findAll({where: { idUser: userId}}).then( (spt: DbSetPasswordToken[])  => {
                    if(spt !== null && spt !== undefined && spt.length > 0) {
                        token = spt[0];
                    } else
                    {
                        if(userId === undefined) {
                            throw new Error('userId is missing');
                        }

                        const dt = new Date();
                        dt.setSeconds(dt.getSeconds() + this.tokenDurationSec);
                        token = {
                            Id: undefined,
                            Expires: dt,
                            Message: message,
                            IdUser: userId,
                            TokenHash: crypto.randomBytes(64).toString('hex')
                        } as DbSetPasswordToken;
                    }

                    Api.inst.sequelize.models.setPasswordToken.create(token).then((t) => this.notifyUser(t));
                })
            });
    };
    notifyUser = async (t: IDbSetPasswordTokenInstance): Promise<void> => {
        // send email to user
        const user = await t.getUser();
        if (user === null)
            throw new Error('user not found from setPasswordToken');

        // const smtp = NodeMailer.createTransport({
        //     port: 465,//587,
        //     host: 'smtp-relay.gmail.com',
        //     secure: true,
        // });
        // For execution outside of Informaticon's network
        const smtp = NodeMailer.createTransport({
            port: 587,
            host: 'mail.infomaniak.com',
            secure: false,
            auth: {
                user: 'app@harps.ch',
                pass: 'xdqFyu0CH5VB'
            }
        });

        return smtp.sendMail({
            from: 'user-management@informaticon.com',
            to: user.Email,
            subject: 'Informaticon microservice password change',
            text: `${t.Message}
http://localhost:4201/change-password/${t.TokenHash}`,
            html: `${t.Message}
<a href="http://localhost:4201/change-password/${t.TokenHash}">change your password</a>`
        });
    };
}
