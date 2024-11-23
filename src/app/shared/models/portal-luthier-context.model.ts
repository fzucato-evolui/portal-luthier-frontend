import {PortalLuthierDatabaseModel} from './portal-luthier-database.model';


export enum DatabaseTypeEnum {
    POSTGRES = 'POSTGRES',
    ORACLE = 'ORACLE',
    MSSQL = 'MSSQL',
    H2 = 'H2'
}
export enum PortalLuthierContextConfigEnum {
    INTEGRATED =("INTEGRATED"),
    NATIVE =("NATIVE")
}
export enum PortalLuthierContextAuthTypeEnum {
    BASIC = ("BASIC"),
    CUSTOM = ("CUSTOM"),
    INTEROP_SERVER = ("INTEROP_SERVER"),
    LDAP = ("LDAP")
}
export class PortalLuthierContextModel {
    public id: number;
    public context: string;
    public databaseMaxpool: number;
    public databaseMinpool: number;
    public metadataMaxpool: number;
    public metadataMinpool: number;
    public serverUrl: string;
    public description: string;
    public configuration: PortalLuthierContextConfigEnum;
    public debugDataBase: number;
    public licenseServer: string;
    public extraConfiguration: string;
    public dbExtra: string;
    public typeAuthentication: PortalLuthierContextAuthTypeEnum;
    public xmlAuthentication: string;
    public metadataFile: string;
    public luthierProviderService: string;
    public disableLibs: boolean;
    public luthierDatabase: PortalLuthierDatabaseModel;
    public serviceProvidersDataCollection: Array<LuthierServiceProviderModel>
}

export class LuthierServiceProviderModel {
    public id: number;
    public name: string;
    public classname: string;
}
