import {NgClass, NgFor, NgIf} from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatMenuModule} from '@angular/material/menu';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {SelectionModel} from '@angular/cdk/collections';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {PortalStorageService} from '../portal-storage.service';
import {
    EditFileRequestModel,
    FileGridConfigModel,
    FileListItemModel,
    FileSelectionStateModel,
    PortalStorageEntityIdentifierModel,
    PortalStorageFileModel,
    StorageNavigationStateModel
} from 'app/shared/models/portal-storage.model';
import {debounceTime, distinctUntilChanged, filter, firstValueFrom, Subject, takeUntil} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {CreateFolderDialogComponent} from './dialogs/create-folder-dialog.component';
import {RenameFileDialogComponent} from './dialogs/rename-file-dialog.component';
import {EditFileDialogComponent} from './dialogs/edit-file-dialog.component';
import {
    FileGalleryComponent,
    FileGalleryConfig,
    FileGalleryItem
} from 'app/shared/components/file-gallery/file-gallery.component';
import {FilePreviewPanelComponent} from 'app/shared/components/file-preview-panel/file-preview-panel.component';
import {FileGalleryService} from 'app/shared/services/file-gallery.service';
import {
    PortalStorageDownloadFoldersFilesComponent,
    StorageDownloadFoldersFilesModalData
} from '../modal/portal-storage-download-folders-files.component';
import {cloneDeep} from 'lodash-es';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';

interface UploadProgress {
    id: string;
    fileName: string;
    progress: number;
    status: 'uploading' | 'completed' | 'error' | 'cancelled';
    file?: File;
    xhr?: XMLHttpRequest;
}

@Component({
    selector: 'portal-storage-file-explorer',
    templateUrl: './portal-storage-file-explorer.component.html',
    styleUrls: ['./portal-storage-file-explorer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf, NgFor, NgClass, FormsModule,
        MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatProgressBarModule,
        MatTableModule, MatTooltipModule, MatCardModule, MatChipsModule,
        MatMenuModule, MatCheckboxModule, MatToolbarModule, MatSidenavModule,
        MatListModule, MatDividerModule, MatInputModule, MatFormFieldModule,
        MatSnackBarModule, MatDialogModule, ScrollingModule, FileGalleryComponent,
        FilePreviewPanelComponent
    ],
})
export class PortalStorageFileExplorerComponent implements OnInit, OnDestroy {
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    @ViewChild('folderInput') folderInput!: ElementRef<HTMLInputElement>;

    files: FileListItemModel[] = [];
    isLoading = false;
    navigationState: StorageNavigationStateModel | null = null;

    // Drag & Drop state
    isDragOver = false;
    uploadProgress: UploadProgress[] = [];

    // Route parameters - fallback when navigationState is not available
    private _currentIdenfier: PortalStorageEntityIdentifierModel | null = null;
    private _currentDirectoryPath: string = '';

    // Grid configuration
    gridConfig: FileGridConfigModel = {
        viewMode: 'list',
        sortBy: 'name',
        sortDirection: 'asc',
        showHidden: false,
        itemsPerPage: 50
    };

    // Selection
    selection = new SelectionModel<FileListItemModel>(true, []);
    selectionState: FileSelectionStateModel = {
        selectedFiles: [],
        allSelected: false,
        someSelected: false
    };

    // Table configuration
    displayedColumns: string[] = ['actions', 'select', 'icon', 'name', 'size', 'modified'];
    dataSource = new MatTableDataSource<FileListItemModel>();

    // Search
    searchTerm = '';
    filteredFiles: FileListItemModel[] = [];

    // Gallery state
    galleryVisible = false;
    galleryFiles: FileGalleryItem[] = [];
    galleryCurrentIndex = 0;
    galleryConfig: FileGalleryConfig = {
        allowDownload: true,
        allowFullscreen: true,
        showFileInfo: true,
        theme: 'dark'
    };

    // Preview panel state
    previewPanelVisible = false;
    previewPanelFile: FileGalleryItem | null = null;
    previewMode: 'gallery' | 'panel' = 'gallery'; // User preference

    private _unsubscribeAll: Subject<void> = new Subject<void>();
    private _searchSubject = new Subject<string>();

