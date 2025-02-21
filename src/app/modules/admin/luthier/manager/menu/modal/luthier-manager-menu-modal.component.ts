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
import {LuthierManagerMenuComponent} from '../luthier-manager-menu.component';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {JsonPipe, NgClass, NgFor, NgIf} from '@angular/common';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {SharedPipeModule} from '../../../../../../shared/pipes/shared-pipe.module';
import {LuthierService} from '../../../luthier.service';
import {MessageDialogService} from '../../../../../../shared/services/message/message-dialog-service';
import {UtilFunctions} from '../../../../../../shared/util/util-functions';
import {FuseHighlightComponent} from '../../../../../../../@fuse/components/highlight';
import {
    LuthierMenuActionTypeEnum,
    LuthierMenuCompTypeEnum,
    LuthierMenuModel,
    LuthierMenuTypeEnum,
    LuthierMenuVisibilityEnum,
    LuthierResourceModel,
    LuthierUserModel
} from '../../../../../../shared/models/luthier.model';
import {MatSlideToggleChange, MatSlideToggleModule} from '@angular/material/slide-toggle';
import {LuthierManagerMenutreeComponent} from '../../menutree/luthier-manager-menutree.component';


@Component({
    selector       : 'luthier-manager-menu-modal',
    styleUrls      : ['/luthier-manager-menu-modal.component.scss'],
    templateUrl    : './luthier-manager-menu-modal.component.html',
    imports: [
        MatIconModule,
        FuseHighlightComponent,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        NgFor,
        NgClass,
        NgxMaskDirective,
        MatDialogModule,
        JsonPipe,
        NgIf,
        SharedPipeModule,
        MatSlideToggleModule
    ],
    providers: [
        provideNgxMask(),
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class LuthierManagerMenuModalComponent implements OnInit, OnDestroy
{
    formSave: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    private _model: LuthierMenuModel;
    title: string;
    private _service: LuthierService;
    private _parent: LuthierManagerMenuComponent | LuthierManagerMenutreeComponent;
    myUser: LuthierUserModel;
    LuthierMenuCompTypeEnum = LuthierMenuCompTypeEnum;
    LuthierMenuTypeEnum = LuthierMenuTypeEnum;
    LuthierMenuActionTypeEnum = LuthierMenuActionTypeEnum;
    LuthierMenuVisibilityEnum = LuthierMenuVisibilityEnum;
    resources: Array<LuthierResourceModel>;
    public customPatterns = { 'I': { pattern: new RegExp('\[a-zA-Z0-9_\.\]')} };

    set parent(value: LuthierManagerMenuComponent | LuthierManagerMenutreeComponent) {
        this._parent = value;
        this._service = this.parent.service;
    }

    get parent(): LuthierManagerMenuComponent | LuthierManagerMenutreeComponent {
        return  this._parent;
    }

    set model(value: LuthierMenuModel) {
        this._model = value;
    }

    get model(): LuthierMenuModel {
        return  this._model;
    }

    constructor(private _formBuilder: FormBuilder,
                private _changeDetectorRef: ChangeDetectorRef,
                public dialogRef: MatDialogRef<LuthierManagerMenuModalComponent>,
                private _messageService: MessageDialogService)
    {
    }

    ngOnInit(): void {
        this.formSave = this._formBuilder.group({
            code: [null],
            caption: ['', [Validators.required]],
            compType: [null, [Validators.required]],
            type: [null, [Validators.required]],
            actionType: [null, [Validators.required]],
            action: [''],
            visibility: [null, [Validators.required]],
            resource: [null],
            lockBy: [null],
            custom: [false]
        });
        if (this.model.code && this.model.code > 0) {
            this.formSave.get('custom').disable();
        }
        // Precisa dessa porcaria pq o Luthier faz uma gambiarra pra criar o LUP. O text area salva com \n e o LUP espera \r\n
        this.formSave.get('action')?.valueChanges.subscribe(value => {
            if (value.includes('\n')) {
                const updatedValue = value.replace(/(?<!\r)\n/g, '\r\n');
                this.formSave.get('action')?.setValue(updatedValue, { emitEvent: false });
            }
        });
        this.formSave.patchValue(this.model);

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    doSaving() {
        // getRawValue inclui valores de campos desabilitados
        this.model = this.formSave.getRawValue() as LuthierMenuModel;
        this._service.saveMenu(this.model).then(value => {
            this._messageService.open("Menu luthier salvo com sucesso!", "SUCESSO", "success")
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

    testMenuChanged(change: MatSlideToggleChange) {
        if (change.checked) {
            this.formSave.get('lockBy').patchValue(this.myUser);
        }
        else {
            this.formSave.get('lockBy').setValue(null);
        }
    }

    getSeletctedImage(value: any): string {
        if (UtilFunctions.isValidObject(value) === true) {
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
