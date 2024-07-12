import {UtilFunctions} from '../util/util-functions';

export class SystemConfigModel {
    public id: number;
    public configType: SystemConfigModelEnum;
    public config: GoogleConfigModel;
}

export enum SystemConfigModelEnum {
  GOOGLE = 'GOOGLE',
}

export class GoogleServiceAccountModel {
  public type: string;
  public project_id: string;
  public private_key_id: string;
  public private_key: string;
  public client_email: string;
  public client_id: string;
  public auth_uri: string;
  public token_uri: string;
  public auth_provider_x509_cert_url: string;
  public client_x509_cert_url: string;
  public universe_domain: string;

  public static validate(model: GoogleServiceAccountModel): boolean {
    return model.type === "service_account" &&
      UtilFunctions.isValidStringOrArray(model.project_id) &&
      UtilFunctions.isValidStringOrArray(model.private_key_id) &&
      UtilFunctions.isValidStringOrArray(model.private_key) &&
      UtilFunctions.isValidEmail(model.client_email) &&
      UtilFunctions.isValidStringOrArray(model.client_id) &&
      UtilFunctions.isValidURL(model.auth_uri) &&
      UtilFunctions.isValidURL(model.token_uri) &&
      UtilFunctions.isValidURL(model.auth_provider_x509_cert_url) &&
      UtilFunctions.isValidURL(model.client_x509_cert_url);
  }
}

export class GoogleConfigModel {
  public apiKey: string;
  public clientID: string;
  public secretKey: string;
  public serviceAccount: GoogleServiceAccountModel;
}

export class AnotherConfigModel {
}

export interface IConfig {

}
