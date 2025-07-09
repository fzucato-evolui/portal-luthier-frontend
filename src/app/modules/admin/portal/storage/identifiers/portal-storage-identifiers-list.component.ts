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
import {AdminStorageIdentifierSummaryModel, StorageNavigationStateModel} from 'app/shared/models/portal-storage.model';
import {firstValueFrom, Subject, takeUntil} from 'rxjs';
import {
    PortalStorageDownloadIdentifiersFilesComponent,
    StorageDownloadIdentifiersFilesModalData
} from '../modal/portal-storage-download-identifiers-files.component';
import {
    PortalStorageIdentifierModalComponent,
    StorageEntityModalData
} from '../modal/portal-storage-identifier-modal.component';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';

@Component({
    selector: 'portal-storage-identifiers-list',
    templateUrl: './portal-storage-identifiers-list.component.html',
    styleUrls: ['./portal-storage-identifiers-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf, NgFor,
        MatButtonModule, MatIconModule, MatProgressSpinnerModule,
        MatTableModule, MatTooltipModule, MatCardModule, MatChipsModule,
        MatFormFieldModule, MatInputModule, ScrollingModule
    ],
})
export class PortalStorageIdentifiersListComponent implements OnInit, OnDestroy {
    identifiers: AdminStorageIdentifierSummaryModel[] = [];
    filteredIdentifiers: AdminStorageIdentifierSummaryModel[] = [];
    isLoading = false;
    navigationState: StorageNavigationStateModel | null = null;
    displayedColumns: string[] = ['actions', 'id', 'identifier', 'files', 'size', 'lastActivity'];
    dataSource = new MatTableDataSource<AdminStorageIdentifierSummaryModel>();

    // Route parameters - fallback when navigationState is not available
    private _currentUserId: number | null = null;
    private _currentEntityId: number | null = null;

    private _unsubscribeAll: Subject<void> = new Subject<void>();
    private _currentEntityName: string | undefined;

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

