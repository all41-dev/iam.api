export class DbUser {
    public Id!: number;
    public Email!: string;
    public Hash!: string;
    public Salt!: string;
    public CreatedAt!: number;// timestamp
    public UpdatedAt!: number// timestamp
}