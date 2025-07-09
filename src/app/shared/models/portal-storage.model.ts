/**
 * Models para o sistema de storage administrativo do Portal
 */
import {UserModel} from './user.model';

export interface AdminStorageUserSummaryModel {
    userId: number;
    userName: string;
    userEmail: string;
    storageType?: string;
    totalEntities: number;
    totalFiles: number;
    totalDirectories: number;
    totalBytes: number;
    lastActivity?: Date;
}

export interface AdminStorageEntitySummaryModel {
    userName: string;
    userId: number;
    entityId: number;
    entityName: string;
    totalIdentifiers: number;
    totalFiles: number;
    totalDirectories: number;
    totalBytes: number;
    lastActivity?: Date;
    description?: string;
}

export interface AdminStorageIdentifierSummaryModel {
    entityId: number;
    entityName: string;
    entityIdentifierId: number;
    entityIdentifierName: string;
    totalFiles: number;
    totalDirectories: number;
    totalBytes: number;
    lastActivity?: Date;
    description?: string;
}

export interface PortalStorageFileModel {
    id: number;
    identifierId: number;
    originalName: string;
    fileName: string;
    parentId: number;
    storagePath: string;
    fileKey: string;
    isDirectory: boolean;
    contentType?: string;
    size: number;
    fileType?: PortalFileTypeEnum;
    description?: string;
    identifier?: PortalStorageEntityIdentifierModel;
    parent?: PortalStorageFileModel;
    createdAt: Date;
    updatedAt: Date;
    presignedUrl?: string; // Campo transient para URLs pré-assinadas
    extension?: string; // Extensão do arquivo
    children?: PortalStorageFileModel[]; // Para diretórios, lista de arquivos/diretórios filhos
    ancestors?: { [key: number]: string };
}

export interface PortalStorageEntityIdentifierModel {
    id?: number;
    entityId: number;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    files?: PortalStorageFileModel[];
    entity?: PortalStorageEntityModel;
    currentDirectory?: PortalStorageFileModel;
}

export interface PortalStorageEntityModel {
    id?: number;
    userId: number;
    name: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
    identifiers?: PortalStorageEntityIdentifierModel[];
    user?: UserModel
}

export interface UserWithStorageConfigModel {
    id: number;
    name: string;
    email: string;
    storageType?: string;
}

export enum PortalFileTypeEnum {
    IMAGE = 'IMAGE',
    DOCUMENT = 'DOCUMENT',
    SPREADSHEET = 'SPREADSHEET',
    PRESENTATION = 'PRESENTATION',
    VIDEO = 'VIDEO',
    AUDIO = 'AUDIO',
    COMPRESSED = 'COMPRESSED',
    CODE = 'CODE',
    OTHER = 'OTHER'
}

export interface StorageNavigationStateModel {
    userId?: number;
    userName?: string;
    entityId?: number;
    entityName?: string;
    identifierId?: number;
    identifierName?: string;
    directory?: PortalStorageFileModel;
    currentPath: string;
    breadcrumbs: StorageBreadcrumbModel[];
}

export interface StorageBreadcrumbModel {
    label: string;
    path: string;
    clickable: boolean;
}

export interface EditFileRequestModel {
    id: number;
    description?: string;
    tags?: string;
}

export interface PresignedUrlResponseModel {
    presignedUrl: string;
}

export interface StorageStatisticsModel {
    totalUsers: number;
    totalFiles: number;
    totalDirectories: number;
    totalBytes: number;
    storageByType: { [key: string]: number };
    recentActivity: PortalStorageFileModel[];
}

// Interfaces para componentes da UI
export interface FileListItemModel extends PortalStorageFileModel {
    tags?: string;
    selected?: boolean;
    icon?: string;
    sizeFormatted?: string;
    lastModifiedFormatted?: string;
}

export interface FileContextMenuActionModel {
    id: string;
    label: string;
    icon: string;
    action: (file: FileListItemModel) => void;
    disabled?: boolean;
    separator?: boolean;
}

export interface FileSelectionStateModel {
    selectedFiles: FileListItemModel[];
    allSelected: boolean;
    someSelected: boolean;
}

export interface FileGridConfigModel {
    viewMode: 'list' | 'grid';
    sortBy: 'name' | 'size' | 'modified' | 'type';
    sortDirection: 'asc' | 'desc';
    showHidden: boolean;
    itemsPerPage: number;
}
