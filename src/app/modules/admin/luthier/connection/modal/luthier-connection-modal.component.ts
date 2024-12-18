import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation} from "@angular/core";
import {Subject} from 'rxjs';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {DatabaseTypeEnum} from '../../../../../shared/models/portal-luthier-database.model';
import {LuthierConnectionComponent} from '../luthier-connection.component';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {JsonPipe, NgFor} from '@angular/common';
import {SharedPipeModule} from '../../../../../shared/pipes/shared-pipe.module';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {LuthierDatabaseModel} from '../../../../../shared/models/luthier.model';
import {LuthierService} from '../../luthier.service';

@Component({
    selector       : 'luthier-connection-modal',
    styleUrls      : ['/luthier-connection-modal.component.scss'],
    templateUrl    : './luthier-connection-modal.component.html',
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
export class LuthierConnectionModalComponent implements OnInit, OnDestroy
{
    formSave: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public model: LuthierDatabaseModel;
    title: string;
    private _service: LuthierService;
    private _parent: LuthierConnectionComponent;
    DatabaseTypeEnum = DatabaseTypeEnum;

    public customPatterns = { 'I': { pattern: new RegExp('\[a-zA-Z0-9_\]')} };

    set parent(value: LuthierConnectionComponent) {
        this._parent = value;
        this._service = this.parent.service;
    }

    get parent(): LuthierConnectionComponent {
        return  this._parent;
    }
    constructor(private _formBuilder: FormBuilder,
                public dialogRef: MatDialogRef<LuthierConnectionModalComponent>,
                private _messageService: MessageDialogService)
    {
    }

    ngOnInit(): void {

        this.formSave = this._formBuilder.group({
            code: [this.model.code, [Validators.required]],
            dbType: [DatabaseTypeEnum.MSSQL, [Validators.required]],
            server: ['', [Validators.required]],
            database: [''],
            user: ['', [Validators.required]],
            password: ['', [Validators.required]],
        });

        this.formSave.patchValue(this.model);

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    doSaving() {

        this.model = this.formSave.value as LuthierDatabaseModel;
        this._service.saveDatabase(this.model).then(value => {
            this._messageService.open("Configuração de conexão da base de dados do produto salva com sucesso!", "SUCESSO", "success");
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
