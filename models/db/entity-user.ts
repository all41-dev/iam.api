import {Entity} from "@informaticon/devops.base-microservice/index";
import {Request, Response} from "express";
import {DestroyOptions, FindOptions, Instance, Model} from "sequelize";
import {DbUser, DbUserInstance} from "./user";
import {User} from "@informaticon/devops.users-model";
import {UsersApi} from "../../users-api";
import {DbSetPasswordToken, DbSetPasswordTokenInstance} from "./setPasswordToken";
import {EntitySetPasswordToken} from "./entity-set-password-token";

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
    public async dbToClient(dbInst: DbUserInstance): Promise<User> {
        const dbObj = dbInst.get();
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

        // Set through the password update process
        //obj.Hash = "hashvalue";
        //obj.Salt = "saltvalue";

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

    public async preCreation(user: User) : Promise<User> {
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
        return user;
    }
    public async postCreation(user: DbUserInstance): Promise<DbUserInstance> {
        const usr = user.get();
        if (usr.Id === undefined) throw new Error('Db user without Id');
        new EntitySetPasswordToken().createSetPasswordToken(usr.Id, 'create user message -> tbd');
        return user;
    }

    public async preUpdate(user: User) : Promise<User> {
        console.info(user);
        if (!EntityUser.emailIsValid(user.email)) {
            throw new Error(`The email address ${user.email} is not valid. Update has been canceled`);
        }
        return user;
    };

    public async preDelete(id: number): Promise<number> {
        const options: DestroyOptions = {where: {IdUser: id}};
        return UsersApi.inst.sequelize.models.setPasswordToken.destroy(options);
    }

    public doGetFromToken(
        model: Model<Instance<DbSetPasswordToken>, DbSetPasswordToken>,
        options: FindOptions<DbSetPasswordToken>, res: Response) {

        model.find(options).then((spt: Instance<DbSetPasswordToken>|null) => {
            const token = spt as DbSetPasswordTokenInstance;
            if(token === null) {
                res.json("The provided token is not valid.")
            } else {
                token.getUser().then(async (usr: DbUserInstance|null) => {
                    if(usr === null) throw new Error('user not found');
                    res.json([await this.dbToClient(usr)])
                })
            }
        })
    }
}
