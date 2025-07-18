import {Scheme} from '../../../@fuse/services/config';

export class LoginModel {
  public login: string;
  public password: string;
}

export class UserConfigModel {
    public lang?: string;
    public theme?: string;
    public scheme?: Scheme;
}

// Frontend representation of backend RoleTypeEnum
export enum RoleTypeEnum {
    HIERARCHICAL = 'HIERARCHICAL',
    FUNCTIONAL = 'FUNCTIONAL'
}

// Frontend representation of backend RoleBean
export interface RoleModel {
    id: number;
    name: string;
    type: RoleTypeEnum;
    hierarchyLevel?: number;
}

export class UserModel {
    public id: number;
    public name: string;
    public login: string;
    public email: string;
    public password: string;
    // Replace authorities with roles
    public roles: RoleModel[];
    public enabled: boolean;
    public image: string;
    public base64Image: string;
    public userType: TipoUsuarioEnum;
    public newPassword: string;
    public config: UserConfigModel;
}


export class UsuarioFilterModel {
    public id: number;
    public login: string;
    public name: string;
    public email: string;
    public profile: PerfilUsuarioEnum;
    public enabled: boolean;

}


export enum PerfilUsuarioEnum {
    ROLE_HYPER = 'ROLE_HYPER',
    ROLE_SUPER = 'ROLE_SUPER',
    ROLE_ADMIN = 'ROLE_ADMIN',
    ROLE_USER = 'ROLE_USER'
};

export enum TipoUsuarioEnum {
    CUSTOM = 'CUSTOM',
    GOOGLE = 'GOOGLE',
    FACEBOOK = 'FACEBOOK'
};
