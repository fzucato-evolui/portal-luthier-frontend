import {NgFor, NgIf} from '@angular/common';
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
import {ActivatedRoute, Router} from '@angular/router';
import {PortalStorageService} from '../portal-storage.service';
import {AdminStorageEntitySummaryModel, StorageNavigationStateModel} from 'app/shared/models/portal-storage.model';
import {firstValueFrom, Subject, takeUntil} from 'rxjs';
import {
    PortalStorageEntityModalComponent,
    StorageEntityModalData
} from '../modal/portal-storage-entity-modal.component';
import {
    PortalStorageDownloadEntitiesFilesComponent,
    StorageDownloadEntitiesFilesModalData
} from '../modal/portal-storage-download-entities-files.component';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';

@Component({
    selector: 'portal-storage-entities-list',
    templateUrl: './portal-storage-entities-list.component.html',
    styleUrls: ['./portal-storage-entities-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf, NgFor, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
        MatTableModule, MatTooltipModule, MatCardModule, MatChipsModule,
        MatFormFieldModule, MatInputModule, ScrollingModule
    ],
})
export class PortalStorageEntitiesListComponent implements OnInit, OnDestroy {
    entities: AdminStorageEntitySummaryModel[] = [];
    filteredEntities: AdminStorageEntitySummaryModel[] = [];
    isLoading = false;
    navigationState: StorageNavigationStateModel | null = null;
    displayedColumns: string[] = ['actions', 'id', 'entity', 'identifiers', 'files', 'size', 'lastActivity'];
    dataSource = new MatTableDataSource<AdminStorageEntitySummaryModel>();

    // Route parameters - fallback when navigationState is not available
    private _currentUserId: number | null = null;

    private _unsubscribeAll: Subject<void> = new Subject<void>();

