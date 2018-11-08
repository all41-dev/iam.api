import {Entity} from "@informaticon/base-microservice/index";
import {Request} from "express";
import {DestroyOptions, FindOptions} from "sequelize";
import * as Sequelize from "sequelize";
import * as crypto from "crypto"
import {SetPasswordToken} from "@informaticon/users-model";
import {UsersApi} from "../../users-api";
import {DbSetPasswordToken} from "./setPasswordToken";

export class EntitySetPasswordToken extends Entity<DbSetPasswordToken, SetPasswordToken> {
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
    public dbToClient(dbObj: DbSetPasswordToken): SetPasswordToken {
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

        obj.IdUser = clientObj.idUser;
        obj.Message = clientObj.message;
        obj.Expires = clientObj.expires;
        obj.TokenHash = clientObj.tokenHash;

        return obj;
    }

    public async preCreation(user: SetPasswordToken) : Promise<void> {
        // if (!EntityUser.emailIsValid(user.email)) {
        //     throw new Error(`The email address ${user.email} is not valid. Creation has been canceled`);
        // }
        //
        // await EntityUser.userExists(user.email).then( (exists: boolean) => {
        //     if (exists){
        //         throw new Error(`The user ${user.email} already exists. Creation has been canceled.`);
        //     }
        //
        //     // Email is valid and doesn't exists yet
        // }).catch((e) => {
        //     throw e;
        // });
    }
    public postCreation(user: DbSetPasswordToken) {
        // this.createSetPasswordToken(user, 'create user message -> tbd');
    }

    public async preUpdate(user: SetPasswordToken) : Promise<void> {
        // console.info(user);
        // if (!EntityUser.emailIsValid(user.email)) {
        //     throw new Error(`The email address ${user.email} is not valid. Update has been canceled`);
        // }
    };

    public async preDelete(id: number): Promise<number> {
        // const options: DestroyOptions = {where: {IdUser: id}}
        // return UsersApi.inst.sequelize.models.setPasswordToken.destroy(options);
        throw new Error('not implemented yet');
    }
}