import {NgIf} from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    ViewEncapsulation
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {FileGalleryItem} from '../file-gallery/file-gallery.component';

@Component({
    selector: 'file-preview-panel',
    templateUrl: './file-preview-panel.component.html',
    styleUrls: ['./file-preview-panel.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf, MatButtonModule, MatIconModule, MatTooltipModule
    ],
})
export class FilePreviewPanelComponent implements OnChanges {
    @Input() file: FileGalleryItem | null = null;
    @Input() visible = false;
    @Input() position: 'left' | 'right' = 'right';
    @Input() width = '400px';

    @Output() close = new EventEmitter<void>();
    @Output() download = new EventEmitter<FileGalleryItem>();
    @Output() fullscreen = new EventEmitter<FileGalleryItem>();

    // Cache para URLs do Office
    private cachedOfficeUrl: SafeResourceUrl | null = null;
    private lastOfficeFileUrl: string | null = null;

    // File type detection
    readonly imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'];
    readonly videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'];
    readonly audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'];
    readonly officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

    constructor(private sanitizer: DomSanitizer) {}

    ngOnChanges(changes: any): void {
        // Limpar cache quando arquivo mudar
        if (changes.file) {
            this.cachedOfficeUrl = null;
            this.lastOfficeFileUrl = null;
        }
    }

    get safeUrl(): SafeResourceUrl | null {
        if (!this.file?.presignedUrl) return null;
        return this.sanitizer.bypassSecurityTrustResourceUrl(this.file.presignedUrl);
    }

    isImage(): boolean {
        return this.file ? this.imageExtensions.includes(this.getExtension()) : false;
    }

    isVideo(): boolean {
        return this.file ? this.videoExtensions.includes(this.getExtension()) : false;
    }

    isAudio(): boolean {
        return this.file ? this.audioExtensions.includes(this.getExtension()) : false;
    }

    isPdf(): boolean {
        return this.getExtension() === 'pdf';
    }

    isOfficeDocument(): boolean {
        return this.file ? this.officeExtensions.includes(this.getExtension()) : false;
    }

    canPreview(): boolean {
        return this.isImage() || this.isVideo() || this.isAudio() || this.isPdf() || this.isOfficeDocument();
    }

    private getExtension(): string {
        if (!this.file?.originalName) return '';
        return this.file.originalName.split('.').pop()?.toLowerCase() || '';
    }

    onClose(): void {
        this.close.emit();
    }

    onDownload(): void {
        if (this.file && !this.file.isDirectory) {
            this.download.emit(this.file);
        }
    }

    onFullscreen(): void {
        if (this.file && !this.file.isDirectory) {
            this.fullscreen.emit(this.file);
        }
    }

    /**
     * Get Office 365 viewer URL for Office documents (with caching)
     */
    getOfficeViewerUrl(): SafeResourceUrl | null {
        if (!this.file?.presignedUrl || !this.isOfficeDocument()) {
            return null;
        }

        // Use cache se a URL não mudou
        if (this.lastOfficeFileUrl === this.file.presignedUrl && this.cachedOfficeUrl) {
            return this.cachedOfficeUrl;
        }

        // Use Google Docs viewer (mais estável)
        const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(this.file.presignedUrl)}&embedded=true`;
        this.cachedOfficeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl);
        this.lastOfficeFileUrl = this.file.presignedUrl;

        return this.cachedOfficeUrl;
    }

    formatFileSize(bytes: number): string {
        if (!bytes) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileIcon(): string {
        if (!this.file) return 'heroicons_outline:document';
        if (this.file.isDirectory) return 'heroicons_outline:folder';

        const ext = this.getExtension();

        if (this.imageExtensions.includes(ext)) return 'heroicons_outline:photo';
        if (this.videoExtensions.includes(ext)) return 'heroicons_outline:film';
        if (this.audioExtensions.includes(ext)) return 'heroicons_outline:musical-note';
        if (ext === 'pdf') return 'heroicons_outline:document-text';
        if (this.officeExtensions.includes(ext)) {
            if (['doc', 'docx'].includes(ext)) return 'heroicons_outline:document-text';
            if (['xls', 'xlsx'].includes(ext)) return 'heroicons_outline:table-cells';
            if (['ppt', 'pptx'].includes(ext)) return 'heroicons_outline:presentation-chart-bar';
        }

        return 'heroicons_outline:document';
    }
}
