import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {NgIf} from '@angular/common';
import {EditFileRequestModel, FileListItemModel} from '../../../../../../shared/models/portal-storage.model';

@Component({
    selector: 'edit-file-dialog',
    template: `
        <h2 mat-dialog-title>
            <mat-icon class="mr-2">edit_note</mat-icon>
            Editar Detalhes do {{ data.file.isDirectory ? 'Diretório' : 'Arquivo' }}
        </h2>

        <form [formGroup]="editForm" (ngSubmit)="onSubmit()">
            <mat-dialog-content class="space-y-4">
                <div class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <mat-icon class="text-hint">{{ data.file.isDirectory ? 'folder' : 'description' }}</mat-icon>
                    <div>
                        <div class="font-medium">{{ data.file.originalName }}</div>
                        <div class="text-sm text-secondary">
                            {{ data.file.isDirectory ? 'Diretório' : 'Arquivo' }}
                            <span *ngIf="!data.file.isDirectory"> • {{ formatFileSize(data.file.size) }}</span>
                        </div>
                    </div>
                </div>

                <mat-form-field class="w-full">
                    <mat-label>Descrição</mat-label>
                    <textarea
                        matInput
                        formControlName="description"
                        placeholder="Adicione uma descrição para este {{ data.file.isDirectory ? 'diretório' : 'arquivo' }}"
                        rows="4"
                        maxlength="1000">
                    </textarea>
                    <mat-icon matSuffix>description</mat-icon>
                    <mat-hint align="end">
                        {{ editForm.get('description')?.value?.length || 0 }}/1000
                    </mat-hint>
                </mat-form-field>

                <mat-form-field class="w-full hidden">
                    <mat-label>Tags (separadas por vírgula)</mat-label>
                    <input
                        matInput
                        formControlName="tags"
                        placeholder="tag1, tag2, tag3"
                        maxlength="500">
                    <mat-icon matSuffix>label</mat-icon>
                    <mat-hint>Use vírgulas para separar múltiplas tags</mat-hint>
                </mat-form-field>

                <div class="grid grid-cols-2 gap-4">
                    <div class="text-sm">
                        <div class="font-medium text-secondary mb-1">Criado em:</div>
                        <div>{{ formatDate(data.file.createdAt) }}</div>
                    </div>
                    <div class="text-sm">
                        <div class="font-medium text-secondary mb-1">Modificado em:</div>
                        <div>{{ formatDate(data.file.updatedAt) }}</div>
                    </div>
                </div>
            </mat-dialog-content>

            <mat-dialog-actions align="end" class="space-x-2">
                <button
                    mat-button
                    type="button"
                    (click)="onCancel()">
                    Cancelar
                </button>
                <button
                    mat-flat-button
                    color="primary"
                    type="submit"
                    [disabled]="editForm.pristine">
                    <mat-icon>save</mat-icon>
                    Salvar Alterações
                </button>
            </mat-dialog-actions>
        </form>
    `,
    standalone: true,
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        ReactiveFormsModule,
        NgIf
    ]
})
export class EditFileDialogComponent {
    editForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<EditFileDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { file: FileListItemModel }
    ) {
        this.editForm = this.fb.group({
            id: [data.file.id, Validators.required],
            description: [data.file.description || '', [Validators.maxLength(1000)]],
            tags: [data.file.tags || '', [Validators.maxLength(500)]]
        });
    }

    onSubmit(): void {
        if (this.editForm.valid) {
            const result: EditFileRequestModel = {
                id: this.editForm.value.id,
                description: this.editForm.value.description?.trim(),
                tags: this.editForm.value.tags?.trim()
            };
            this.dialogRef.close(result);
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
    }
}
