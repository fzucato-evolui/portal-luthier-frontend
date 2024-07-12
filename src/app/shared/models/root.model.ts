import {UserModel} from "./user.model";
import {SystemConfigModel} from "./system-config.model";

export class RootModel {
    public user: UserModel;
    public configs: Array<SystemConfigModel>;
}
