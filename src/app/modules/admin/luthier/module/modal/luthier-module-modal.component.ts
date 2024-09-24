import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {Subject} from 'rxjs';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {LuthierModuleComponent} from '../luthier-module.component';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {JsonPipe, NgFor, NgIf} from '@angular/common';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {LuthierDatabaseModel, LuthierModuleModel,} from '../../../../../shared/models/luthier.model';
import {LuthierService} from '../../luthier.service';
import {UtilFunctions} from '../../../../../shared/util/util-functions';

@Component({
    selector       : 'luthier-module-modal',
    styleUrls      : ['/luthier-module-modal.component.scss'],
    templateUrl    : './luthier-module-modal.component.html',
    imports: [
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        NgFor,
        NgxMaskDirective,
        MatDialogModule,
        JsonPipe,
        NgIf
    ],
    providers: [
        provideNgxMask(),
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class LuthierModuleModalComponent implements OnInit, OnDestroy
{
    formSave: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public model: LuthierModuleModel;
    public possibleParents: LuthierModuleModel[];
    title: string;
    private _service: LuthierService;
    private _parent: LuthierModuleComponent;

    public customPatterns = { 'I': { pattern: new RegExp('\[a-zA-Z0-9_\]')} };

    set parent(value: LuthierModuleComponent) {
        this._parent = value;
        this._service = this.parent.service;
    }

    get parent(): LuthierModuleComponent {
        return  this._parent;
    }
    constructor(private _formBuilder: FormBuilder,
                private _changeDetectorRef: ChangeDetectorRef,
                public dialogRef: MatDialogRef<LuthierModuleModalComponent>,
                private _messageService: MessageDialogService)
    {
    }

    ngOnInit(): void {

        this.formSave = this._formBuilder.group({
            code: [''],
            name: ['', [Validators.required]],
            description: [''],
            parent: [null]
        });

        this.formSave.patchValue(this.model);

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    doSaving() {

        this.model = this.formSave.value as LuthierDatabaseModel;
        this._service.saveModule(this.model).then(value => {
            this._messageService.open("Módulo luthier salvo com sucesso!", "SUCESSO", "success")
            this.dialogRef.close();
        });


    }

    canSave(): boolean {
        if (this.formSave) {
            return !this.formSave.invalid;
        }
        return false;
    }

    compareCode(v1: any , v2: any): boolean {
        if (v1 && v2) {
            if (UtilFunctions.isValidStringOrArray(v1.code) === true) {
                return v1.code === v2.code || v1.code === v2;
            }
            else {
                return v1.id === v2.id || v1.id === v2;
            }
        }
        else {
            return v1 === v2;
        }
    }

}
