import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {FileGalleryItem} from '../components/file-gallery/file-gallery.component';
import {PortalStorageFileModel} from '../models/portal-storage.model';

export interface GalleryState {
    isOpen: boolean;
    files: FileGalleryItem[];
    currentIndex: number;
    config: any;
}

@Injectable({
    providedIn: 'root'
})
export class FileGalleryService {
    private _galleryState = new BehaviorSubject<GalleryState>({
        isOpen: false,
        files: [],
        currentIndex: 0,
        config: {}
    });

    get galleryState$(): Observable<GalleryState> {
        return this._galleryState.asObservable();
    }

    /**
     * Open gallery with files
     */
    openGallery(files: FileGalleryItem[], startIndex: number = 0, config: any = {}): void {
        this._galleryState.next({
            isOpen: true,
            files,
            currentIndex: Math.max(0, Math.min(startIndex, files.length - 1)),
            config: {
                allowDownload: true,
                allowFullscreen: true,
                showFileInfo: true,
                theme: 'dark',
                ...config
            }
        });
    }

    /**
     * Close gallery
     */
    closeGallery(): void {
        this._galleryState.next({
            isOpen: false,
            files: [],
            currentIndex: 0,
            config: {}
        });
    }

    /**
     * Navigate to specific index
     */
    navigateTo(index: number): void {
        const current = this._galleryState.value;
        if (current.isOpen && index >= 0 && index < current.files.length) {
            this._galleryState.next({
                ...current,
                currentIndex: index
            });
        }
    }

    /**
     * Go to next file
     */
    next(): void {
        const current = this._galleryState.value;
        if (current.isOpen && current.currentIndex < current.files.length - 1) {
            this.navigateTo(current.currentIndex + 1);
        }
    }

    /**
     * Go to previous file
     */
    previous(): void {
        const current = this._galleryState.value;
        if (current.isOpen && current.currentIndex > 0) {
            this.navigateTo(current.currentIndex - 1);
        }
    }

    /**
     * Get current file
     */
    getCurrentFile(): FileGalleryItem | null {
        const current = this._galleryState.value;
        if (current.isOpen && current.files.length > 0 && current.currentIndex >= 0) {
            return current.files[current.currentIndex] || null;
        }
        return null;
    }

    /**
     * Convert PortalStorageFileModel to FileGalleryItem
     */
    static convertToGalleryItem(file: PortalStorageFileModel): FileGalleryItem {
        return {
            id: file.id,
            originalName: file.originalName,
            contentType: file.contentType,
            size: file.size,
            presignedUrl: file.presignedUrl,
            extension: FileGalleryService.getFileExtension(file.originalName),
            isDirectory: file.isDirectory,
            description: file.description
        };
    }

    /**
     * Convert array of PortalStorageFileModel to FileGalleryItem array
     */
    static convertToGalleryItems(files: PortalStorageFileModel[]): FileGalleryItem[] {
        return files.map(file => FileGalleryService.convertToGalleryItem(file));
    }

    /**
     * File type extensions - centralized definitions
     */
    static readonly SUPPORTED_EXTENSIONS = {
        images: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'],
        videos: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'],
        audio: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'],
        documents: ['pdf'],
        office: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
        code: ['js', 'ts', 'html', 'css', 'json', 'xml', 'java', 'py', 'cpp', 'c', 'php', 'rb', 'go', 'rs', 'cs', 'sh', 'bash', 'yaml', 'yml', 'sql', 'swift', 'kt', 'dart', 'bat'],
        text: ['txt', 'md', 'rtf', 'log']
    };

    /**
     * Get all gallery-previewable extensions (now includes code and text)
     */
    static get GALLERY_EXTENSIONS(): string[] {
        return [
            ...FileGalleryService.SUPPORTED_EXTENSIONS.images,
            ...FileGalleryService.SUPPORTED_EXTENSIONS.videos,
            ...FileGalleryService.SUPPORTED_EXTENSIONS.audio,
            ...FileGalleryService.SUPPORTED_EXTENSIONS.documents,
            ...FileGalleryService.SUPPORTED_EXTENSIONS.office,
            ...FileGalleryService.SUPPORTED_EXTENSIONS.code,
            ...FileGalleryService.SUPPORTED_EXTENSIONS.text
        ];
    }