    constructor(
        private _route: ActivatedRoute,
        public _router: Router,
        private _storageService: PortalStorageService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _messageService: MessageDialogService,
        private _snackBar: MatSnackBar,
        private _dialog: MatDialog
    ) {
        // Setup search
        this._searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this._unsubscribeAll)
        ).subscribe(searchTerm => {
            this.applyFilter(searchTerm);
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        console.log('🔍 FileExplorer Component initialized');
        console.log('🔍 Current URL:', this._router.url);

        // Subscribe to router events
        this._router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            takeUntil(this._unsubscribeAll)
        ).subscribe(() => {
            setTimeout(() => {
                this.loadFilesFromRoute();
            }, 50);
        });

        // Subscribe to service states
        this._storageService.isLoading$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(isLoading => {
                this.isLoading = isLoading;
                this._changeDetectorRef.markForCheck();
            });

        this._storageService.files$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(files => {
                this.processFiles(files);
                this._changeDetectorRef.markForCheck();
            });

        this._storageService.navigationState$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(state => {
                this.navigationState = state;
                this._changeDetectorRef.markForCheck();
            });

        this.selection.changed.subscribe(() => {
            this.updateSelectionState();
        });

        this.loadFilesFromRoute();
    }

    ngOnDestroy(): void {
        // Cancel any ongoing uploads
        this.uploadProgress.forEach(upload => {
            if (upload.xhr) {
                upload.xhr.abort();
            }
        });
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Drag & Drop Methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Handle drag enter
     */
    onDragEnter(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Handle drag over
     */
    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();

        if (!this.isDragOver) {
            this.isDragOver = true;
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * Handle drag leave
     */
    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();

        // Only hide if we're leaving the drop zone completely
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const x = event.clientX;
        const y = event.clientY;

        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            this.isDragOver = false;
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * Handle files being dropped (updated to support folders)
     */
    onFilesDropped(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();

        this.isDragOver = false;
        this._changeDetectorRef.markForCheck();

        const items = event.dataTransfer?.items;

        if (items && items.length > 0) {
            console.log('Items dropped:', items);
            this.handleDroppedItems(items);
        } else {
            // Fallback para browsers mais antigos
            const files = event.dataTransfer?.files;
            if (files && files.length > 0) {
                const fileArray = Array.from(files);
                console.log('Files dropped (fallback):', fileArray);
                this.startBatchUpload(fileArray);
            }
        }
    }

    /**
     * Handle manual file selection (updated to support folder selection)
     */
    onFilesSelected(event: any): void {
        const input = event.target as HTMLInputElement;
        const files: File[] = Array.from(input.files || []);

        if (files.length > 0) {
            // Se tem webkitRelativePath, significa que foi seleção de pasta
            const hasWebkitRelativePath = files.some(file => (file as any).webkitRelativePath);

            if (hasWebkitRelativePath) {
                // Upload com estrutura de pastas
                const filesWithPaths = files.map(file => ({
                    file,
                    path: (file as any).webkitRelativePath || file.name
                }));
                this.startBatchUploadWithPaths(filesWithPaths);
            } else {
                // Upload simples de arquivos
                this.startBatchUpload(files);
            }
        }
        // Reset input
        event.target.value = '';
    }

    /**
     * Start batch upload of multiple files
     */
    private startBatchUpload(files: File[]): void {
        const currentPath = this.navigationState?.currentPath || '';

        files.forEach(file => {
            this.uploadFile(file, currentPath);
        });
    }

    /**
     * Handle dropped items (files and folders)
     */
    private async handleDroppedItems(items: DataTransferItemList): Promise<void> {
        const filesToUpload: { file: File; path: string }[] = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (item.kind === 'file') {
                const entry = item.webkitGetAsEntry();
                if (entry) {
                    await this.processEntry(entry, '', filesToUpload);
                }
            }
        }

        console.log('Total files to upload:', filesToUpload.length);

        if (filesToUpload.length > 0) {
            this.startBatchUploadWithPaths(filesToUpload);
        }
    }

    /**
     * Process file system entries recursively
     */
    private async processEntry(
        entry: any,
        basePath: string,
        filesToUpload: { file: File; path: string }[]
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            if (entry.isFile) {
                // É um arquivo
                entry.file((file: File) => {
                    const fullPath = basePath ? `${basePath}/${file.name}` : file.name;
                    console.log(`📄 Arquivo encontrado: ${fullPath} (${file.size} bytes)`);
                    filesToUpload.push({ file, path: fullPath });
                    resolve();
                }, (error: any) => {
                    console.error(`❌ Erro ao ler arquivo ${entry.name}:`, error);
                    reject(error);
                });
            } else if (entry.isDirectory) {
                // É uma pasta
                const dirReader = entry.createReader();
                const newBasePath = basePath ? `${basePath}/${entry.name}` : entry.name;
                console.log(`📁 Processando diretório: ${newBasePath}`);

                const readEntries = () => {
                    dirReader.readEntries(async (entries: any[]) => {
                        if (entries.length === 0) {
                            // Fim das entradas do diretório
                            console.log(`✅ Diretório ${newBasePath} processado completamente`);
                            resolve();
                            return;
                        }

                        console.log(`📂 Encontradas ${entries.length} entradas em ${newBasePath}`);

                        try {
                            // Processa todas as entradas desta pasta
                            const promises = entries.map((subEntry, index) => {
                                console.log(`  ${index + 1}. ${subEntry.name} (${subEntry.isFile ? 'arquivo' : 'diretório'})`);
                                return this.processEntry(subEntry, newBasePath, filesToUpload);
                            });
                            await Promise.all(promises);

                            // Continue lendo mais entradas (alguns browsers retornam em lotes)
                            readEntries();
                        } catch (error) {
                            console.error(`❌ Erro ao processar entradas de ${newBasePath}:`, error);
                            reject(error);
                        }
                    }, (error: any) => {
                        console.error(`❌ Erro ao ler entradas do diretório ${newBasePath}:`, error);
                        reject(error);
                    });
                };

                readEntries();
            }
        });
    }

    /**
     * Start batch upload with file paths
     */
    private startBatchUploadWithPaths(files: { file: File; path: string }[]): void {
        const currentPath = this.navigationState?.currentPath || '';

        console.log(`🎯 Iniciando batch upload de ${files.length} arquivos:`);
        files.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.file.name} -> ${item.path}`);
        });

        files.forEach(({ file, path }) => {
            // Combina o path atual da navegação com o path relativo do arquivo
            const fullPath = currentPath ? `${currentPath}/${path}` : path;
            console.log(`📤 Preparando upload: ${file.name} com fullPath: ${fullPath}`);
            this.uploadFile(file, fullPath);
        });

        console.log(`🚀 Todos os ${files.length} uploads foram iniciados`);
    }

    /**
     * Upload a single file with progress tracking (updated to support full paths)
     */
    private uploadFile(file: File, fullPath: string = ''): void {
        const identifierId = this._getCurrentIdentifierId();

        if (!identifierId) {
            this._snackBar.open('Erro: parâmetros de upload inválidos', 'Fechar', { duration: 3000 });
            return;
        }

        const uploadId = this.generateUploadId();

        // Se fullPath foi fornecido, usa ele; senão, usa apenas o nome do arquivo
        const finalPath = fullPath || file.name;

        console.log(`🚀 Iniciando upload: ${file.name} -> ${finalPath}`);

        // Create upload progress entry
        const uploadProgress: UploadProgress = {
            id: uploadId,
            fileName: file.name,
            progress: 0,
            status: 'uploading'
        };

        this.uploadProgress.push(uploadProgress);
        this._changeDetectorRef.markForCheck();

        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fullPath', finalPath);

        console.log(`📤 FormData preparado para ${file.name}:`, {
            fileName: file.name,
            fullPath: finalPath,
            fileSize: file.size
        });

        // Create XMLHttpRequest for progress tracking
        const xhr = new XMLHttpRequest();
        uploadProgress.xhr = xhr;

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                uploadProgress.progress = Math.round((event.loaded / event.total) * 100);
                this._changeDetectorRef.markForCheck();
            }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                uploadProgress.status = 'completed';
                uploadProgress.progress = 100;
                console.log(`✅ Upload concluído: ${file.name}`);
                this._snackBar.open(`${file.name} enviado com sucesso`, 'Fechar', { duration: 3000 });

                // Refresh file list and remove progress after 2 seconds
                setTimeout(() => {
                    this.refresh();
                    this.removeUploadProgress(uploadId);
                }, 2000);
            } else {
                uploadProgress.status = 'error';
                let errorMessage = `Erro ao enviar ${file.name}`;

                console.error(`❌ Erro no upload de ${file.name}:`, {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText
                });

                // Try to get error message from response
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.message) {
                        errorMessage += `: ${response.message}`;
                    }
                } catch (e) {
                    // Provide specific error messages based on status code
                    if (xhr.status === 413) {
                        errorMessage += ': Arquivo muito grande';
                    } else if (xhr.status === 400) {
                        errorMessage += ': Dados inválidos';
                    } else if (xhr.status === 404) {
                        errorMessage += ': Endpoint não encontrado';
                    } else if (xhr.status === 500) {
                        errorMessage += ': Erro interno do servidor';
                    } else {
                        errorMessage += `: Status ${xhr.status}`;
                    }
                }

                this._snackBar.open(errorMessage, 'Fechar', { duration: 5000 });

                // Remove error progress after 5 seconds
                setTimeout(() => this.removeUploadProgress(uploadId), 5000);
            }
            this._changeDetectorRef.markForCheck();
        });

        // Handle errors
        xhr.addEventListener('error', () => {
            uploadProgress.status = 'error';
            console.error(`❌ Erro de rede no upload de ${file.name}`);
            this._snackBar.open(`Erro ao enviar ${file.name}`, 'Fechar', { duration: 3000 });
            this._changeDetectorRef.markForCheck();

            // Remove error progress after 5 seconds
            setTimeout(() => this.removeUploadProgress(uploadId), 5000);
        });

        // Handle cancellation
        xhr.addEventListener('abort', () => {
            uploadProgress.status = 'cancelled';
            console.log(`⏹️ Upload cancelado: ${file.name}`);
            this._changeDetectorRef.markForCheck();
            setTimeout(() => this.removeUploadProgress(uploadId), 1000);
        });

        // Start upload
        const url = `/api/admin/portal/storage/upload-file/${identifierId}`;
        console.log(`📡 Enviando para URL: ${url}`);
        xhr.open('POST', url);
        xhr.send(formData);
    }

    /**
     * Cancel an upload
     */
    cancelUpload(uploadId: string): void {
        const upload = this.uploadProgress.find(u => u.id === uploadId);
        if (upload && upload.xhr) {
            upload.xhr.abort();
        }
    }

    /**
     * Remove upload from progress list
     */
    removeUploadProgress(uploadId: string): void {
        this.uploadProgress = this.uploadProgress.filter(u => u.id !== uploadId);
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Check if there are completed or error uploads
     */
    hasCompletedOrErrorUploads(): boolean {
        return this.uploadProgress.some(u => u.status === 'completed' || u.status === 'error');
    }

    /**
     * Clear all completed and error uploads
     */
    clearCompletedUploads(): void {
        this.uploadProgress = this.uploadProgress.filter(u => u.status === 'uploading');
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Generate unique upload ID
     */
    private generateUploadId(): string {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Dialog Methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open upload dialog
     */
    openUploadDialog(): void {
        this.fileInput.nativeElement.click();
    }

    /**
     * Open folder upload dialog
     */
    openFolderUploadDialog(): void {
        this.folderInput.nativeElement.click();
    }

    /**
     * Open create folder dialog
     */
    openCreateFolderDialog(): void {
        const identifierId = this._getCurrentIdentifierId();
        const currentPath = this.navigationState?.currentPath || '';

        if (!identifierId) {
            this._snackBar.open('Erro: parâmetros inválidos', 'Fechar', { duration: 3000 });
            return;
        }

        const dialogRef = this._dialog.open(CreateFolderDialogComponent, {
            width: '500px',
            data: {
                currentPath: currentPath
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const params = new URLSearchParams();
                params.set('directoryPath', currentPath ? `${currentPath}/${result.name}` : result.name);
                if (result.description) {
                    params.set('description', result.description);
                }

                fetch(`/api/admin/portal/storage/create-directory/${identifierId}`, {
                    method: 'POST',
                    body: params
                }).then(response => {
                    if (response.ok) {
                        this._snackBar.open('Pasta criada com sucesso', 'Fechar', { duration: 3000 });
                        this.refresh();
                    } else {
                        this._snackBar.open('Erro ao criar pasta', 'Fechar', { duration: 3000 });
                    }
                }).catch(error => {
                    console.error('Error creating directory:', error);
                    this._snackBar.open('Erro ao criar pasta', 'Fechar', { duration: 3000 });
                });
            }
        });
    }

    /**
     * Open rename dialog
     */
    openRenameDialog(file: FileListItemModel): void {
        const dialogRef = this._dialog.open(RenameFileDialogComponent, {
            width: '500px',
            data: {
                fileName: file.originalName,
                isDirectory: file.isDirectory
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result !== file.originalName) {
                this.renameFile(file, result);
            }
        });
    }

    /**
     * Open edit details dialog
     */
    openEditDialog(file: FileListItemModel): void {
        const dialogRef = this._dialog.open(EditFileDialogComponent, {
            width: '600px',
            data: {
                file: file
            }
        });

        dialogRef.afterClosed().subscribe((result: EditFileRequestModel) => {
            if (result) {
                this.updateFileDetails(file, result);
            }
        });
    }

    /**
     * Rename file
     */
    private renameFile(file: FileListItemModel, newName: string): void {
        const oldPath = file.fullPath;
        const pathParts = oldPath.split('/');
        pathParts[pathParts.length - 1] = newName;
        const newPath = pathParts.join('/');

        fetch(`/api/admin/portal/storage/files/${file.id}/move`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newFullPath: newPath })
        }).then(response => {
            if (response.ok) {
                this._snackBar.open('Arquivo renomeado com sucesso', 'Fechar', { duration: 3000 });
                this.refresh();
            } else {
                this._snackBar.open('Erro ao renomear arquivo', 'Fechar', { duration: 3000 });
            }
        }).catch(error => {
            console.error('Error renaming file:', error);
            this._snackBar.open('Erro ao renomear arquivo', 'Fechar', { duration: 3000 });
        });
    }

    /**
     * Update file details
     */
    private updateFileDetails(file: FileListItemModel, details: EditFileRequestModel): void {
        console.log('Update file details:', file, details);
        const updateData = cloneDeep(file);
        updateData.description = details.description;
        firstValueFrom(this._storageService.updateFile(updateData)).then(result => {
            file = {
                ...result,
                selected: false,
                icon: this._storageService.getFileIcon(result),
                sizeFormatted: this.formatFileSize(result.size),
                lastModifiedFormatted: this.formatDate(file.updatedAt)
            }
            const index = this.dataSource.data.findIndex(x => x.id === result.id);
            this.dataSource.data[index] = file;
            this.dataSource._updateChangeSubscription();
            this._changeDetectorRef.detectChanges();
            this._snackBar.open('Detalhes do arquivo atualizados com sucesso', 'Fechar', { duration: 3000 });

        })
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Existing Methods (kept from original component)
    // -----------------------------------------------------------------------------------------------------

    loadFilesFromRoute(): void {
        const identifierId = this._route.snapshot.paramMap.get('identifierId');

        if (identifierId) {
            const id = parseInt(identifierId, 10);

            const directoryPath = this._route.snapshot.queryParamMap.get('path') || '';
            this._currentDirectoryPath = directoryPath;
            this.loadDirectory(id, directoryPath);

        }
    }

    loadDirectory(identifierId: number, directoryPath: string = ''): void {
        if (directoryPath) {
            firstValueFrom(this._storageService.getIdentifierDirectoryContents(identifierId, directoryPath)).then(result => {
                this._currentIdenfier = result;
                this._storageService.navigateToFileExplorer(
                    result.entity.user.id,
                    result.entity.user.name,
                    result.entityId,
                    result.entity.name,
                    identifierId,
                    result.name,
                    directoryPath
                );
            });
        }
        else {
            firstValueFrom(this._storageService.getIdentifierRootFiles(identifierId)).then(result => {
                this._currentIdenfier = result;
                this._storageService.navigateToFileExplorer(
                    result.entity.user.id,
                    result.entity.user.name,
                    result.entityId,
                    result.entity.name,
                    identifierId,
                    result.name,
                    directoryPath
                );
            });
        }
    }

    navigateToDirectory(file: FileListItemModel): void {
        if (!file.isDirectory) return;

        const userId = this._getCurrentUserId();
        const entityId = this._getCurrentEntityId();
        const identifierId = this._getCurrentIdentifierId();

        if (!userId || !entityId || !identifierId) {
            console.error('Parâmetros de navegação obrigatórios ausentes');
            return;
        }

        const currentPath = this.navigationState?.currentPath ?? this._currentDirectoryPath;
        const newPath = currentPath ? `${currentPath}/${file.originalName}` : file.originalName;

        this._router.navigate(
            ['/portal/storage/users', userId, 'entities', entityId, 'identifiers', identifierId, 'files'],
            { queryParams: { path: newPath } }
        );
    }

    navigateUp(): void {
        const userId = this._getCurrentUserId();
        const entityId = this._getCurrentEntityId();
        const identifierId = this._getCurrentIdentifierId();
        const currentPath = this.navigationState?.currentPath ?? this._currentDirectoryPath;

        if (!userId || !entityId || !identifierId) {
            console.error('Parâmetros de navegação obrigatórios ausentes');
            return;
        }

        if (!currentPath) return;

        const pathParts = currentPath.split('/');
        pathParts.pop();
        const newPath = pathParts.join('/');

        if (newPath) {
            this._router.navigate(
                ['/portal/storage/users', userId, 'entities', entityId, 'identifiers', identifierId, 'files'],
                { queryParams: { path: newPath } }
            );
        } else {
            this._router.navigate([
                '/portal/storage/users', userId, 'entities', entityId, 'identifiers', identifierId, 'files'
            ]);
        }
    }

    navigateTo(breadcrumb: any): void {
        if (!breadcrumb.clickable) return;
        this._router.navigateByUrl(breadcrumb.path);
    }

    goBack(): void {
        const userId = this._getCurrentUserId();
        const entityId = this._getCurrentEntityId();

        if (!userId || !entityId) {
            this._router.navigate(['/portal/storage']);
            return;
        }

        this._router.navigate([
            '/portal/storage/users',
            userId,
            'entities',
            entityId,
            'identifiers'
        ]);
    }

    // File operations
    downloadFile(file: FileListItemModel): void {
        if (file.isDirectory) return;

        this._storageService.downloadFile(file.id, true).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = file.originalName;
                link.click();
                window.URL.revokeObjectURL(url);

                this._snackBar.open('Arquivo baixado com sucesso', 'Fechar', { duration: 3000 });
            },
            error: (error) => {
                console.error('Download error:', error);
                this._snackBar.open('Erro ao baixar arquivo', 'Fechar', { duration: 3000 });
            }
        });
    }

    previewFile(file: FileListItemModel): void {
        if (file.isDirectory) {
            this.navigateToDirectory(file);
            return;
        }

        // Check if we can show in gallery/preview
        if (this.canShowInGallery(file)) {
            if (this.previewMode === 'panel') {
                this.openPreviewPanel(file);
            } else {
                this.openGallery([file], 0);
            }
        } else {
            // Fallback to opening in new tab
            this._storageService.downloadFile(file.id, false).subscribe({
                next: (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    window.open(url, '_blank');
                },
                error: (error) => {
                    console.error('Preview error:', error);
                    this._snackBar.open('Erro ao visualizar arquivo', 'Fechar', { duration: 3000 });
                }
            });
        }
    }

    deleteSelectedFiles(): void {
        const selectedFiles = this.selection.selected;
        if (selectedFiles.length === 0) return;

        const fileNames = selectedFiles.map(f => f.originalName).join(', ');
        this._messageService.open(`Tem certeza de que deseja excluir: ${fileNames}?`, 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                selectedFiles.forEach(file => {
                    this._storageService.deleteFile(file.id, file.isDirectory).subscribe({
                        next: () => {
                            this._snackBar.open(`${file.originalName} excluído com sucesso`, 'Fechar', { duration: 3000 });
                            this.refresh();
                        },
                        error: (error) => {
                            console.error('Delete error:', error);
                            this._snackBar.open(`Erro ao excluir ${file.originalName}`, 'Fechar', { duration: 3000 });
                        }
                    });
                });

                this.selection.clear();
            }
        });
    }

    deleteFile(file: FileListItemModel): void {
        this._messageService.open(`Tem certeza de que deseja excluir "${file.originalName}"?`, 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                this._storageService.deleteFile(file.id, file.isDirectory).subscribe({
                    next: () => {
                        this._snackBar.open(`${file.originalName} excluído com sucesso`, 'Fechar', { duration: 3000 });
                        this.refresh();
                    },
                    error: (error) => {
                        console.error('Delete error:', error);
                        this._snackBar.open(`Erro ao excluir ${file.originalName}`, 'Fechar', { duration: 3000 });
                    }
                });
            }
        });
    }

    /**
     * Download folder as ZIP
     */
    downloadFolder(file: FileListItemModel): void {
        if (!file.isDirectory) return;

        const identifierId = this.navigationState?.identifierId;
        const currentPath = this.navigationState?.currentPath ?? this._currentDirectoryPath;
        const folderPath = currentPath ? `${currentPath}/${file.originalName}` : file.originalName;

        if (!identifierId) {
            this._snackBar.open('Erro: ID do identificador não encontrado', 'Fechar', { duration: 3000 });
            return;
        }

        const modalData: StorageDownloadFoldersFilesModalData = {
            identifierId: identifierId,
            folderId: file.id,
            folderPath: folderPath,
            folderName: file.originalName
        };

        const dialogRef = this._dialog.open(PortalStorageDownloadFoldersFilesComponent, {
            disableClose: true,
            panelClass: 'portal-storage-download-folders-files-container',
            data: modalData
        });

        dialogRef.componentInstance.data = modalData;
    }

    // View management
    toggleViewMode(): void {
        this.gridConfig.viewMode = this.gridConfig.viewMode === 'list' ? 'grid' : 'list';
    }

    sortFiles(sortBy: string): void {
        if (this.gridConfig.sortBy === sortBy) {
            this.gridConfig.sortDirection = this.gridConfig.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.gridConfig.sortBy = sortBy as any;
            this.gridConfig.sortDirection = 'asc';
        }

        this.applySorting();
    }

    toggleAllSelection(): void {
        if (this.isAllSelected()) {
            this.selection.clear();
        } else {
            this.filteredFiles.forEach(file => this.selection.select(file));
        }
    }

    isAllSelected(): boolean {
        return this.selection.selected.length === this.filteredFiles.length && this.filteredFiles.length > 0;
    }

    isSomeSelected(): boolean {
        return this.selection.selected.length > 0 && !this.isAllSelected();
    }

    toggleFileSelection(file: FileListItemModel): void {
        this.selection.toggle(file);
    }

    onRowClick(file: FileListItemModel, event: MouseEvent): void {
        const target = event.target as HTMLElement;

        if (target.closest('.file-name-cell') ||
            target.closest('mat-checkbox') ||
            target.closest('button')) {
            return;
        }

        this.toggleFileSelection(file);
    }

    onFileNameClick(file: FileListItemModel, event: MouseEvent): void {
        event.stopPropagation();

        if (file.isDirectory) {
            this.navigateToDirectory(file);
        } else {
            this.previewFile(file);
        }
    }

    onFileDoubleClick(file: FileListItemModel): void {
        if (file.isDirectory) {
            this.navigateToDirectory(file);
        } else {
            this.previewFile(file);
        }
    }

    onSearchInput(value: string): void {
        this.searchTerm = value;
        this._searchSubject.next(value);
    }

    refresh(): void {
        const identifierId = this.navigationState?.identifierId;
        const currentPath = this.navigationState?.currentPath ?? this._currentDirectoryPath;

        if (identifierId) {
            this.loadDirectory(identifierId, currentPath);
        } else {
            this.loadFilesFromRoute();
        }
    }

    getFileIcon(file: FileListItemModel | PortalStorageFileModel): string {
        return this._storageService.getFileIcon(file);
    }

    getFileIconFromName(fileName: string): string {
        const category = FileGalleryService.getFileCategory(fileName);

        const iconMap: { [key: string]: string } = {
            'image': 'heroicons_outline:photo',
            'video': 'heroicons_outline:film',
            'audio': 'heroicons_outline:musical-note',
            'document': 'heroicons_outline:document-text',
            'office': 'heroicons_outline:document-text',
            'code': 'heroicons_outline:code-bracket',
            'text': 'heroicons_outline:document-text'
        };

        if (category === 'office') {
            const ext = FileGalleryService.getFileExtension(fileName);
            if (['xls', 'xlsx'].includes(ext)) return 'heroicons_outline:table-cells';
            if (['ppt', 'pptx'].includes(ext)) return 'heroicons_outline:presentation-chart-bar';
        }

        return iconMap[category] || 'heroicons_outline:document';
    }

    formatFileSize(bytes: number): string {
        return this._storageService.formatFileSize(bytes);
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
    }

    trackByFn(_index: number, item: FileListItemModel): any {
        return item.id;
    }

    getDisplayInfo() {
        return {
            userId: this._getCurrentUserId(),
            userName: this._getCurrentUserName() || 'Usuário',
            entityName: this._getCurrentEntityName() || 'Entidade',
            entityIdentifier: this._getCurrentIdentifierName() || 'Identificador'
        };
    }

    // Private methods
    private _getCurrentUserId(): number | null {
        return this.navigationState?.userId ?? this._currentIdenfier?.entity.userId;
    }

    private _getCurrentEntityName(): string | null {
        return this.navigationState?.entityName ?? this._currentIdenfier?.entity.name;
    }

    private _getCurrentEntityId(): number | null {
        return this.navigationState?.entityId ?? this._currentIdenfier?.entity.id;
    }

    private _getCurrentIdentifierName(): string | null {
        return this.navigationState?.identifierName ?? this._currentIdenfier?.name;
    }

    private _getCurrentIdentifierId(): number | null {
        return this.navigationState?.identifierId ?? this._currentIdenfier?.id;
    }

    private _getCurrentUserName(): string | null {
        return this.navigationState?.userName ?? 'Usuário';
    }

    private processFiles(files: PortalStorageFileModel[]): void {
        this.files = files.map(file => ({
            ...file,
            selected: false,
            icon: this._storageService.getFileIcon(file),
            sizeFormatted: this.formatFileSize(file.size),
            lastModifiedFormatted: this.formatDate(file.updatedAt)
        }));

        this.applyFilter(this.searchTerm);
        this.applySorting();
        this.selection.clear();
    }

    private applyFilter(searchTerm: string): void {
        if (!searchTerm.trim()) {
            this.filteredFiles = [...this.files];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredFiles = this.files.filter(file =>
                file.originalName.toLowerCase().includes(term) ||
                (file.description && file.description.toLowerCase().includes(term))
            );
        }

        this.dataSource.data = this.filteredFiles;
        this._changeDetectorRef.markForCheck();
    }

    private applySorting(): void {
        this.filteredFiles.sort((a, b) => {
            if (a.isDirectory !== b.isDirectory) {
                return a.isDirectory ? -1 : 1;
            }

            let comparison = 0;
            switch (this.gridConfig.sortBy) {
                case 'name':
                    comparison = a.originalName.localeCompare(b.originalName);
                    break;
                case 'size':
                    comparison = a.size - b.size;
                    break;
                case 'modified':
                    comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                    break;
                case 'type':
                    const aExt = a.originalName.split('.').pop() || '';
                    const bExt = b.originalName.split('.').pop() || '';
                    comparison = aExt.localeCompare(bExt);
                    break;
            }

            return this.gridConfig.sortDirection === 'asc' ? comparison : -comparison;
        });

        this.dataSource.data = this.filteredFiles;
        this._changeDetectorRef.markForCheck();
    }

    private updateSelectionState(): void {
        this.selectionState = {
            selectedFiles: this.selection.selected,
            allSelected: this.isAllSelected(),
            someSelected: this.isSomeSelected()
        };
        this._changeDetectorRef.markForCheck();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Gallery Methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open gallery for a single file or multiple files
     */
    openGallery(files: FileListItemModel[], startIndex: number = 0): void {
        const identifierId = this.navigationState?.identifierId;
        const currentPath = this.navigationState?.currentPath ?? this._currentDirectoryPath;

        if (!identifierId) {
            this._snackBar.open('Erro: ID do identificador não encontrado', 'Fechar', { duration: 3000 });
            return;
        }

        // Show loading
        this._snackBar.open('Carregando galeria...', 'Fechar', { duration: 2000 });

        // Generate presigned URLs for files
        this._storageService.generatePresignedUrlsForIdentifier(identifierId, currentPath, 120).subscribe({
            next: (filesWithUrls) => {
                // Filter only non-directory files for gallery
                const previewableFiles = filesWithUrls
                    .filter(f => !f.isDirectory);

                if (previewableFiles.length === 0) {
                    this._snackBar.open('Nenhum arquivo visualizável encontrado', 'Fechar', { duration: 3000 });
                    return;
                }

                // Convert files using the service method
                const galleryItems = FileGalleryService.convertToGalleryItems(previewableFiles);

                // Find the correct start index
                const targetFile = files[startIndex];
                const actualStartIndex = galleryItems.findIndex(f => f.id === targetFile.id);

                this.galleryFiles = galleryItems;
                this.galleryCurrentIndex = Math.max(0, actualStartIndex);
                this.galleryVisible = true;
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error generating presigned URLs:', error);
                this._snackBar.open('Erro ao carregar galeria', 'Fechar', { duration: 3000 });
            }
        });
    }

    /**
     * Open gallery showing all previewable files in current directory
     */
    openGalleryForAll(): void {
        const previewableFiles = this.filteredFiles.filter(f => !f.isDirectory);

        if (previewableFiles.length === 0) {
            this._snackBar.open('Nenhum arquivo nesta pasta', 'Fechar', { duration: 3000 });
            return;
        }

        this.openGallery(previewableFiles, 0);
    }

    /**
     * Check if file can be shown in gallery (now allows all non-directory files)
     */
    canShowInGallery(file: FileListItemModel | PortalStorageFileModel): boolean {
        return !file.isDirectory; // Allow all files except directories
    }

    /**
     * Get file extension (now using centralized service)
     */
    private getFileExtension(fileName: string): string {
        return FileGalleryService.getFileExtension(fileName);
    }

    /**
     * Handle gallery close
     */
    onGalleryClose(): void {
        this.galleryVisible = false;
        this.galleryFiles = [];
        this.galleryCurrentIndex = 0;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle gallery download
     */
    onGalleryDownload(item: FileGalleryItem): void {
        this.downloadFileById(item.id);
    }

    /**
     * Handle gallery index change
     */
    onGalleryIndexChange(index: number): void {
        this.galleryCurrentIndex = index;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Download file by ID
     */
    private downloadFileById(fileId: number): void {
        const file = this.files.find(f => f.id === fileId);
        if (file) {
            this.downloadFile(file);
        }
    }

    /**
     * Toggle preview mode between gallery and panel
     */
    togglePreviewMode(): void {
        this.previewMode = this.previewMode === 'gallery' ? 'panel' : 'gallery';
        this._snackBar.open(
            `Modo de visualização: ${this.previewMode === 'gallery' ? 'Galeria' : 'Painel'}`,
            'Fechar',
            { duration: 2000 }
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Preview Panel Methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open preview panel for a file
     */
    openPreviewPanel(file: FileListItemModel): void {
        const entityId = this.navigationState?.entityId;
        const currentPath = this.navigationState?.currentPath ?? this._currentDirectoryPath;

        if (!entityId) {
            this._snackBar.open('Erro: ID da entidade não encontrado', 'Fechar', { duration: 3000 });
            return;
        }

        // Generate presigned URL for the specific file
        this._storageService.generatePresignedUrl(file.id, 120).subscribe({
            next: (response) => {
                const fileWithUrl: PortalStorageFileModel = {
                    ...file,
                    presignedUrl: response.presignedUrl
                };

                this.previewPanelFile = FileGalleryService.convertToGalleryItem(fileWithUrl);
                this.previewPanelVisible = true;
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error generating presigned URL:', error);
                this._snackBar.open('Erro ao carregar preview', 'Fechar', { duration: 3000 });
            }
        });
    }

    /**
     * Close preview panel
     */
    onPreviewPanelClose(): void {
        this.previewPanelVisible = false;
        this.previewPanelFile = null;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle preview panel download
     */
    onPreviewPanelDownload(item: FileGalleryItem): void {
        this.downloadFileById(item.id);
    }

    /**
     * Handle preview panel fullscreen
     */
    onPreviewPanelFullscreen(item: FileGalleryItem): void {
        if (item.presignedUrl) {
            window.open(item.presignedUrl, '_blank');
        }
    }
    /**
     * Check if any file can be shown in gallery (now all non-directory files)
     */
    showInGallery(): boolean {
        return this.filteredFiles.some(f => !f.isDirectory);
    }
}
