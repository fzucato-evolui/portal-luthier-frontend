import {NgClass, NgIf} from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDialog} from '@angular/material/dialog';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {Router} from '@angular/router';
import {PortalStorageService} from '../portal-storage.service';
import {StorageRootSummaryModel} from 'app/shared/models/portal-storage.model';
import {firstValueFrom, Subject, takeUntil} from 'rxjs';
import {
    PortalStorageDownloadRootFilesComponent,
    StorageDownloadRootFilesModalData
} from '../modal/portal-storage-download-root-files.component';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {PortalStorageRootModalComponent, StorageRootModalData} from '../modal/portal-storage-root-modal.component';
import {PortalStorageConfigModel} from '../../../../../shared/models/portal-storage-config.model';

@Component({
    selector: 'portal-storage-roots-list',
    templateUrl: './portal-storage-roots-list.component.html',
    styleUrls: ['./portal-storage-roots-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf, NgClass, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
        MatTableModule, MatTooltipModule, MatCardModule, MatChipsModule,
        MatFormFieldModule, MatInputModule, ScrollingModule
    ],
})
export class PortalStorageRootsListComponent implements OnInit, OnDestroy {
    roots: StorageRootSummaryModel[] = [];
    configs: PortalStorageConfigModel[] = [];
    filteredRoots: StorageRootSummaryModel[] = [];
    isLoading = false;
    displayedColumns: string[] = ['actions', 'id', 'identifier', 'description', 'storageType', 'entities', 'files', 'size', 'lastActivity'];
    dataSource = new MatTableDataSource<StorageRootSummaryModel>();

    private _unsubscribeAll: Subject<void> = new Subject<void>();

    constructor(
        private _router: Router,
        private _storageService: PortalStorageService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _messageService: MessageDialogService,
        private _matDialog: MatDialog
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Subscribe to loading state
        this._storageService.isLoading$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(isLoading => {
                this.isLoading = isLoading;
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to roots data
        this._storageService.roots$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(roots => {
                this.roots = roots;
                this.filteredRoots = [...roots];
                this.dataSource.data = this.filteredRoots;
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to configs data
        this._storageService.configs$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(configs => {
                this.configs = configs;
                this._changeDetectorRef.markForCheck();
            });

        // Reset navigation and load roots
        this._storageService.resetNavigation();
        this.loadRoots();
        this._storageService.getConfigs().subscribe();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Load roots with storage statistics
     */
    loadRoots(): void {
        this._storageService.getRoots().subscribe();
    }

    /**
     * Navigate to root's entities
     */
    viewRootEntities(root: StorageRootSummaryModel): void {
        // ALWAYS update navigation state for root entities
        this._storageService.navigateToRootEntities(root.id, root.identifier);
        this._router.navigate(['/portal/storage/roots', root.id, 'entities']);
    }

    editRoot(root: StorageRootSummaryModel): void {

        const modalData: StorageRootModalData = {
            title: 'Editar Armazenamento',
            root: {
                id: root.id,
                configId: root.configId,
                identifier: root.identifier,
                description: root.description || '',
            },
            configs: this.configs,
            breadcrumbs: null,
            mode: 'edit'
        };

        const dialogRef = this._matDialog.open(PortalStorageRootModalComponent, {
            width: '600px',
            disableClose: true,
            panelClass: 'portal-storage-root-modal-container',
            data: modalData
        });

        dialogRef.componentInstance.data = modalData;

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Entidade foi atualizada com sucesso, atualizar os dados
                this.refresh();
            }
        });
    }

    /**
     * Remove root storage
     */
    deleteRootStorage(root: StorageRootSummaryModel): void {
        this._messageService.open("Tem certeza de que deseja remover o armazenamento raiz?", 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                // ALWAYS update navigation state for root entities
                firstValueFrom(this._storageService.deleteRootStorage(root.id)).then(result => {
                    const message = `${result['message']}<br>Aquivos Removidos: ${result['filesRemoved']}, Entidade Removidas: ${result['entitiesRemoved']}`;
                    this._messageService.open(message, 'SUCESSO','success');
                })

            }
        });

    }