    /**
     * Get all previewable extensions (including text/code)
     */
    static get ALL_PREVIEWABLE_EXTENSIONS(): string[] {
        return [
            ...FileGalleryService.GALLERY_EXTENSIONS,
            ...FileGalleryService.SUPPORTED_EXTENSIONS.code,
            ...FileGalleryService.SUPPORTED_EXTENSIONS.text
        ];
    }

    /**
     * Check if file can be shown in gallery (visual preview)
     */
    static canShowInGallery(fileName: string, isDirectory: boolean = false): boolean {
        if (isDirectory) return false;

        const extension = FileGalleryService.getFileExtension(fileName);
        return FileGalleryService.GALLERY_EXTENSIONS.includes(extension);
    }

    /**
     * Check if file can be previewed (including text files)
     */
    static canPreview(fileName: string, isDirectory: boolean = false): boolean {
        if (isDirectory) return false;

        const extension = FileGalleryService.getFileExtension(fileName);
        return FileGalleryService.ALL_PREVIEWABLE_EXTENSIONS.includes(extension);
    }

    /**
     * Check if file is an image
     */
    static isImage(fileName: string): boolean {
        const extension = FileGalleryService.getFileExtension(fileName);
        return FileGalleryService.SUPPORTED_EXTENSIONS.images.includes(extension);
    }

    /**
     * Check if file is a video
     */
    static isVideo(fileName: string): boolean {
        const extension = FileGalleryService.getFileExtension(fileName);
        return FileGalleryService.SUPPORTED_EXTENSIONS.videos.includes(extension);
    }

    /**
     * Check if file is audio
     */
    static isAudio(fileName: string): boolean {
        const extension = FileGalleryService.getFileExtension(fileName);
        return FileGalleryService.SUPPORTED_EXTENSIONS.audio.includes(extension);
    }

    /**
     * Check if file is a document (PDF)
     */
    static isDocument(fileName: string): boolean {
        const extension = FileGalleryService.getFileExtension(fileName);
        return FileGalleryService.SUPPORTED_EXTENSIONS.documents.includes(extension);
    }

    /**
     * Check if file is an office document
     */
    static isOfficeDocument(fileName: string): boolean {
        const extension = FileGalleryService.getFileExtension(fileName);
        return FileGalleryService.SUPPORTED_EXTENSIONS.office.includes(extension);
    }

    /**
     * Check if file is code
     */
    static isCode(fileName: string): boolean {
        const extension = FileGalleryService.getFileExtension(fileName);
        return FileGalleryService.SUPPORTED_EXTENSIONS.code.includes(extension);
    }

    /**
     * Check if file is text
     */
    static isText(fileName: string): boolean {
        const extension = FileGalleryService.getFileExtension(fileName);
        return FileGalleryService.SUPPORTED_EXTENSIONS.text.includes(extension);
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

    /**
     * Check if file can be embedded in browser
     */
    static canEmbed(fileName: string): boolean {
        return FileGalleryService.isImage(fileName) ||
               FileGalleryService.isVideo(fileName) ||
               FileGalleryService.isAudio(fileName) ||
               FileGalleryService.isDocument(fileName) ||
               FileGalleryService.isOfficeDocument(fileName);
    }

    /**
     * Get file type category
     */
    static getFileCategory(fileName: string): 'image' | 'video' | 'audio' | 'document' | 'office' | 'code' | 'text' | 'other' {
        const extension = FileGalleryService.getFileExtension(fileName);

        if (FileGalleryService.SUPPORTED_EXTENSIONS.images.includes(extension)) {
            return 'image';
        }
        if (FileGalleryService.SUPPORTED_EXTENSIONS.videos.includes(extension)) {
            return 'video';
        }
        if (FileGalleryService.SUPPORTED_EXTENSIONS.audio.includes(extension)) {
            return 'audio';
        }
        if (FileGalleryService.SUPPORTED_EXTENSIONS.documents.includes(extension)) {
            return 'document';
        }
        if (FileGalleryService.SUPPORTED_EXTENSIONS.office.includes(extension)) {
            return 'office';
        }
        if (FileGalleryService.SUPPORTED_EXTENSIONS.code.includes(extension)) {
            return 'code';
        }
        if (FileGalleryService.SUPPORTED_EXTENSIONS.text.includes(extension)) {
            return 'text';
        }

        return 'other';
    }
}
