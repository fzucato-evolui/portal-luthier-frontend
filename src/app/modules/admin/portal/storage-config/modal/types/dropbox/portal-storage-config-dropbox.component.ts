import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {PortalStorageConfigModel} from '../../../../../../../shared/models/portal-storage-config.model';
import {DropboxConfig} from '../../../../../../../shared/models/portal-storage-config-types.model';
import {UtilFunctions} from '../../../../../../../shared/util/util-functions';

@Component({
    selector: 'portal-storage-config-dropbox',
    templateUrl: './portal-storage-config-dropbox.component.html',
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
        MatCheckboxModule
    ]
})
export class PortalStorageConfigDropboxComponent implements OnInit {
    @Input() config: PortalStorageConfigModel | undefined;
    @Output() save = new EventEmitter<DropboxConfig>();

    form: FormGroup;

    constructor(private _formBuilder: FormBuilder) {}

    ngOnInit(): void {
        const config = this.config?.config as DropboxConfig;
        this.form = this._formBuilder.group({
            accessToken: [config?.accessToken || '', [Validators.required]],
            appKey: [config?.appKey || '', [Validators.required]],
            appSecret: [config?.appSecret || '', [Validators.required]],
            rootFolder: [config?.rootFolder || '', [Validators.required]]
        });
    }

    canSave(): boolean {
        return this.form.valid && UtilFunctions.isValidStringOrArray(this.config.identifier)
    }

    onSubmit(): void {
        if (!this.canSave()) {
            return;
        }

        this.save.emit(this.form.value);
    }

}
