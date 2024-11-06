import {UserModel} from './user.model';


export enum PortalLicenseTypeEnum {
    TRIAL = ("TRIAL"),
    BASIC = ("DELETE"),
    FULL = ("FULL")
}
export enum PortalLicenseStatusEnum {
    INACTIVE = ("INACTIVE"),
    ACTIVE = ("ACTIVE"),
    PENDING = ("PENDING")
}
export class PortalLicenseModel {
    public id: number;
    public since: Date;
    public until: Date;
    public licenseType: PortalLicenseTypeEnum;
    public allowedAccess: PortalAllowedAccessModel;
    public user: UserModel;
    public status: PortalLicenseStatusEnum;
}

export class PortalAllowedAccessModel {
    public allowedIPs: {[key: string]: string};
    public allowedMacs: {[key: string]: string};
}
