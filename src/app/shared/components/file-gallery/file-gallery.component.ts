import {NgFor, NgIf} from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    ViewEncapsulation
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {HttpClient} from '@angular/common/http';
import {FileGalleryService} from '../../services/file-gallery.service';
import {HighlightModule} from 'ngx-highlightjs';

export interface FileGalleryItem {
    id: number;
    originalName: string;
    contentType?: string;
    size: number;
    presignedUrl?: string;
    extension?: string;
    isDirectory?: boolean;
    description?: string;
}

export interface FileGalleryConfig {
    allowDownload?: boolean;
    allowFullscreen?: boolean;
    showFileInfo?: boolean;
    theme?: 'light' | 'dark';
    maxWidth?: string;
    maxHeight?: string;
}

@Component({
    selector: 'file-gallery',
    templateUrl: './file-gallery.component.html',
    styleUrls: ['./file-gallery.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf, NgFor, MatButtonModule, MatIconModule, MatTooltipModule,
        MatProgressSpinnerModule, MatSnackBarModule, HighlightModule
    ]
})
export class FileGalleryComponent implements OnInit, OnChanges {
    @Input() files: FileGalleryItem[] = [];
    @Input() config: FileGalleryConfig = {};
    @Input() currentIndex = 0;
    @Input() visible = false;

    @Output() close = new EventEmitter<void>();
    @Output() download = new EventEmitter<FileGalleryItem>();
    @Output() indexChanged = new EventEmitter<number>();

    currentFile: FileGalleryItem | null = null;
    isLoading = false;
    safeUrl: SafeResourceUrl | null = null;
    isClosing = false; // Controle para animação de fechamento

    // Text content loading
    isLoadingTextContent = false;
    textContent: string = '';  // Inicializar como string vazia em vez de null
    textContentError: string | null = null;

    constructor(
        private sanitizer: DomSanitizer,
        private snackBar: MatSnackBar,
        private http: HttpClient,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.applyDefaultConfig();
        // Não carregar imediatamente, aguardar ser visível
        if (this.visible) {
            this.loadCurrentFile();
        }
    }

    ngOnChanges(changes: any): void {
        // Só recarregar se mudou o índice, arquivos ou visibilidade
        if (changes.currentIndex || changes.files || (changes.visible && changes.visible.currentValue)) {
            if (this.visible) {
                this.loadCurrentFile();
            }
        }

        // Reset closing state when becoming visible
        if (changes.visible && changes.visible.currentValue && !changes.visible.previousValue) {
            this.isClosing = false;
        }
    }

    private applyDefaultConfig(): void {
        this.config = {
            allowDownload: true,
            allowFullscreen: true,
            showFileInfo: true,
            theme: 'dark',
            maxWidth: '90vw',
            maxHeight: '90vh',
            ...this.config
        };
    }

    private loadCurrentFile(): void {
        if (this.files.length > 0 && this.currentIndex >= 0 && this.currentIndex < this.files.length) {
            this.currentFile = this.files[this.currentIndex];

            // Clear previous content
            this.clearTextContent();

            // Limpar cache do Office quando mudar arquivo
            this.cachedOfficeUrl = null;
            this.lastOfficeFileUrl = null;

            // Don't load content for directories
            if (this.currentFile.isDirectory) {
                this.safeUrl = null;
                this.isLoading = false;
                return;
            }

            // Load text content for code/text files
            if (this.isCode(this.currentFile) || this.isText(this.currentFile)) {
                this.loadTextContent();
            } else {
                this.loadFileContent();
            }
        } else {
            this.currentFile = null;
            this.safeUrl = null;
            this.cachedOfficeUrl = null;
            this.lastOfficeFileUrl = null;
            this.clearTextContent();
        }
    }

    private loadFileContent(): void {
        if (!this.currentFile?.presignedUrl) {
            return;
        }

        this.isLoading = true;

        // Para conteúdo que pode ser incorporado diretamente
        if (this.canEmbed(this.currentFile)) {
            this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.currentFile.presignedUrl);
            this.isLoading = false;
            return;
        }

