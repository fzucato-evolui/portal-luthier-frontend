import {StorageConfig} from './portal-storage-config-types.model';

export enum PortalStorageConfigType {
    GOOGLE_DRIVE = 'GOOGLE_DRIVE',
    GOOGLE_CLOUD = 'GOOGLE_CLOUD',
    DROPBOX = 'DROPBOX',
    AWS_S3 = 'AWS_S3',
    LOCAL_DIRECTORY = 'LOCAL_DIRECTORY'
}

export interface PortalStorageConfigModel {
    id?: number;
    identifier: string;
    description: string;
    storageType: PortalStorageConfigType;
    config: StorageConfig | any;
    createdAt?: Date;
    updatedAt?: Date;
}
