import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {NgxFileDropEntry} from 'ngx-file-drop';
import {MatTableDataSource} from '@angular/material/table';
import {UtilFunctions} from "../../util/util-functions";
//import {fuseAnimations} from "../../../../@fuse/animations";
import {FormsModule, NgModel} from "@angular/forms";
import {Subject} from "rxjs/internal/Subject";
import {MimeHelper, PortalStorageFileModel} from '../../models/portal-storage.model';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NgxDocViewerModule} from 'ngx-doc-viewer';
import {NgClass, NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {SharedPipeModule} from '../../pipes/shared-pipe.module';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Highlight} from 'ngx-highlightjs';
import {HttpClient} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
    selector: 'file-viewer',
    templateUrl: './file-viewer.component.html',
    styleUrls: ['./file-viewer.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        NgxDocViewerModule,
        NgClass,
        NgIf,
        MatIconModule,
        SharedPipeModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        Highlight
    ],
    //animations   : fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class FileViewerComponent implements OnInit, AfterViewInit, OnDestroy{

    protected _onDestroy = new Subject<void>();

    @ViewChild('infoContainer', {read: ElementRef, static:false})
    infoContainer: ElementRef;

    @ViewChild('tituloModel', {read: NgModel, static:false})
    tituloModel:NgModel;

    @ViewChild('linkModel', {read: NgModel, static:false})
    linkModel:NgModel;

    @ViewChild('descricaoModel', {read: NgModel, static:false})
    descricaoModel:NgModel;

    protected _model: PortalStorageFileModel;
    protected url: string | any;
    @Input()
    showDocControls: boolean = true;

    @Input()
    showInfoFile: boolean = false;

    @Input()
    showInfoFileMode: 'hover' | 'allways' = 'hover';

    @Input()
    autoPlay: boolean = false;

    @Input()
    playerControlsBottomMargin: number = 0;

    @Input()
    muted: boolean = true;

    @Input()
    get model() {
        return this._model;
    }

    set model(model: PortalStorageFileModel) {
        model.fileType = MimeHelper.getFileType(model.originalName);
        model['canView'] = MimeHelper.canView(model);
        this._model = model;

        this.url = this.model.presignedUrl;
        if (this.model.fileType === 'CODE' || this.model.fileType === 'TEXT') {
            if (this.model.fileType === 'CODE') {
                this.model['languages'] = this.getHighlightLanguage();
            }
            this.loadTextContent();
            // if (UtilFunctions.isValidStringOrArray(this.model.content) === true) {
            //     this.textContent = this.model.content;
            //     this.textContentError = null;
            //     this.isLoadingTextContent = false;
            // }
        }
        // else if (this.model.fileType === 'DOCUMENT' || this.model.fileType === 'SPREADSHEET' || this.model.fileType === 'PRESENTATION') {
        //     this.setViewerUrl();
        // }
    }
    onClose: EventEmitter<any> = new EventEmitter<any>();
    onSave: EventEmitter<any> = new EventEmitter<any>();

    files = new MatTableDataSource<NgxFileDropEntry>();
    filesTableHeader = ['botao', 'tipo', 'arquivo'];

    mediaSource;
    hover: string = 'collapsed';
    videoControlBottom = -1;

    isLoadingTextContent = false;
    textContent: string = '';  // Inicializar como string vazia em vez de null
    textContentError: string | null = null;
    constructor(private snackBar: MatSnackBar, private http: HttpClient,
                private cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) {

    }

    ngOnInit(): void {


    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    showInfo() : boolean {
        return this.showInfoFile === true && (
            UtilFunctions.isValidStringOrArray(this.model.description) === true ||
            UtilFunctions.isValidStringOrArray(this.model.originalName) === true ||
            UtilFunctions.isValidStringOrArray(this.model.presignedUrl) === true)
    }

    navigate() {
        if (this.isLinkSameOrigin(this.model.presignedUrl) === true) {
            window.open(this.model.presignedUrl, "_self");
        } else {
            window.open(this.model.presignedUrl, "_blank");
        }
    }

    isLinkSameOrigin(link: string): boolean {
        if (link.startsWith('http') === true) {
            return link.startsWith(`${window.location.protocol}//${window.location.host}`);
        } else {
            return true;
        }
    }

    setHover(status: string) {
        this.hover = status;
    }

    clearImage(event: any): void {
        console.error('Error loading image:', event);
        this.url = 'assets/images/noPicture.png';
    }

    onMediaError(event: any): void {
        console.error('Media loading error:', event);
        this.snackBar.open('Erro ao carregar o arquivo', 'Fechar', { duration: 3000 });
    }

    /**
     * Load text content for code/text files via backend proxy
     */
    private loadTextContent(): void {
        if (!this.model?.presignedUrl) {
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
            url: this.model.presignedUrl
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

    getHighlightLanguage(): string[] {
        if (!this.model) return ['javascript']; // fallback padrão

        const extension = this.model.extension;

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
    formatFileSize(bytes: number): string {
        if (!bytes) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    setViewerUrl() {
        const viewerUrl = this.getViewerUrl();
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl);
    }

    getViewerUrl(): string {
        if (this.model.fileType === 'SPREADSHEET' || this.model.fileType === 'PRESENTATION') {
            return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(this.url)}`;
        } else {
            return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(this.url)}`;
        }
    }


    onIframeError($event: ErrorEvent) {
        console.error('Error loading iframe:', $event);
        this.model['canView'] = false;
        this.cdr.detectChanges();
    }

    onIframeLoad($event: Event) {
        console.log('Iframe loaded successfully:', $event);
    }
}
