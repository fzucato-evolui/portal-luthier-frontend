import {StorageConfig} from './portal-user-storage-config-types.model';

export enum PortalUserStorageConfigType {
    GOOGLE_DRIVE = 'GOOGLE_DRIVE',
    GOOGLE_CLOUD = 'GOOGLE_CLOUD',
    DROPBOX = 'DROPBOX',
    AWS_S3 = 'AWS_S3',
    LOCAL_DIRECTORY = 'LOCAL_DIRECTORY'
}

export interface PortalUserStorageConfig {
    id?: number;
    userId: number;
    storageType: PortalUserStorageConfigType;
    config: StorageConfig;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PortalUserStorageListModel {
    id: number;
    name: string;
    email: string;
    activeStorageType: PortalUserStorageConfigType | null;
    lastConfigUpdate: Date | null;
}
