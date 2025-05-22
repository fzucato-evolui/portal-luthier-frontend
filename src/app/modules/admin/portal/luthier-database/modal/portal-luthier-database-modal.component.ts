import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation} from "@angular/core";
import {Subject} from 'rxjs';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {DatabaseTypeEnum, PortalLuthierDatabaseModel} from '../../../../../shared/models/portal-luthier-database.model';
import {PortalLuthierDatabaseService} from '../portal-luthier-database.service';
import {PortalLuthierDatabaseComponent} from '../portal-luthier-database.component';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {JsonPipe, NgFor} from '@angular/common';
import {SharedPipeModule} from '../../../../../shared/pipes/shared-pipe.module';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';

@Component({
    selector       : 'portal-luthier-database-modal',
    styleUrls      : ['./portal-luthier-database-modal.component.scss'],
    templateUrl    : './portal-luthier-database-modal.component.html',
    imports: [
        SharedPipeModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        NgFor,
        MatDialogModule,
        NgxMaskDirective,
        JsonPipe
    ],
    providers: [
        provideNgxMask(),
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class PortalLuthierDatabaseModalComponent implements OnInit, OnDestroy
{
    formSave: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public model: PortalLuthierDatabaseModel;
    title: string;
    private _service: PortalLuthierDatabaseService;
    private _parent: PortalLuthierDatabaseComponent;
    DatabaseTypeEnum = DatabaseTypeEnum;

    public customPatterns = { 'I': { pattern: new RegExp('\[a-zA-Z0-9_\]')} };

    set parent(value: PortalLuthierDatabaseComponent) {
        this._parent = value;
        this._service = this.parent.service;
    }

    get parent(): PortalLuthierDatabaseComponent {
        return  this._parent;
    }
    constructor(private _formBuilder: FormBuilder,
                public dialogRef: MatDialogRef<PortalLuthierDatabaseModalComponent>)
    {
    }

    ngOnInit(): void {

        // Create the form
        this.formSave = this._formBuilder.group({
            id: [this.model.id],
            identifier: ['', [Validators.required]],
            description: ['', [Validators.required]],
            databaseType: [DatabaseTypeEnum.MSSQL, [Validators.required]],
            host: ['', [Validators.required]],
            database: [''],
            user: ['', [Validators.required]],
            password: ['', [Validators.required]],
        });

        // Create the form
        this.formSave.patchValue(this.model);

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    doSaving() {

        this.model = this.formSave.value as PortalLuthierDatabaseModel;
        this._service.save(this.model).then(value => {
            this.parent.messageService.open("Base Luthier salva com sucesso!", "SUCESSO", "success")
            this.dialogRef.close();
        });

    }

    canSave(): boolean {
        if (this.formSave) {
            return !this.formSave.invalid;
        }
        return false;
    }



}
