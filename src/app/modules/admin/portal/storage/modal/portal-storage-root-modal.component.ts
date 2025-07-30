import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {firstValueFrom, map, Observable, startWith, Subject} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {PortalStorageService} from '../portal-storage.service';
import {PortalStorageRootModel, StorageBreadcrumbModel} from '../../../../../shared/models/portal-storage.model';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {PortalStorageConfigModel} from '../../../../../shared/models/portal-storage-config.model';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {SharedPipeModule} from '../../../../../shared/pipes/shared-pipe.module';

export interface StorageRootModalData {
    title: string;
    root?: PortalStorageRootModel;
    configs?: PortalStorageConfigModel[],
    breadcrumbs?: StorageBreadcrumbModel[],
    mode: 'create' | 'edit';
}

@Component({
    selector: 'portal-storage-root-modal',
    styleUrls: ['./portal-storage-root-modal.component.scss'],
    templateUrl: './portal-storage-root-modal.component.html',
    imports: [
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatButtonModule, MatFormFieldModule,
        ReactiveFormsModule,
        ScrollingModule,
        NgFor,
        NgIf,
        AsyncPipe,
        MatDialogModule,
        NgxMaskDirective, SharedPipeModule
    ],
    providers: [
        provideNgxMask(),
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class PortalStorageRootModalComponent implements OnInit, OnDestroy {

    formSave: FormGroup;
    configSearchControl = new FormControl('');
    filteredConfigs: Observable<PortalStorageConfigModel[]>;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    savedConfig: PortalStorageConfigModel | undefined;

    data: StorageRootModalData;
    public customPatterns = { 'I': { pattern: new RegExp('\[a-zA-Z0-9_\]')} };
    constructor(
        private _formBuilder: FormBuilder,
        private _storageService: PortalStorageService,
        private _messageService: MessageDialogService,
        private _changeDetectorRef: ChangeDetectorRef,
        public dialogRef: MatDialogRef<PortalStorageRootModalComponent>
    ) {}

    ngOnInit(): void {
        // Create the form
        this.formSave = this._formBuilder.group({
            id: [null],
            configId: [{ value: this.data.root?.configId || null, disabled: !!this.data.root?.configId }, [Validators.required]],
            identifier: [this.data.root?.identifier, [Validators.required, Validators.maxLength(100)]],
            description: ['', [Validators.maxLength(500)]]
        });

        // If editing, populate form with existing data
        if (this.data.root) {
            this.formSave.patchValue(this.data.root);
            const index = this.data.configs?.findIndex(c => c.id === this.data.root?.configId);
            if (index !== undefined && index >= 0) {
                this.savedConfig = this.data.configs[index];
            }
        }

        // Setup user search filter first
        this.setupUserFilter();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private setupUserFilter(): void {
        this.filteredConfigs = this.configSearchControl.valueChanges.pipe(
            startWith(''),
            map(value => {
                // Se o valor é um objeto (usuário selecionado), usa uma string vazia para mostrar todos
                const filterValue = typeof value === 'string' ? value : '';
                return this._filterConfigs(filterValue);
            })
        );
    }

    private _filterConfigs(value: string): PortalStorageConfigModel[] {
        if (!this.data.configs) {
            return [];
        }

        if (!value) {
            return this.data.configs.slice();
        }

        const filterValue = value.toLowerCase();
        return this.data.configs.filter(config =>
            config.identifier.toLowerCase().includes(filterValue) ||
            config.storageType.toLowerCase().includes(filterValue)
        );
    }

    doSaving(): void {
        const rootData: PortalStorageRootModel = {
            ...this.formSave.getRawValue(),
            configId: this.formSave.get('configId')?.value
        };
        if (this.data.mode === 'edit') {
            rootData.id = this.data.root?.id; // Ensure we have the ID for editing
            firstValueFrom(this._storageService.updateRoot(rootData)).then(result => {
                this._messageService.open('Armazenamento Raiz atualizado com sucesso!', 'SUCCESS', 'success');
                this.dialogRef.close(result);
            });
        }
        else {
            firstValueFrom(this._storageService.createRoot(rootData)).then(result => {
                this._messageService.open('Armazenamento Raiz criado com sucesso!', 'SUCCESS', 'success');
                this.dialogRef.close(result);
            })
        }
    }

    canSave(): boolean {
        return this.formSave ? !this.formSave.invalid : false;
    }


    getConfigDisplayName(config: PortalStorageConfigModel): string {
        return `${config.identifier} (${config.storageType})`;
    }

    onConfigSelected(event: MatAutocompleteSelectedEvent): void {
        const config = event.option.value as PortalStorageConfigModel;
        if (config && config.id) {
            this.formSave.get('configId')?.setValue(config.id);
        }
    }

    displayConfigFn = (config: PortalStorageConfigModel | null): string => {
        return config ? this.getConfigDisplayName(config) : '';
    }
}
