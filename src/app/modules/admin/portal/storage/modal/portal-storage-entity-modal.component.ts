import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {firstValueFrom, Subject} from 'rxjs';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {NgFor, NgIf} from '@angular/common';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {PortalStorageService} from '../portal-storage.service';
import {PortalStorageEntityModel, StorageBreadcrumbModel} from '../../../../../shared/models/portal-storage.model';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';

export interface StorageEntityModalData {
    title: string;
    entity?: PortalStorageEntityModel;
    rootId?: number;
    rootIdentifier?: string;
    name?: string;
    breadcrumbs?: StorageBreadcrumbModel[],
    mode: 'create' | 'edit';
}

@Component({
    selector: 'portal-storage-entity-modal',
    styleUrls: ['./portal-storage-entity-modal.component.scss'],
    templateUrl: './portal-storage-entity-modal.component.html',
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
        MatDialogModule
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class PortalStorageEntityModalComponent implements OnInit, OnDestroy {

    formSave: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    data: StorageEntityModalData;

    constructor(
        private _formBuilder: FormBuilder,
        private _storageService: PortalStorageService,
        private _messageService: MessageDialogService,
        private _changeDetectorRef: ChangeDetectorRef,
        public dialogRef: MatDialogRef<PortalStorageEntityModalComponent>
    ) {}

    ngOnInit(): void {
        // Create the form
        this.formSave = this._formBuilder.group({
            id: [null],
            storageRootId: [{ value: this.data.rootId || null, disabled: !!this.data.rootId }, [Validators.required]],
            name: [this.data.name, [Validators.required, Validators.maxLength(100)]],
            description: ['', [Validators.maxLength(500)]]
        });

        // If editing, populate form with existing data
        if (this.data.entity) {
            this.formSave.patchValue(this.data.entity);
        }

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    doSaving(): void {
        const entityData: PortalStorageEntityModel = {
            ...this.formSave.getRawValue(),
            storageRootId: this.formSave.get('storageRootId')?.value
        };
        if (this.data.mode === 'edit') {
            entityData.id = this.data.entity?.id; // Ensure we have the ID for editing
            firstValueFrom(this._storageService.updateEntity(entityData)).then(result => {
                this._messageService.open('Entidade atualizada com sucesso!', 'SUCCESS', 'success');
                this.dialogRef.close(result);
            });
        }
        else {
            firstValueFrom(this._storageService.createEntity(entityData)).then(result => {
                this._messageService.open('Entitidade criada com sucesso!', 'SUCCESS', 'success');
                this.dialogRef.close(result);
            })
        }
    }

    canSave(): boolean {
        return this.formSave ? !this.formSave.invalid : false;
    }
}
