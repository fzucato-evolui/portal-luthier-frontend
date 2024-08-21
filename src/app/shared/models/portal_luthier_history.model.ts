import {PortalLuthierDatabaseModel} from './portal-luthier-database.model';
import {UserModel} from './user.model';

export enum PortalHistoryPersistTypeEnum {
    SAVE = 'SAVE',
    DELETE = 'DELETE'
}
export class PortalLuthierHistoryModel {
    public id: number;
    public persistType: PortalHistoryPersistTypeEnum | string;
    public className: string;
    public classDescription: string;
    public classKey: string;
    public user: UserModel;
    public luthierDatabase: PortalLuthierDatabaseModel;
}

export class PortalLuthierHistoryFilterModel {
    public id: number;
    public dateFrom: Date;
    public dateTo: Date;
    public user: string;
    public database: string;
    public classDecription: string;
    public classKey: string;
    public historyType: PortalHistoryPersistTypeEnum | string;
}
