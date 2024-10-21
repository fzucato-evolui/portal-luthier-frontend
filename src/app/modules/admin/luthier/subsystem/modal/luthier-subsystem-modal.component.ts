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
import {LuthierSubsystemComponent} from '../luthier-subsystem.component';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {JsonPipe, NgFor, NgIf} from '@angular/common';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {
    LuthierPlataformEnum,
    LuthierResourceModel,
    LuthierSubsystemModel,
    LuthierSubsystemStatusEnum,
} from '../../../../../shared/models/luthier.model';
import {LuthierService} from '../../luthier.service';
import {UtilFunctions} from '../../../../../shared/util/util-functions';
import {SharedPipeModule} from '../../../../../shared/pipes/shared-pipe.module';
import {LuthierManagerMenutreeComponent} from '../../manager/menutree/luthier-manager-menutree.component';

@Component({
    selector       : 'luthier-subsystem-modal',
    styleUrls      : ['/luthier-subsystem-modal.component.scss'],
    templateUrl    : './luthier-subsystem-modal.component.html',
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
        NgIf,
        SharedPipeModule
    ],
    providers: [
        provideNgxMask(),
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class LuthierSubsystemModalComponent implements OnInit, OnDestroy
{
    formSave: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public model: LuthierSubsystemModel;
    title: string;
    private _service: LuthierService;
    private _parent: LuthierSubsystemComponent | LuthierManagerMenutreeComponent;
    public LuthierSubsystemStatusEnum = LuthierSubsystemStatusEnum;
    public LuthierPlataformEnum = LuthierPlataformEnum;
    resources: Array<LuthierResourceModel>;
    public customPatterns = { 'I': { pattern: new RegExp('\[a-zA-Z0-9_\]')} };

    set parent(value: LuthierSubsystemComponent | LuthierManagerMenutreeComponent) {
        this._parent = value;
        this._service = this.parent.service;
    }

    get parent(): LuthierSubsystemComponent | LuthierManagerMenutreeComponent {
        return  this._parent;
    }

    constructor(private _formBuilder: FormBuilder,
                private _changeDetectorRef: ChangeDetectorRef,
                public dialogRef: MatDialogRef<LuthierSubsystemModalComponent>,
                private _messageService: MessageDialogService)
    {
    }

    ngOnInit(): void {

        this.formSave = this._formBuilder.group({
            code: [''],
            description: ['', [Validators.required]],
            status: ['', [Validators.required]],
            plataform: ['', [Validators.required]],
            resource: [null]
        });

        this.formSave.patchValue(this.model);

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    doSaving() {

        this.model = this.formSave.value as LuthierSubsystemModel;
        this._service.saveSubsystem(this.model).then(value => {
            this._messageService.open("Subsistema luthier salvo com sucesso!", "SUCESSO", "success")
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

    getSeletctedImage(value: any): string {
        if (UtilFunctions.isValidObject(value) === true && UtilFunctions.isValidStringOrArray(this.resources) === true) {
            const code = value.code;
            if (UtilFunctions.isValidStringOrArray(code) === true) {
                const index = this.resources.findIndex(x => x.code === code);
                if (index >= 0) {
                    return this.resources[index].file;
                }
            }
        }
        return null;

    }

}
