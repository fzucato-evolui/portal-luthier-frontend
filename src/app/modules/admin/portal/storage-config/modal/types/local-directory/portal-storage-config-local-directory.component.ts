import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {LocalDirectoryConfig} from '../../../../../../../shared/models/portal-storage-config-types.model';
import {PortalStorageConfigModel} from '../../../../../../../shared/models/portal-storage-config.model';
import {UtilFunctions} from '../../../../../../../shared/util/util-functions';

@Component({
    selector: 'portal-storage-config-local-directory',
    templateUrl: './portal-storage-config-local-directory.component.html',
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
export class PortalStorageConfigLocalDirectoryComponent implements OnInit {
    @Input() config: PortalStorageConfigModel | undefined;
    @Output() save = new EventEmitter<LocalDirectoryConfig>();

    form: FormGroup;

    constructor(private _formBuilder: FormBuilder) {}

    ngOnInit(): void {
        const config = this.config?.config as LocalDirectoryConfig;
        this.form = this._formBuilder.group({
            basePath: [config?.basePath || '', [Validators.required]],
            createMissingDirectories: [config?.createMissingDirectories || false]
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
