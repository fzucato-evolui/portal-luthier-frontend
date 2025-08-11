/**
 * Models para o sistema de storage administrativo do Portal
 */
import {PortalStorageConfigModel} from './portal-storage-config.model';

export interface StorageRootSummaryModel {
    id: number;
    identifier: string;
    description: string;
    storageType?: string;
    configId?: number;
    totalEntities: number;
    totalFiles: number;
    totalDirectories: number;
    totalBytes: number;
    lastActivity?: Date;
    storageId?: string;
}

export interface StorageEntitySummaryModel {
    rootIdentifier: string;
    rootDescription: string;
    rootId: number;
    entityId: number;
    entityName: string;
    totalIdentifiers: number;
    totalFiles: number;
    totalDirectories: number;
    totalBytes: number;
    lastActivity?: Date;
    description?: string;
    storageId?: string;

}

export interface StorageIdentifierSummaryModel {
    entityId: number;
    entityName: string;
    storageId?: string;
    entityIdentifierId: number;
    entityIdentifierName: string;
    totalFiles: number;
    totalDirectories: number;
    totalBytes: number;
    lastActivity?: Date;
    description?: string;
}

export interface PortalStorageFileModel {
    id?: number;
    identifierId?: number;
    originalName?: string;
    parentId?: number;
    storageId?: string;
    fileKey?: string;
    isDirectory: boolean;
    contentType?: string;
    size: number;
    fileType?: MediaType;
    description?: string;
    identifier?: PortalStorageEntityIdentifierModel;
    parent?: PortalStorageFileModel;
    createdAt?: Date;
    updatedAt?: Date;
    presignedUrl?: string; // Campo transient para URLs pré-assinadas
    extension?: string; // Extensão do arquivo
    children?: PortalStorageFileModel[]; // Para diretórios, lista de arquivos/diretórios filhos
    ancestors?: Array<{ [key: number]: string }>;
    content?: any;
}

export interface PortalStorageEntityIdentifierModel {
    id?: number;
    entityId?: number;
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
    storageRootId: number;
    name: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
    identifiers?: PortalStorageEntityIdentifierModel[];
    storageRoot?: PortalStorageRootModel
}

export interface PortalStorageRootModel {
    id?: number;
    configId: number;
    identifier: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
    entities?: PortalStorageEntityModel[];
    config?: PortalStorageConfigModel
}


export type MediaType = 'AUDIO' | 'CODE' | 'COMPRESSED' | 'DOCUMENT' | 'IMAGE' | 'PRESENTATION' | 'SPREADSHEET' | 'TEXT' | 'VIDEO' | 'OTHER';

export interface StorageNavigationStateModel {
    rootId?: number;
    rootIdentifier?: string;
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

export class MimeHelper {

    static readonly SUPPORTED_EXTENSIONS = {
        audio: ['aac','flac','m4a','mp3','ogg','wav','wma'],
        code: ['bat','c','cpp','cs','css','dart','go','h','html','java','js','json','jsx','kt','less','lua','php','pl','py','rb','rs','scss','sh','sql','swift','ts','tsx','vue','xml','yaml','yml'],
        compressed: ['7z','bz2','gz','rar','tar','zip'],
        document: ['doc', 'docx', 'odt', 'pdf'],
        image: ['bmp','gif','ico','jpeg','jpg','png','svg','tiff','webp'],
        presentation: ['key','odp','ppt','pptx'],
        spreadsheet: ['csv','numbers','ods','xls','xlsx'],
        text: ['log','md','rtf','tex','txt'],
        video: ['avi','flv','m4v','mkv','mov','mp4','mpeg','mpg','webm','wmv'],
    };

    /**
     * Get all gallery-previewable extensions (now includes code and text)
     */
    static get ALLOWED_EXTENSIONS(): string[] {
        return [
            ...MimeHelper.SUPPORTED_EXTENSIONS.audio,
            ...MimeHelper.SUPPORTED_EXTENSIONS.code,
            ...MimeHelper.SUPPORTED_EXTENSIONS.compressed,
            ...MimeHelper.SUPPORTED_EXTENSIONS.document,
            ...MimeHelper.SUPPORTED_EXTENSIONS.image,
            ...MimeHelper.SUPPORTED_EXTENSIONS.presentation,
            ...MimeHelper.SUPPORTED_EXTENSIONS.spreadsheet,
            ...MimeHelper.SUPPORTED_EXTENSIONS.text,
            ...MimeHelper.SUPPORTED_EXTENSIONS.video

        ];
    }