        // Para outros tipos, preparamos para download/preview
        this.safeUrl = this.sanitizer.bypassSecurityTrustUrl(this.currentFile.presignedUrl);
        this.isLoading = false;
    }

    // Navigation methods
    goToPrevious(): void {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.loadCurrentFile();
            this.indexChanged.emit(this.currentIndex);
        }
    }

    goToNext(): void {
        if (this.currentIndex < this.files.length - 1) {
            this.currentIndex++;
            this.loadCurrentFile();
            this.indexChanged.emit(this.currentIndex);
        }
    }

    goToIndex(index: number): void {
        if (index >= 0 && index < this.files.length) {
            this.currentIndex = index;
            this.loadCurrentFile();
            this.indexChanged.emit(this.currentIndex);
        }
    }

    // File type detection methods (now using centralized service)
    isImage(file: FileGalleryItem): boolean {
        return FileGalleryService.isImage(file.originalName);
    }

    isVideo(file: FileGalleryItem): boolean {
        return FileGalleryService.isVideo(file.originalName);
    }

    isAudio(file: FileGalleryItem): boolean {
        return FileGalleryService.isAudio(file.originalName);
    }

    isDocument(file: FileGalleryItem): boolean {
        return FileGalleryService.isDocument(file.originalName);
    }

    isOfficeDocument(file: FileGalleryItem): boolean {
        return FileGalleryService.isOfficeDocument(file.originalName);
    }

    isCode(file: FileGalleryItem): boolean {
        return FileGalleryService.isCode(file.originalName);
    }

    isText(file: FileGalleryItem): boolean {
        return FileGalleryService.isText(file.originalName);
    }

    isPdf(file: FileGalleryItem): boolean {
        return FileGalleryService.isDocument(file.originalName); // PDF is a document
    }

    canEmbed(file: FileGalleryItem): boolean {
        return FileGalleryService.canEmbed(file.originalName);
    }

    canPreview(file: FileGalleryItem): boolean {
        return FileGalleryService.canPreview(file.originalName, file.isDirectory);
    }

    private getFileExtension(file: FileGalleryItem): string {
        return FileGalleryService.getFileExtension(file.originalName);
    }

    // UI methods
    onClose(): void {
        this.close.emit();
    }

    onDownload(): void {
        if (this.currentFile && !this.currentFile.isDirectory) {
            this.download.emit(this.currentFile);
        }
    }

    onFullscreen(): void {
        if (this.currentFile?.presignedUrl && !this.currentFile.isDirectory) {
            window.open(this.currentFile.presignedUrl, '_blank');
        }
    }

    private cachedOfficeUrl: SafeResourceUrl | null = null;
    private lastOfficeFileUrl: string | null = null;

    /**
     * Get Office 365 viewer URL for Office documents (with caching)
     */
    getOfficeViewerUrl(): SafeResourceUrl | null {
        if (!this.currentFile?.presignedUrl || !this.isOfficeDocument(this.currentFile)) {
            return null;
        }

        // Use cache se a URL não mudou
        if (this.lastOfficeFileUrl === this.currentFile.presignedUrl && this.cachedOfficeUrl) {
            return this.cachedOfficeUrl;
        }

        // Use Google Docs viewer (mais estável que Office Online)
        const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(this.currentFile.presignedUrl)}&embedded=true`;
        this.cachedOfficeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl);
        this.lastOfficeFileUrl = this.currentFile.presignedUrl;

        return this.cachedOfficeUrl;
    }

    formatFileSize(bytes: number): string {
        if (!bytes) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Keyboard navigation
    onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.goToPrevious();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.goToNext();
                break;
            case 'Escape':
                event.preventDefault();
                this.onClose();
                break;
            case ' ':
                event.preventDefault();
                // Space can be used for play/pause in future
                break;
        }
    }

    // Error handling
    onMediaError(event: any): void {
        console.error('Media loading error:', event);
        this.snackBar.open('Erro ao carregar o arquivo', 'Fechar', { duration: 3000 });
    }

    onMediaLoad(): void {
        this.isLoading = false;
    }

    /**
     * Load text content for code/text files via backend proxy
     */
    private loadTextContent(): void {
        if (!this.currentFile?.presignedUrl) {
            this.textContentError = 'URL do arquivo não disponível';
            this.cdr.detectChanges();
            return;
        }

        this.isLoadingTextContent = true;
        this.textContent = '';
        this.textContentError = null;
        this.cdr.detectChanges();

        // Use backend proxy to avoid CORS issues
        const requestBody = {
            url: this.currentFile.presignedUrl
        };

        this.http.post('/api/public/files/fetch-text-content', requestBody, {
            responseType: 'text',
            headers: {
                'Content-Type': 'application/json'
            }
        }).subscribe({
            next: (content) => {
                this.textContent = content || '';  // Garantir que nunca seja null
                this.isLoadingTextContent = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading text content via backend:', error);

                let errorMsg = 'Erro ao carregar o conteúdo do arquivo';

                if (error.status === 400) {
                    errorMsg = 'URL inválida';
                } else if (error.status === 502) {
                    errorMsg = 'Não foi possível acessar o arquivo remoto';
                } else if (error.status === 500) {
                    errorMsg = 'Erro interno do servidor';
                } else if (error.error && typeof error.error === 'string') {
                    errorMsg = error.error;
                }

                this.textContentError = errorMsg + '. Use o botão "Abrir em Nova Aba" para visualizar o arquivo.';
                this.isLoadingTextContent = false;
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Clear text content state
     */
    private clearTextContent(): void {
        this.textContent = '';  // String vazia em vez de null
        this.textContentError = null;
        this.isLoadingTextContent = false;
        this.cdr.detectChanges();
    }

    /**
     * Get language for syntax highlighting based on file extension
     */
    getHighlightLanguage(): string[] {
        if (!this.currentFile) return ['javascript']; // fallback padrão

        const extension = FileGalleryService.getFileExtension(this.currentFile.originalName);

        // Map file extensions to highlight.js language names
        const languageMap: { [key: string]: string } = {
            'ts': 'typescript',
            'js': 'javascript',
            'html': 'xml',
            'xml': 'xml',
            'css': 'css',
            'scss': 'css',
            'sass': 'css',
            'json': 'json',
            'java': 'java',
            'py': 'python',
            'php': 'php',
            'sql': 'sql',
            'sh': 'bash',
            'bash': 'bash',
            'md': 'markdown',
            'yaml': 'yaml',
            'yml': 'yaml',
            'dockerfile': 'dockerfile',
            'cpp': 'cpp',
            'c': 'c',
            'cs': 'csharp',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'kt': 'kotlin',
            'swift': 'swift',
            'txt': 'javascript', // usar javascript como fallback para texto
            'log': 'javascript'  // usar javascript como fallback para logs
        };

        const language = languageMap[extension] || 'javascript'; // fallback para javascript
        return [language];
    }

    /**
     * Get updated file icon with Office support
     */
    getFileIcon(file: FileGalleryItem): string {
        if (file.isDirectory) return 'heroicons_outline:folder';

        const category = FileGalleryService.getFileCategory(file.originalName);

        switch (category) {
            case 'image': return 'heroicons_outline:photo';
            case 'video': return 'heroicons_outline:film';
            case 'audio': return 'heroicons_outline:musical-note';
            case 'document': return 'heroicons_outline:document-text';
            case 'office':
                const ext = FileGalleryService.getFileExtension(file.originalName);
                if (['doc', 'docx'].includes(ext)) return 'heroicons_outline:document-text';
                if (['xls', 'xlsx'].includes(ext)) return 'heroicons_outline:table-cells';
                if (['ppt', 'pptx'].includes(ext)) return 'heroicons_outline:presentation-chart-bar';
                return 'heroicons_outline:document-text';
            case 'code': return 'heroicons_outline:code-bracket';
            case 'text': return 'heroicons_outline:document-text';
            default: return 'heroicons_outline:document';
        }
    }
}
