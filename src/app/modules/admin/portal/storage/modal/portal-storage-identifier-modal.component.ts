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
import {
    PortalStorageEntityIdentifierModel,
    StorageBreadcrumbModel
} from '../../../../../shared/models/portal-storage.model';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';

export interface StorageEntityModalData {
    title: string;
    identifier?: PortalStorageEntityIdentifierModel;
    entityId?: number;
    entityName?: string;
    name?: string;
    breadcrumbs?: StorageBreadcrumbModel[],
    mode: 'create' | 'edit';
}

@Component({
    selector: 'portal-storage-identifier-modal',
    styleUrls: ['./portal-storage-identifier-modal.component.scss'],
    templateUrl: './portal-storage-identifier-modal.component.html',
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
export class PortalStorageIdentifierModalComponent implements OnInit, OnDestroy {

    formSave: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    data: StorageEntityModalData;

    constructor(
        private _formBuilder: FormBuilder,
        private _storageService: PortalStorageService,
        private _messageService: MessageDialogService,
        private _changeDetectorRef: ChangeDetectorRef,
        public dialogRef: MatDialogRef<PortalStorageIdentifierModalComponent>
    ) {}

    ngOnInit(): void {
        // Create the form
        this.formSave = this._formBuilder.group({
            id: [null],
            entityId: [{ value: this.data.entityId }, [Validators.required]],
            name: [this.data.name, [Validators.required, Validators.maxLength(100)]],
            description: ['', [Validators.maxLength(500)]]
        });

        // If editing, populate form with existing data
        if (this.data.identifier) {
            this.formSave.patchValue(this.data.identifier);
        }

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    doSaving(): void {
        const identifierData: PortalStorageEntityIdentifierModel = {
            ...this.formSave.getRawValue(),
            entityId: this.data.entityId
        };
        if (this.data.mode === 'edit') {
            identifierData.id = this.data.identifier?.id; // Ensure we have the ID for editing
            firstValueFrom(this._storageService.updateIdentifier(identifierData)).then(result => {
                this._messageService.open('Identificador atualizado com sucesso!', 'SUCCESS', 'success');
                this.dialogRef.close(result);
            });
        }
        else {
            firstValueFrom(this._storageService.createIdentifier(identifierData)).then(result => {
                this._messageService.open('Identificador criado com sucesso!', 'SUCCESS', 'success');
                this.dialogRef.close(result);
            })
        }
    }

    canSave(): boolean {
        return this.formSave ? !this.formSave.invalid : false;
    }
}
