import {UserModel} from "./user.model";
import {SystemConfigModel} from "./system-config.model";

export class RootModel {
    public appProperties: AppPropertiesModel;
    public user: UserModel;
    public configs: Array<SystemConfigModel>;
}

export class AppPropertiesModel {
    public name: string;
    public version: string;
    public buildTime: string;
    public buildMode: 'MASTER' | 'SLAVE'
}
