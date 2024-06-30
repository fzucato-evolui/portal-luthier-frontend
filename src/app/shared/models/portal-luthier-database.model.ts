

export enum DatabaseTypeEnum {
    POSTGRES = 'POSTGRES',
    ORACLE = 'ORACLE',
    MSSQL = 'MSSQL',
    H2 = 'H2'
}
export class PortalLuthierDatabaseModel {
    public id: number;
    public identifier: string;
    public description: string;
    public databaseType: DatabaseTypeEnum;
    public host: string;
    public database: string;
    public user: string;
    public password: string;
}
