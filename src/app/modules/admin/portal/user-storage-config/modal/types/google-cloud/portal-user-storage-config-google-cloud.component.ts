import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {CommonModule, JsonPipe} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {PortalUserStorageConfig} from '../../../../../../../shared/models/portal-user-storage-config.model';
import {GoogleCloudConfig} from '../../../../../../../shared/models/portal-user-storage-config-types.model';
import {NgxFileDropEntry, NgxFileDropModule} from 'ngx-file-drop';
import {UtilFunctions} from '../../../../../../../shared/util/util-functions';
import {GoogleServiceAccountModel} from '../../../../../../../shared/models/system-config.model';
import {MessageDialogService} from '../../../../../../../shared/services/message/message-dialog-service';

@Component({
    selector: 'portal-user-storage-config-google-cloud',
    templateUrl: './portal-user-storage-config-google-cloud.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatCheckboxModule,
        NgxFileDropModule,
        JsonPipe,
    ]
})
export class PortalUserStorageConfigGoogleCloudComponent implements OnInit {
    @Input() config: PortalUserStorageConfig | undefined;
    @Input() userId: number;
    @Output() save = new EventEmitter<GoogleCloudConfig>();
    @Output() activate = new EventEmitter<number>();
    @Output() delete = new EventEmitter<number>();

    form: FormGroup;

    constructor(private _formBuilder: FormBuilder, private _messageService: MessageDialogService, private _changeDetectorRef: ChangeDetectorRef,) {}

    ngOnInit(): void {
        const config = this.config?.config as GoogleCloudConfig;
        this.form = this._formBuilder.group({
            serviceAccount: [config?.serviceAccount || '', [Validators.required]],
            bucketName: [config?.bucketName || '', [Validators.required]],
            rootFolder: [config?.rootFolder || '']
        });
    }

    onSubmit(): void {
        if (this.form.invalid) {
            return;
        }

        this.save.emit(this.form.value);
    }

    onActivate(): void {
        if (this.config?.id) {
            this.activate.emit(this.config.id);
        }
    }

    onDelete(): void {
        if (this.config?.id) {
            this.delete.emit(this.config.id);
        }
    }

    public dropped(files: NgxFileDropEntry[]) {
        const me = this;
        files.forEach(x => {
            if (x.fileEntry.isFile) {
                const ext = UtilFunctions.getFileExtension(x.relativePath);
                if (ext !== '.json') {
                    this._messageService.open('Extensão não permitida', 'ERRO', 'error');
                    return;
                }
                const fileEntry = x.fileEntry as FileSystemFileEntry;

                fileEntry.file((file: File) => {
                    file.arrayBuffer().then( buffer=> {
                        const googleServiceAccount: GoogleServiceAccountModel = JSON.parse(UtilFunctions.arrayBufferToString(buffer));
                        if (!GoogleServiceAccountModel.validate(googleServiceAccount)) {
                            throw Error("Arquivo inválido");
                        }
                        me.form.get('serviceAccount').patchValue(googleServiceAccount);
                        me._changeDetectorRef.markForCheck();

                        setTimeout(function () { //Para atualizar o vídeo
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
}
