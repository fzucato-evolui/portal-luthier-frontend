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
import {LuthierResourceComponent} from '../luthier-resource.component';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectChange, MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {JsonPipe, NgFor, NgIf} from '@angular/common';
import {SharedPipeModule} from '../../../../../shared/pipes/shared-pipe.module';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {
    LuthierDatabaseModel,
    LuthierResourceModel,
    LuthierResourceTypeEnum
} from '../../../../../shared/models/luthier.model';
import {LuthierService} from '../../luthier.service';
import {NgxFileDropEntry, NgxFileDropModule} from 'ngx-file-drop';
import {UtilFunctions} from '../../../../../shared/util/util-functions';

@Component({
    selector       : 'luthier-resource-modal',
    styleUrls      : ['/luthier-resource-modal.component.scss'],
    templateUrl    : './luthier-resource-modal.component.html',
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
        NgxFileDropModule,
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
export class LuthierResourceModalComponent implements OnInit, OnDestroy
{
    formSave: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public model: LuthierResourceModel;
    title: string;
    private _service: LuthierService;
    private _parent: LuthierResourceComponent;
    LuthierResourceTypeEnum = LuthierResourceTypeEnum;

    public customPatterns = { 'I': { pattern: new RegExp('\[a-zA-Z0-9_\]')} };

    set parent(value: LuthierResourceComponent) {
        this._parent = value;
        this._service = this.parent.service;
    }

    get parent(): LuthierResourceComponent {
        return  this._parent;
    }
    constructor(private _formBuilder: FormBuilder,
                private _changeDetectorRef: ChangeDetectorRef,
                public dialogRef: MatDialogRef<LuthierResourceModalComponent>,
                private _messageService: MessageDialogService)
    {
    }

    ngOnInit(): void {

        this.formSave = this._formBuilder.group({
            code: [''],
            name: ['', [Validators.required]],
            description: [''],
            identifier: ['', [Validators.required]],
            file: ['', [Validators.required]],
            resourceType: ['', [Validators.required]],
            height: [''],
            width: [''],
        });

        this.formSave.patchValue(this.model);

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    doSaving() {

        this.model = this.formSave.value as LuthierDatabaseModel;
        this._service.saveResource(this.model).then(value => {
            this._messageService.open("Recurso luthier salvo com sucesso!", "SUCESSO", "success")
            this.dialogRef.close();
        });


    }

    canSave(): boolean {
        if (this.formSave) {
            return !this.formSave.invalid;
        }
        return false;
    }


    isImage(): boolean {
        const value = this.formSave.get('resourceType').value as LuthierResourceTypeEnum;
        return value && value !== LuthierResourceTypeEnum.STRING && value !== LuthierResourceTypeEnum.OLE_EXCEL && value !== LuthierResourceTypeEnum.OLE_WORD;
    }

    resourceTypeChanged(val: MatSelectChange) {
        const value = val.value as LuthierResourceTypeEnum;
        let category = 'RESOURCE_MENU_ICON';
        if (value === LuthierResourceTypeEnum.STRING) {
            category = 'RESOURCE_STRING';
        }
        else if (value === LuthierResourceTypeEnum.OLE_WORD) {
            category = 'RESOURCE_DOCUMENT';
        }
        else if (value === LuthierResourceTypeEnum.OLE_EXCEL) {
            category = 'RESOURCE_DOCUMENT';
        }
        this.formSave.get('file').patchValue(null);
        this.formSave.get('identifier').patchValue(category);
    }

    public dropped(files: NgxFileDropEntry[]) {
        this.formSave.get('file').patchValue(null);
        const me = this;
        files.forEach(x => {
            if (x.fileEntry.isFile) {
                const ext = UtilFunctions.getFileExtension(x.relativePath);
                if (!me.getAllowedExtension().includes(ext)) {
                    this._messageService.open('Extensão não permitida', 'ERRO', 'error');
                    return;
                }
                const fileEntry = x.fileEntry as FileSystemFileEntry;

                fileEntry.file((file: File) => {
                    file.arrayBuffer().then( buffer=> {
                        const base64 = UtilFunctions.arrayBufferToBase64(buffer);
                        me.formSave.get('file').patchValue(base64);
                        me._changeDetectorRef.markForCheck();

                        setTimeout(function () {
                            me._changeDetectorRef.markForCheck();
                        }, 200);

                    }).catch(reason => {
                        me._messageService.open(reason, 'ERRO', 'error');
                    }).finally(() => {

                    });

                });
            }
        })

    }

    getAllowedExtension(): string[] {
        const value = this.formSave.get('resourceType').value as LuthierResourceTypeEnum;
        if (!value || value === LuthierResourceTypeEnum.STRING) {
            return null;
        }
        if (value === LuthierResourceTypeEnum.IMAGE_PNG) {
            return ['.png'];
        }
        if (value === LuthierResourceTypeEnum.IMAGE_JPEG) {
            return ['.jpg'];
        }
        if (value === LuthierResourceTypeEnum.IMAGE_BITMAP) {
            return ['.bmp'];
        }
        if (value === LuthierResourceTypeEnum.IMAGE_ICO) {
            return ['.ico'];
        }
        if (value === LuthierResourceTypeEnum.IMAGE_WMF) {
            return ['.wmf'];
        }
        if (value === LuthierResourceTypeEnum.OLE_WORD) {
            return ['.doc', '.docx'];
        }
        if (value === LuthierResourceTypeEnum.OLE_EXCEL) {
            return ['.xls', '.xlsx'];
        }
    }

    imageLoaded(event: Event) {
        const imgElement = event.target as HTMLImageElement;
        const width = imgElement.naturalWidth;
        const height = imgElement.naturalHeight;
        this.formSave.get('width').patchValue(width);
        this.formSave.get('height').patchValue(height);
    }
}