    static isAllowedFile(file: File): boolean {
        const model = MimeHelper.parse(file);
        return MimeHelper.isAllowed(model);
    }

    static isAllowed(file: PortalStorageFileModel): boolean {
        return MimeHelper.ALLOWED_EXTENSIONS.includes(file.extension);
    }

    static isAudio(file: PortalStorageFileModel): boolean {
        return MimeHelper.SUPPORTED_EXTENSIONS.audio.includes(file.extension);
    }

    static isCode(file: PortalStorageFileModel): boolean {
        return MimeHelper.SUPPORTED_EXTENSIONS.code.includes(file.extension);
    }

    static isCompressed(file: PortalStorageFileModel): boolean {
        return MimeHelper.SUPPORTED_EXTENSIONS.compressed.includes(file.extension);
    }

    static isDocument(file: PortalStorageFileModel): boolean {
        return MimeHelper.SUPPORTED_EXTENSIONS.document.includes(file.extension);
    }

    static isImage(file: PortalStorageFileModel): boolean {
        return MimeHelper.SUPPORTED_EXTENSIONS.image.includes(file.extension);
    }

    static isPresentation(file: PortalStorageFileModel): boolean {
        return MimeHelper.SUPPORTED_EXTENSIONS.presentation.includes(file.extension);
    }

    static isSpreadsheet(file: PortalStorageFileModel): boolean {
        return MimeHelper.SUPPORTED_EXTENSIONS.spreadsheet.includes(file.extension);
    }

    static isText(file: PortalStorageFileModel): boolean {
        return MimeHelper.SUPPORTED_EXTENSIONS.text.includes(file.extension);
    }

    static isVideo(file: PortalStorageFileModel): boolean {
        return MimeHelper.SUPPORTED_EXTENSIONS.video.includes(file.extension);
    }

    /**
     * Get file extension from filename
     */
    static getFileExtension(fileName: string): string {
        if (!fileName || !fileName.includes('.')) {
            return '';
        }
        return fileName.split('.').pop()?.toLowerCase() || '';
    }

    static parse(file: File): PortalStorageFileModel {
        const model: PortalStorageFileModel = {
            id: -1,
            identifierId: -1,
            originalName: file.name,
            parentId: -1,
            isDirectory: false,
            contentType: file['contentType'],
            size: file.size,
            fileType: MimeHelper.getFileType(file.name),
            createdAt: new Date(),
            updatedAt: new Date(),
            extension: MimeHelper.getFileExtension(file.name)
        }

        return model;
    }

    /**
     * Check if file can be embedded in browser
     */
    static canView(file: PortalStorageFileModel): boolean {
        return !MimeHelper.isCompressed(file) && MimeHelper.isAllowed(file);
    }

    /**
     * Get file type category
     */
    static getFileType(fileName: string): MediaType {
        const extension = MimeHelper.getFileExtension(fileName);

        if (MimeHelper.SUPPORTED_EXTENSIONS.audio.includes(extension)) {
            return 'AUDIO';
        }
        if (MimeHelper.SUPPORTED_EXTENSIONS.code.includes(extension)) {
            return 'CODE';
        }
        if (MimeHelper.SUPPORTED_EXTENSIONS.compressed.includes(extension)) {
            return 'COMPRESSED';
        }
        if (MimeHelper.SUPPORTED_EXTENSIONS.document.includes(extension)) {
            return 'DOCUMENT';
        }
        if (MimeHelper.SUPPORTED_EXTENSIONS.image.includes(extension)) {
            return 'IMAGE';
        }
        if (MimeHelper.SUPPORTED_EXTENSIONS.presentation.includes(extension)) {
            return 'PRESENTATION';
        }
        if (MimeHelper.SUPPORTED_EXTENSIONS.spreadsheet.includes(extension)) {
            return 'SPREADSHEET';
        }
        if (MimeHelper.SUPPORTED_EXTENSIONS.text.includes(extension)) {
            return 'TEXT';
        }
        if (MimeHelper.SUPPORTED_EXTENSIONS.video.includes(extension)) {
            return 'VIDEO';
        }
        return 'OTHER';
    }
}
