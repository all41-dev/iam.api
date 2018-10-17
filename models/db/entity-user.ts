import {Entity} from "@informaticon/base-microservice/index";
import {Request} from "express";
import {FindOptions} from "sequelize";
import {DbUser} from "./user";
import {User} from "../client/user";
import {UsersApi} from "../../users-api";

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
        return new User(
            obj.id === undefined ? null : obj.id,
            obj.email === undefined ? null : obj.email,
        );
    }

    // noinspection JSMethodCanBeStatic
    public clientToDb(clientObj: User): DbUser {
        const obj = new DbUser();

        if(clientObj.id !== null) {
            obj.Id = clientObj.id;
        }

        obj.Email = clientObj.email;
        return obj;
    }
}