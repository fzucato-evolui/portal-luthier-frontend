import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {CommonModule, KeyValue} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Subject, takeUntil} from 'rxjs';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {
    PortalStorageConfigModel,
    PortalStorageConfigType
} from '../../../../../shared/models/portal-storage-config.model';
import {PortalStorageConfigComponent} from '../portal-storage-config.component';
import {
    PortalStorageConfigGoogleDriveComponent
} from './types/google-drive/portal-storage-config-google-drive.component';
import {
    PortalStorageConfigGoogleCloudComponent
} from './types/google-cloud/portal-storage-config-google-cloud.component';
import {PortalStorageConfigDropboxComponent} from './types/dropbox/portal-storage-config-dropbox.component';
import {PortalStorageConfigAwsS3Component} from './types/aws-s3/portal-storage-config-aws-s3.component';
import {
    PortalStorageConfigLocalDirectoryComponent
} from './types/local-directory/portal-storage-config-local-directory.component';
import {MatSelectModule} from '@angular/material/select';
import {FormsModule} from '@angular/forms';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {MatDrawerMode, MatSidenavModule} from '@angular/material/sidenav';
import {PortalStorageConfigService} from '../portal-storage-config.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';

@Component({
    selector: 'portal-storage-config-modal',
    templateUrl: './portal-storage-config-modal.component.html',
    styleUrls: ['./portal-storage-config-modal.component.scss'],
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
        MatFormFieldModule,
        MatInputModule,
        PortalStorageConfigGoogleDriveComponent,
        PortalStorageConfigGoogleCloudComponent,
        PortalStorageConfigDropboxComponent,
        PortalStorageConfigAwsS3Component,
        PortalStorageConfigLocalDirectoryComponent,
        MatSidenavModule,
        NgxMaskDirective
    ],
    providers: [
        provideNgxMask(),
    ],
})
export class PortalStorageConfigModalComponent implements OnInit, OnDestroy {
    title: string;
    config: PortalStorageConfigModel;
    error: string | null = null;
    readonly configTypes = PortalStorageConfigType;
    selectedConfigType: PortalStorageConfigType | null = null;
    storageTypes: KeyValue<string, PortalStorageConfigType>[] = Object.entries(this.configTypes).map(([key, value]) => ({ key, value }));

    drawerMode: MatDrawerMode = 'side';
    drawerOpened: boolean = true;
    public customPatterns = { 'I': { pattern: new RegExp('\[a-zA-Z0-9_\]')} };

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _parent: PortalStorageConfigComponent;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _dialogRef: MatDialogRef<PortalStorageConfigModalComponent>,
        private _service: PortalStorageConfigService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _breakpointObserver: BreakpointObserver
    ) {
        this.config = data.config;
        if (!this.config) {
            this.config = {
                id: null,
                identifier: '',
                description: '',
                storageType: PortalStorageConfigType.LOCAL_DIRECTORY,
                config: {},
                createdAt: new Date(),
                updatedAt: new Date()
            }
        }
    }

    set parent(value: PortalStorageConfigComponent) {
        this._parent = value;
    }

    get parent(): PortalStorageConfigComponent {
        return this._parent;
    }

    getConfig(type: PortalStorageConfigType): PortalStorageConfigModel | undefined {
        return this.config?.storageType === type ? this.config : {
            id: null,
            identifier: this.config.identifier,
            description: this.config.description,
            storageType: type,
            config: {},
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }

    ngOnInit(): void {
        const activeConfig = this.config;
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
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    selectConfigType(type: PortalStorageConfigType): void {
        this.selectedConfigType = type;
        this.error = null;
        this._changeDetectorRef.markForCheck();
    }

    onSave(configData: any, type: PortalStorageConfigType): void {

        const existingConfig = this.getConfig(type);
        const configToSave: PortalStorageConfigModel = {
            id: existingConfig.id,
            identifier: existingConfig.identifier,
            description: existingConfig.description,
            storageType: type,
            config: configData,
            createdAt: existingConfig.createdAt,
            updatedAt: existingConfig.updatedAt,
        };

        this._service.saveConfig(configToSave).subscribe({
            next: (savedConfig) => {
                this.config = savedConfig;
                this.error = null;
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                this.error = 'Erro ao salvar configuração';
                this._changeDetectorRef.markForCheck();
                console.error(error);
            }
        });
    }

    close(): void {
        this._dialogRef.close();
        this._parent.refresh();
    }
}
