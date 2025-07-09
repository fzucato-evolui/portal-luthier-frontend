import {GoogleServiceAccountModel} from './system-config.model';

export interface GoogleDriveConfig {
    serviceAccount: GoogleServiceAccountModel;
    rootFolderId: string;
}

export interface GoogleCloudConfig {
    serviceAccount: GoogleServiceAccountModel;
    bucketName: string;
    rootFolder: string;
}

export interface DropboxConfig {
    accessToken: string;
    appKey: string;
    appSecret: string;
    rootFolder: string;
}

export interface AWSConfig {
    accessKey: string;
    secretKey: string;
    region: string;
    bucketName: string;
    rootFolder: string;
}

export interface LocalDirectoryConfig {
    basePath: string;
    createMissingDirectories: boolean;
}

export type StorageConfig = GoogleDriveConfig | GoogleCloudConfig | DropboxConfig | AWSConfig | LocalDirectoryConfig;
