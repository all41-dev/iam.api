import { Ressource } from "@all41-dev/iam.model";
import { Entity } from "@all41-dev/server";
import { FindOptions, DestroyOptions } from "sequelize/types";
import { DbRessource } from "../db/db-ressource";

export class EntityRessource extends Entity<DbRessource, Ressource> {
  public constructor() {
    super(DbRessource);
  }
  async dbToClient(dbObj: DbRessource): Promise<Ressource> {
    const res = new Ressource({
      name: dbObj.name,
      uuid: dbObj.uuid,
      path: dbObj.path,
      parentUuid: dbObj.parentUuid,
    });
    return res;
  }
  async clientToDb(clientObj: Ressource): Promise<DbRessource> {
    const obj = clientObj.uuid ?
      (await DbRessource.findOrBuild({ where: { Id: clientObj.uuid } }))[0] :
      new DbRessource();
    obj.uuid = clientObj.uuid;
    obj.name = clientObj.name;
    obj.path = clientObj.path;
    obj.parentUuid = clientObj.parentUuid;
    return obj;
  }
  setFilter(opt: any): void {
    // nothing to do
    // throw new Error("Method not implemented.");
  }
  async preCreation(obj: Ressource): Promise<Ressource> {
    return obj;
  }
  async preUpdate(obj: Ressource): Promise<Ressource> {
    return obj;
  }
  async preDelete(id: string | number): Promise<number> {
    return 0;
  }
  async postCreation(obj: DbRessource): Promise<DbRessource> {
    return obj;
  }
  setIncludes(includePaths: string[]): void {
    return;
  }
  protected dbFindAll(options: FindOptions): Promise<DbRessource[]> {
    return DbRessource.findAll(options);
  }
  protected dbFindByPk(pk: string): Promise<DbRessource | null> {
    return DbRessource.findByPk(pk);
  }
  protected dbDestroy(options: DestroyOptions): Promise<number> {
    return DbRessource.destroy(options);
  }
}