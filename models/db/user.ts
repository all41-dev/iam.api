export class DbUser {
    public Id: number | undefined;
    public Email: string | undefined;
    public Hash: string | undefined;
    public Salt: string | undefined;
    public CreatedAt: number | undefined;// timestamp
    public UpdatedAt: number | undefined// timestamp
}