    constructor(
        private _route: ActivatedRoute,
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

        // Subscribe to entities data
        this._storageService.entities$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(entities => {
                this.entities = entities;
                this.filteredEntities = [...entities];
                this.dataSource.data = this.filteredEntities;
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to navigation state
        this._storageService.navigationState$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(state => {
                this.navigationState = state;
                this._changeDetectorRef.markForCheck();
            });

        // Get userId from route and load entities
        const userId = this._route.snapshot.paramMap.get('userId');
        if (userId) {
            this._currentUserId = parseInt(userId, 10);
            this.loadEntities(this._currentUserId);

            // Always initialize navigation state to ensure proper breadcrumbs
            this._initializeNavigationState(this._currentUserId);
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get current user ID from navigation state or route params
     */
    private _getCurrentUserId(): number | null {
        return this.navigationState?.userId ?? this._currentUserId;
    }

    /**
     * Get current user name from navigation state or try to get from service/API
     */
    private _getCurrentUserName(): string | null {
        return this.navigationState?.userName ?? 'Usuário'; // Fallback para nome genérico
    }

    /**
     * Initialize navigation state when accessing page directly via URL
     */
    private _initializeNavigationState(userId: number): void {
        this._storageService.getUser(userId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(user => {
                if (user) {
                    this._storageService.navigateToUserEntities(
                        userId,
                        user.userName
                    );
                }
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Load entities for the user
     */
    loadEntities(userId: number): void {
        this._storageService.getUserEntities(userId).subscribe();
    }

    /**
     * Navigate to entity identifiers
     */
    viewEntityIdentifiers(entity: AdminStorageEntitySummaryModel): void {
        const userId = this._getCurrentUserId();
        const userName = this._getCurrentUserName();

        if (!userId) {
            console.error('Parâmetros de navegação obrigatórios ausentes');
            return;
        }

        // ALWAYS update navigation state for entity identifiers
        this._storageService.navigateToEntityIdentifiers(
            userId,
            userName || 'Usuário',
            entity.entityId,
            entity.entityName
        );

        this._router.navigate([
            '/portal/storage/users',
            userId,
            'entities',
            entity.entityId,
            'identifiers'
        ]);
    }

    editEntity(entity: AdminStorageEntitySummaryModel): void {
        const userId = this._getCurrentUserId();

        if (!userId) {
            console.error('ID do usuário ausente para criação de entidade');
            return;
        }

        const modalData: StorageEntityModalData = {
            title: 'Editar Entidade de Armazenamento',
            userId: userId,
            userName: this._getCurrentUserName() || 'Usuário',
            breadcrumbs: [...this.navigationState?.breadcrumbs] || [],
            mode: 'edit',
            entity: {
                id: entity.entityId,
                name: entity.entityName,
                description: entity.description || '',
                userId: userId
            }
        };

        const dialogRef = this._matDialog.open(PortalStorageEntityModalComponent, {
            width: '600px',
            disableClose: true,
            panelClass: 'portal-storage-entity-modal-container',
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

    deleteEntityStorage(entity: AdminStorageEntitySummaryModel): void {
        this._messageService.open("Tem certeza de que deseja remover o armazenamento da entidade?", 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                // ALWAYS update navigation state for user entities
                firstValueFrom(this._storageService.deleteEntity(entity.entityId)).then(result => {
                    const message = `${result['message']}<br>Aquivos Removidos: ${result['filesRemoved']}`;
                    this._messageService.open(message, 'SUCESSO','success');
                    this.refresh();
                })

            }
        });
    }

    /**
     * Open download modal for entity files
     */
    downloadEntityFiles(entity: AdminStorageEntitySummaryModel): void {
        const userId = this._getCurrentUserId();
        const userName = this._getCurrentUserName();

        if (!userId) {
            console.error('Parâmetros de navegação obrigatórios ausentes');
            return;
        }

        const modalData: StorageDownloadEntitiesFilesModalData = {
            userId: userId,
            userName: userName || 'Usuário',
            entityName: entity.entityName,
            entityId: entity.entityId
        };

        const dialogRef = this._matDialog.open(PortalStorageDownloadEntitiesFilesComponent, {
            disableClose: true,
            panelClass: 'portal-storage-download-entities-files-container',
            data: modalData
        });

        dialogRef.componentInstance.data = modalData;
    }

    /**
     * Navigate back to users list
     */
    goBack(): void {
        this._storageService.resetNavigation();
        this._router.navigate(['/portal/storage']);
    }

    /**
     * Navigate using breadcrumb
     */
    navigateTo(breadcrumb: any): void {
        if (!breadcrumb.clickable) return;

        console.log('🔍 Breadcrumb Navigation:', breadcrumb);

        // Navigate using the absolute path from breadcrumb
        this._router.navigate([breadcrumb.path]);
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes: number): string {
        return this._storageService.formatFileSize(bytes);
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
        const userId = this._getCurrentUserId();

        if (userId) {
            this.loadEntities(userId);
        }
    }

    /**
     * Apply search filter
     */
    applyFilter(event: Event): void {
        const target = event.target as HTMLInputElement;
        const filterValue = target.value.trim().toLowerCase();

        if (!filterValue) {
            this.filteredEntities = [...this.entities];
        } else {
            this.filteredEntities = this.entities.filter(entity =>
                entity.entityName.toLowerCase().includes(filterValue) ||
                (entity.description && entity.description.toLowerCase().includes(filterValue))
            );
        }

        this.dataSource.data = this.filteredEntities;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(_index: number, item: AdminStorageEntitySummaryModel): any {
        return item.entityName;
    }

    /**
     * Get total identifiers across all entities
     */
    getTotalIdentifiers(): number {
        return this.entities.reduce((sum, entity) => sum + entity.totalIdentifiers, 0);
    }

    /**
     * Get total files across all entities
     */
    getTotalFiles(): number {
        return this.entities.reduce((sum, entity) => sum + entity.totalFiles, 0);
    }

    /**
     * Get total storage across all entities
     */
    getTotalStorage(): string {
        const totalBytes = this.entities.reduce((sum, entity) => sum + entity.totalBytes, 0);
        return this.formatFileSize(totalBytes);
    }

    /**
     * Open modal to add a new entity
     */
    addEntity(): void {
        const userId = this._getCurrentUserId();

        if (!userId) {
            console.error('ID do usuário ausente para criação de entidade');
            return;
        }

        const modalData: StorageEntityModalData = {
            title: 'Adicionar Nova Entidade de Armazenamento',
            userId: userId,
            userName: this._getCurrentUserName() || 'Usuário',
            breadcrumbs: [...this.navigationState?.breadcrumbs] || [],
            mode: 'create'
        };

        const dialogRef = this._matDialog.open(PortalStorageEntityModalComponent, {
            width: '600px',
            disableClose: true,
            panelClass: 'portal-storage-entity-modal-container',
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
     * Get display info for template
     */
    getDisplayInfo() {
        return {
            userName: this._getCurrentUserName() || 'Usuário'
        };
    }
}
