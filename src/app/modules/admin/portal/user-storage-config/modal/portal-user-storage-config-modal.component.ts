import {
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PortalUserStorageConfig, PortalUserStorageConfigType } from '../../../../../shared/models/portal-user-storage-config.model';
import { PortalUserStorageConfigService } from '../portal-user-storage-config.service';
import { PortalUserStorageConfigComponent } from '../portal-user-storage-config.component';
import { PortalUserStorageConfigGoogleDriveComponent } from './types/google-drive/portal-user-storage-config-google-drive.component';
import { PortalUserStorageConfigDropboxComponent } from './types/dropbox/portal-user-storage-config-dropbox.component';
import { PortalUserStorageConfigAwsS3Component } from './types/aws-s3/portal-user-storage-config-aws-s3.component';
import { PortalUserStorageConfigLocalDirectoryComponent } from './types/local-directory/portal-user-storage-config-local-directory.component';
import { KeyValue } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { UserModel } from 'app/shared/models/user.model';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDrawerMode } from '@angular/material/sidenav';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
    selector: 'portal-user-storage-config-modal',
    templateUrl: './portal-user-storage-config-modal.component.html',
    styleUrls: ['./portal-user-storage-config-modal.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        PortalUserStorageConfigGoogleDriveComponent,
        PortalUserStorageConfigDropboxComponent,
        PortalUserStorageConfigAwsS3Component,
        PortalUserStorageConfigLocalDirectoryComponent,
        MatSidenavModule
    ]
})
export class PortalUserStorageConfigModalComponent implements OnInit, OnDestroy {
    title: string;
    userId: number | null;
    userName: string | null;
    configs: PortalUserStorageConfig[] = [];
    loading = false;
    error: string | null = null;
    readonly configTypes = PortalUserStorageConfigType;
    selectedConfigType: PortalUserStorageConfigType | null = null;
    storageTypes: KeyValue<string, PortalUserStorageConfigType>[] = Object.entries(this.configTypes).map(([key, value]) => ({ key, value }));
    
    users: UserModel[] = [];
    selectedUserId: number | null = null;

    drawerMode: MatDrawerMode = 'side';
    drawerOpened: boolean = true;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _parent: PortalUserStorageConfigComponent;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _dialogRef: MatDialogRef<PortalUserStorageConfigModalComponent>,
        private _service: PortalUserStorageConfigService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _breakpointObserver: BreakpointObserver
    ) {
        this.userId = data.userId || null;
        this.userName = data.userName || null;
        this.configs = data.configs || [];
        this.users = data.users || [];
    }

    set parent(value: PortalUserStorageConfigComponent) {
        this._parent = value;
    }

    get parent(): PortalUserStorageConfigComponent {
        return this._parent;
    }

    getConfig(type: PortalUserStorageConfigType): PortalUserStorageConfig | undefined {
        return this.configs.find(c => c.storageType === type);
    }

    ngOnInit(): void {
        const activeConfig = this.configs.find(config => config.active);
        if (activeConfig) {
            this.selectedConfigType = activeConfig.storageType;
        } else if (this.storageTypes.length > 0) {
            this.selectedConfigType = this.storageTypes[0].value;
        }

        this._breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(result => {
                if (result.matches) {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                } else {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                this._changeDetectorRef.markForCheck();
            });

        if (this.userId === null) {
            firstValueFrom(this._service.getUsersWithoutStorageConfigs()).then((users) => {
                this.users = users;
                this._changeDetectorRef.markForCheck();
            });
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    selectConfigType(type: PortalUserStorageConfigType): void {
        this.selectedConfigType = type;
        this.error = null;
        this._changeDetectorRef.markForCheck();
    }

    onSave(configData: any, type: PortalUserStorageConfigType): void {
        if (this.userId === null && this.selectedUserId === null) {
            this.error = 'Selecione um usuário para a configuração.';
            this._changeDetectorRef.markForCheck();
            return;
        }

        this.loading = true;
        const existingConfig = this.getConfig(type);
        const configToSave: PortalUserStorageConfig = {
            id: existingConfig ? existingConfig.id : undefined,
            userId: this.userId !== null ? this.userId : this.selectedUserId!,
            storageType: type,
            config: configData,
            active: existingConfig ? existingConfig.active : false,
            createdAt: existingConfig ? existingConfig.createdAt : undefined,
            updatedAt: existingConfig ? existingConfig.updatedAt : undefined,
        };

        this._service.saveConfig(configToSave).subscribe({
            next: (savedConfig) => {
                const index = this.configs.findIndex(c => c.id === savedConfig.id);
                if (index >= 0) {
                    this.configs[index] = savedConfig;
                } else {
                    this.configs = this.configs.filter(c => !(c.userId === this.userId && c.storageType === savedConfig.storageType));
                    this.configs.push(savedConfig);
                }
                this.loading = false;
                this.error = null;
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                this.error = 'Erro ao salvar configuração';
                this.loading = false;
                this._changeDetectorRef.markForCheck();
                console.error(error);
            }
        });
    }

    onActivate(id: number): void {
        this.loading = true;
        this._service.activateConfig(id).subscribe({
            next: () => {
                this.configs = this.configs.map(config => ({
                    ...config,
                    active: config.id === id
                }));
                this.loading = false;
                this.error = null;
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                this.error = 'Erro ao ativar configuração';
                this.loading = false;
                this._changeDetectorRef.markForCheck();
                console.error(error);
            }
        });
    }

    onDelete(id: number): void {
        this.parent.messageService.open('Tem certeza que deseja excluir esta configuração?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                this.loading = true;
            this._service.deleteConfig(id).subscribe({
                next: () => {
                    this.configs = this.configs.filter(config => config.id !== id);
                    this.loading = false;
                    this.error = null;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    this.error = 'Erro ao excluir configuração';
                    this.loading = false;
                    this._changeDetectorRef.markForCheck();
                    console.error(error);
                }
            });
            }
        });
        
    }

    close(): void {
        this._dialogRef.close();
        this._parent.refresh();
    }
} 