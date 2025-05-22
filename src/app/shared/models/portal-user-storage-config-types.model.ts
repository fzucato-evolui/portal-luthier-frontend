export interface GoogleDriveConfig {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    rootFolderId: string;
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

export type StorageConfig = GoogleDriveConfig | DropboxConfig | AWSConfig | LocalDirectoryConfig; 