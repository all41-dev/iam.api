import {ClientEntity} from "@informaticon/base-microservice";

export class User extends ClientEntity {
    public id!: number | undefined;
    public email!: string | undefined;

    public readonly valueLabel = 'Value';

    constructor(id: number | undefined, email: string | undefined) {
        super();
        this.id = id;
        this.email = email;
    }
}