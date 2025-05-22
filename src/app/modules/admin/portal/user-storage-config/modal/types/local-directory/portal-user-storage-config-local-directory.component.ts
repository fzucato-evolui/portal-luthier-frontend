import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PortalUserStorageConfig } from '../../../../../../../shared/models/portal-user-storage-config.model';
import { LocalDirectoryConfig } from '../../../../../../../shared/models/portal-user-storage-config-types.model';

@Component({
    selector: 'portal-user-storage-config-local-directory',
    templateUrl: './portal-user-storage-config-local-directory.component.html',
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
export class PortalUserStorageConfigLocalDirectoryComponent implements OnInit {
    @Input() config: PortalUserStorageConfig | undefined;
    @Input() userId: number;
    @Output() save = new EventEmitter<LocalDirectoryConfig>();
    @Output() activate = new EventEmitter<number>();
    @Output() delete = new EventEmitter<number>();

    form: FormGroup;
    loading = false;

    constructor(private _formBuilder: FormBuilder) {}

    ngOnInit(): void {
        const config = this.config?.config as LocalDirectoryConfig;
        this.form = this._formBuilder.group({
            basePath: [config?.basePath || '', [Validators.required]],
            createMissingDirectories: [config?.createMissingDirectories || false]
        });
    }

    onSubmit(): void {
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this.save.emit(this.form.value);
        this.loading = false;
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
} 