    /**
     * Open download modal for root files
     */
    downloadRootFiles(root: StorageRootSummaryModel): void {
        const modalData: StorageDownloadRootFilesModalData = {
            rootId: root.id,
            rootIdentifier: root.identifier
        };

        const dialogRef = this._matDialog.open(PortalStorageDownloadRootFilesComponent, {
            disableClose: true,
            panelClass: 'portal-storage-download-root-files-container',
            data: modalData
        });

        dialogRef.componentInstance.data = modalData;
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes: number): string {
        return this._storageService.formatFileSize(bytes);
    }

    /**
     * Get storage type display
     */
    getStorageTypeDisplay(storageType?: string): string {
        if (!storageType) return 'Não configurado';

        const typeMap: { [key: string]: string } = {
            'LOCAL_DIRECTORY': 'Diretório Local',
            'AWS_S3': 'Amazon S3',
            'GOOGLE_DRIVE': 'Google Drive',
            'GOOGLE_CLOUD': 'Google Cloud Storage',
            'DROPBOX': 'Dropbox',
            'AZURE_BLOB': 'Azure Blob'
        };

        return typeMap[storageType] || storageType;
    }

    /**
     * Get storage type color
     */
    getStorageTypeColor(storageType?: string): string {
        if (!storageType) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';

        const colorMap: { [key: string]: string } = {
            'LOCAL': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            'AWS_S3': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
            'GOOGLE_DRIVE': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            'GOOGLE_CLOUD': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
            'DROPBOX': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
            'AZURE_BLOB': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
        };

        return colorMap[storageType] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }

    /**
     * Format date for display
     */
    formatDate(date?: Date): string {
        if (!date) return 'Nunca';

        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Hoje';
        if (days === 1) return 'Ontem';
        if (days < 7) return `${days} dias atrás`;
        if (days < 30) return `${Math.floor(days / 7)} semanas atrás`;
        if (days < 365) return `${Math.floor(days / 30)} meses atrás`;

        return `${Math.floor(days / 365)} anos atrás`;
    }

    /**
     * Refresh data
     */
    refresh(): void {
        this.loadRoots();
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(_index: number, item: StorageRootSummaryModel): any {
        return item.id;
    }

    /**
     * Track by root ID for performance optimization
     */
    trackByRootId(_index: number, item: StorageRootSummaryModel): any {
        return item.id;
    }

    /**
     * Apply search filter
     */
    applyFilter(event: Event): void {
        const target = event.target as HTMLInputElement;
        const filterValue = target.value.trim().toLowerCase();

        if (!filterValue) {
            this.filteredRoots = [...this.roots];
        } else {
            this.filteredRoots = this.roots.filter(root =>
                root.identifier.toLowerCase().includes(filterValue) ||
                root.description.toLowerCase().includes(filterValue) ||
                this.getStorageTypeDisplay(root.storageType).toLowerCase().includes(filterValue)
            );
        }

        this.dataSource.data = this.filteredRoots;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Open modal to add a new entity
     */
    addRoot(): void {
        const modalData: StorageRootModalData = {
            title: 'Adicionar Novo Armazenamento',
            configs: this.configs,
            mode: 'create',
            breadcrumbs: null
        };

        const dialogRef = this._matDialog.open(PortalStorageRootModalComponent, {
            width: '600px',
            disableClose: true,
            panelClass: 'portal-storage-root-modal-container',
            data: modalData
        });

        dialogRef.componentInstance.data = modalData;

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Entidade foi criada com sucesso, atualizar os dados
                this.refresh();
            }
        });
    }

    /**
     * Get total files across all roots
     */
    getTotalFiles(): number {
        return this.roots.reduce((sum, root) => sum + root.totalFiles, 0);
    }

    /**
     * Get total directories across all roots
     */
    getTotalDirectories(): number {
        return this.roots.reduce((sum, root) => sum + root.totalDirectories, 0);
    }

    /**
     * Get total storage across all roots
     */
    getTotalStorage(): string {
        const totalBytes = this.roots.reduce((sum, root) => sum + root.totalBytes, 0);
        return this.formatFileSize(totalBytes);
    }
}
