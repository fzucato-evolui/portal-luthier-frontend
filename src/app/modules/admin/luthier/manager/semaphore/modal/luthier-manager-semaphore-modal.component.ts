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
import {LuthierManagerSemaphoreComponent} from '../luthier-manager-semaphore.component';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {JsonPipe, NgFor, NgIf} from '@angular/common';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {SharedPipeModule} from '../../../../../../shared/pipes/shared-pipe.module';
import {
    LuthierSemaphoreBehaviorEnum,
    LuthierSemaphoreModel,
    LuthierSemaphoreValueTypeEnum,
    LuthierUserModel
} from '../../../../../../shared/models/luthier.model';
import {LuthierService} from '../../../luthier.service';
import {MessageDialogService} from '../../../../../../shared/services/message/message-dialog-service';
import {UtilFunctions} from '../../../../../../shared/util/util-functions';
import {FuseHighlightComponent} from '../../../../../../../@fuse/components/highlight';


@Component({
    selector       : 'luthier-manager-semaphore-modal',
    styleUrls      : ['/luthier-manager-semaphore-modal.component.scss'],
    templateUrl    : './luthier-manager-semaphore-modal.component.html',
    imports: [
        MatIconModule,
        FuseHighlightComponent,
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
export class LuthierManagerSemaphoreModalComponent implements OnInit, OnDestroy
{
    formSave: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public model: LuthierSemaphoreModel;
    title: string;
    private _service: LuthierService;
    private _parent: LuthierManagerSemaphoreComponent;
    users: Array<LuthierUserModel> = [];
    LuthierSemaphoreBehaviorEnum = LuthierSemaphoreBehaviorEnum;
    LuthierSemaphoreValueTypeEnum = LuthierSemaphoreValueTypeEnum;
    public customPatterns = { 'I': { pattern: new RegExp('\[a-zA-Z0-9_\.\]')} };

    set parent(value: LuthierManagerSemaphoreComponent) {
        this._parent = value;
        this._service = this.parent.service;
    }

    get parent(): LuthierManagerSemaphoreComponent {
        return  this._parent;
    }

    constructor(private _formBuilder: FormBuilder,
                private _changeDetectorRef: ChangeDetectorRef,
                public dialogRef: MatDialogRef<LuthierManagerSemaphoreModalComponent>,
                private _messageService: MessageDialogService)
    {
    }

    ngOnInit(): void {
        this.formSave = this._formBuilder.group({
            code: [null],
            name: ['', [Validators.required]],
            description: [''],
            behavior: [null, [Validators.required]],
            currentValue: ['', [Validators.required]],
            initialValue: ['', [Validators.required]],
            valueType: [null, [Validators.required]],
            timeout: [0, [Validators.required]],
            mask: [''],
        });

        this.formSave.patchValue(this.model);

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    doSaving() {
        const previousName = this.model.previousName;
        this.model = this.formSave.value as LuthierSemaphoreModel;
        this.model.name = this.model.name.toUpperCase();
        this.model.previousName = previousName;
        this._service.saveSemaphore(this.model).then(value => {
            this._messageService.open("Semáforo luthier salvo com sucesso!", "SUCESSO", "success")
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
