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
import {AdminStorageUserSummaryModel} from 'app/shared/models/portal-storage.model';
import {firstValueFrom, Subject, takeUntil} from 'rxjs';
import {
    PortalStorageEntityModalComponent,
    StorageEntityModalData
} from '../modal/portal-storage-entity-modal.component';
import {
    PortalStorageDownloadUserFilesComponent,
    StorageDownloadUserFilesModalData
} from '../modal/portal-storage-download-user-files.component';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';

@Component({
    selector: 'portal-storage-users-list',
    templateUrl: './portal-storage-users-list.component.html',
    styleUrls: ['./portal-storage-users-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf, NgClass, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
        MatTableModule, MatTooltipModule, MatCardModule, MatChipsModule,
        MatFormFieldModule, MatInputModule, ScrollingModule
    ],
})
export class PortalStorageUsersListComponent implements OnInit, OnDestroy {
    users: AdminStorageUserSummaryModel[] = [];
    filteredUsers: AdminStorageUserSummaryModel[] = [];
    isLoading = false;
    displayedColumns: string[] = ['actions', 'user', 'storageType', 'entities', 'files', 'size', 'lastActivity'];
    dataSource = new MatTableDataSource<AdminStorageUserSummaryModel>();

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

        // Subscribe to users data
        this._storageService.users$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(users => {
                this.users = users;
                this.filteredUsers = [...users];
                this.dataSource.data = this.filteredUsers;
                this._changeDetectorRef.markForCheck();
            });

        // Reset navigation and load users
        this._storageService.resetNavigation();
        this.loadUsers();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Load users with storage statistics
     */
    loadUsers(): void {
        this._storageService.getUsers().subscribe();
    }

    /**
     * Navigate to user's entities
     */
    viewUserEntities(user: AdminStorageUserSummaryModel): void {
        // ALWAYS update navigation state for user entities
        this._storageService.navigateToUserEntities(user.userId, user.userName);
        this._router.navigate(['/portal/storage/users', user.userId, 'entities']);
    }

    /**
     * Remove user storage
     */
    deleteUserStorage(user: AdminStorageUserSummaryModel): void {
        this._messageService.open("Tem certeza de que deseja remover o armazenamento do usuário?", 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                // ALWAYS update navigation state for user entities
                firstValueFrom(this._storageService.deleteUserStorage(user.userId)).then(result => {
                    const message = `${result['message']}<br>Aquivos Removidos: ${result['filesRemoved']}, Entidade Removidas: ${result['entitiesRemoved']}`;
                    this._messageService.open(message, 'SUCESSO','success');
                })

            }
        });

    }

    /**
     * Open download modal for user files
     */
    downloadUserFiles(user: AdminStorageUserSummaryModel): void {
        const modalData: StorageDownloadUserFilesModalData = {
            userId: user.userId,
            userName: user.userName
        };

        const dialogRef = this._matDialog.open(PortalStorageDownloadUserFilesComponent, {
            disableClose: true,
            panelClass: 'portal-storage-download-user-files-container',
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
        this.loadUsers();
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(_index: number, item: AdminStorageUserSummaryModel): any {
        return item.userId;
    }

    /**
     * Track by user ID for performance optimization
     */
    trackByUserId(_index: number, item: AdminStorageUserSummaryModel): any {
        return item.userId;
    }

    /**
     * Apply search filter
     */
    applyFilter(event: Event): void {
        const target = event.target as HTMLInputElement;
        const filterValue = target.value.trim().toLowerCase();

        if (!filterValue) {
            this.filteredUsers = [...this.users];
        } else {
            this.filteredUsers = this.users.filter(user =>
                user.userName.toLowerCase().includes(filterValue) ||
                user.userEmail.toLowerCase().includes(filterValue) ||
                this.getStorageTypeDisplay(user.storageType).toLowerCase().includes(filterValue)
            );
        }

        this.dataSource.data = this.filteredUsers;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Open modal to add a new entity
     */
    addEntity(): void {
        const modalData: StorageEntityModalData = {
            title: 'Adicionar Nova Entidade de Armazenamento',
            mode: 'create',
            breadcrumbs: null
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
     * Get total files across all users
     */
    getTotalFiles(): number {
        return this.users.reduce((sum, user) => sum + user.totalFiles, 0);
    }

    /**
     * Get total directories across all users
     */
    getTotalDirectories(): number {
        return this.users.reduce((sum, user) => sum + user.totalDirectories, 0);
    }

    /**
     * Get total storage across all users
     */
    getTotalStorage(): string {
        const totalBytes = this.users.reduce((sum, user) => sum + user.totalBytes, 0);
        return this.formatFileSize(totalBytes);
    }
}