        // Subscribe to identifiers data
        this._storageService.identifiers$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(identifiers => {
                this.identifiers = identifiers;
                this.filteredIdentifiers = [...identifiers];
                this.dataSource.data = this.filteredIdentifiers;
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to navigation state
        this._storageService.navigationState$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(state => {
                this.navigationState = state;
                this._changeDetectorRef.markForCheck();
            });

        // Get route parameters and load identifiers
        const userId = this._route.snapshot.paramMap.get('userId');
        const entityId = this._route.snapshot.paramMap.get('entityId');

        if (userId && entityId) {
            this._currentUserId = parseInt(userId, 10);
            this._currentEntityId = parseInt(entityId, 10);
            this.loadIdentifiers(this._currentEntityId);

            // Always initialize navigation state to ensure proper breadcrumbs
            this._initializeNavigationState(this._currentEntityId);
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
     * Get current entity id from navigation state or route params
     */
    private _getCurrentEntityId(): number | null {
        return this.navigationState?.entityId ?? this._currentEntityId;
    }

    /**
     * Get current entity name from navigation state or route params
     */
    private _getCurrentEntityName(): string | null {
        return this.navigationState?.entityName ?? this._currentEntityName;
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
    private _initializeNavigationState(entityId: number): void {
        this._storageService.getEntity(entityId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(entity => {
                if (entity) {
                    this._currentEntityName = entity.entityName;
                    this._storageService.navigateToEntityIdentifiers(
                        entity.userId,
                        entity.userName,
                        entityId,
                        entity.entityName
                    );
                }
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Load identifiers for the entity
     */
    loadIdentifiers(entityId: number): void {
        this._storageService.getEntityIdentifiers(entityId).subscribe();
    }

    /**
     * Navigate to file explorer for identifier
     */
    viewIdentifierFiles(identifier: AdminStorageIdentifierSummaryModel): void {
        const userId = this._getCurrentUserId();
        const userName = this._getCurrentUserName();
        const entityId = this._getCurrentEntityId();
        const entityName = this._getCurrentEntityName();

        if (!userId || !entityName) {
            console.error('Parâmetros de navegação obrigatórios ausentes');
            return;
        }

        // ALWAYS update navigation state for file explorer
        this._storageService.navigateToFileExplorer(
            userId,
            userName || 'Usuário',
            entityId,
            entityName,
            identifier.entityIdentifierId,
            identifier.entityIdentifierName,
            null // Caminho de diretório vazio para nível raiz
        );

        this._router.navigate([
            '/portal/storage/users',
            userId,
            'entities',
            entityId,
            'identifiers',
            identifier.entityIdentifierId,
            'files'
        ]);
    }

    /**
     * Open download modal for identifier files
     */
    downloadIdentifierFiles(identifier: AdminStorageIdentifierSummaryModel): void {
        const userId = this._getCurrentUserId();
        const userName = this._getCurrentUserName();
        const entityName = this._getCurrentEntityName();
        const entityId = this._getCurrentEntityId();
        const identifierId = identifier.entityIdentifierId;
        const identifierName = identifier.entityIdentifierName;


        if (!userId || !entityName) {
            console.error('Parâmetros de navegação obrigatórios ausentes');
            return;
        }

        const modalData: StorageDownloadIdentifiersFilesModalData = {
            userId: userId,
            userName: userName || 'Usuário',
            entityName: entityName,
            entityId: entityId,
            identifierId: identifierId,
            identifierName: identifierName
        };

        const dialogRef = this._matDialog.open(PortalStorageDownloadIdentifiersFilesComponent, {
            disableClose: true,
            panelClass: 'portal-storage-download-identifiers-files-container',
            data: modalData
        });

        dialogRef.componentInstance.data = modalData;
    }

    /**
     * Navigate back to entities list
     */
    goBack(): void {
        const userId = this._getCurrentUserId();

        if (!userId) {
            console.error('Não é possível navegar para trás: ID do usuário ausente');
            // Fallback para raiz do armazenamento
            this._router.navigate(['/portal/storage']);
            return;
        }

        this._router.navigate([
            '/portal/storage/users',
            userId,
            'entities'
        ]);
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
     * Apply search filter
     */
    applyFilter(event: Event): void {
        const target = event.target as HTMLInputElement;
        const filterValue = target.value.trim().toLowerCase();

        if (!filterValue) {
            this.filteredIdentifiers = [...this.identifiers];
        } else {
            this.filteredIdentifiers = this.identifiers.filter(identifier =>
                identifier.entityIdentifierName.toLowerCase().includes(filterValue) ||
                identifier.entityName.toLowerCase().includes(filterValue) ||
                (identifier.description && identifier.description.toLowerCase().includes(filterValue))
            );
        }

        this.dataSource.data = this.filteredIdentifiers;
        this._changeDetectorRef.markForCheck();
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
        const entityId = this._getCurrentEntityId();

        if (entityId) {
            this.loadIdentifiers(entityId);
        }
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(_index: number, item: AdminStorageIdentifierSummaryModel): any {
        return item.entityId;
    }

    /**
     * Get total files across all identifiers
     */
    getTotalFiles(): number {
        return this.identifiers.reduce((sum, identifier) => sum + identifier.totalFiles, 0);
    }

    /**
     * Get total directories across all identifiers
     */
    getTotalDirectories(): number {
        return this.identifiers.reduce((sum, identifier) => sum + identifier.totalDirectories, 0);
    }

    /**
     * Get total storage across all identifiers
     */
    getTotalStorage(): string {
        const totalBytes = this.identifiers.reduce((sum, identifier) => sum + identifier.totalBytes, 0);
        return this.formatFileSize(totalBytes);
    }

    /**
     * Open modal to add a new entity
     */
    addIdentifier(): void {
        const entityId = this._getCurrentEntityId();
        const entityName = this._getCurrentEntityName();

        if (!entityId || !entityName) {
            console.error('Parâmetros obrigatórios ausentes para criação do ident5ificador');
            return;
        }

        const modalData: StorageEntityModalData = {
            title: 'Adicionar Novo Identificador de Armazenamento',
            entityId: entityId,
            entityName: entityName,
            name: '',
            breadcrumbs: this.navigationState.breadcrumbs,
            mode: 'create'
        };

        const dialogRef = this._matDialog.open(PortalStorageIdentifierModalComponent, {
            width: '600px',
            disableClose: true,
            panelClass: 'portal-storage-identifier-modal-container',
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
            entityName: this._getCurrentEntityName() || 'Entidade',
            userName: this._getCurrentUserName() || 'Usuário'
        };
    }

    editIdentifier(identifier: AdminStorageIdentifierSummaryModel): void {
        const entityId = this._getCurrentEntityId();
        const entityName = this._getCurrentEntityName();

        const modalData: StorageEntityModalData = {
            title: 'Editar Identificador de Armazenamento',
            entityId: entityId,
            entityName: entityName,
            name: identifier.entityIdentifierName,
            breadcrumbs: [...this.navigationState?.breadcrumbs] || [],
            mode: 'edit',
            identifier: {
                id: identifier.entityIdentifierId,
                name: identifier.entityIdentifierName,
                description: identifier.description || '',
                entityId: identifier.entityId
            }
        };

        const dialogRef = this._matDialog.open(PortalStorageIdentifierModalComponent, {
            width: '600px',
            disableClose: true,
            panelClass: 'portal-storage-identifier-modal-container',
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

    deleteIdentifierStorage(identifier: AdminStorageIdentifierSummaryModel): void {
        this._messageService.open("Tem certeza de que deseja remover o armazenamento do identificador?", 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                // ALWAYS update navigation state for user entities
                firstValueFrom(this._storageService.deleteIdentifier(identifier.entityIdentifierId)).then(result => {
                    const message = `${result['message']}<br>Aquivos Removidos: ${result['filesRemoved']}`;
                    this._messageService.open(message, 'SUCESSO','success');
                    this.refresh();
                })

            }
        });
    }

}
