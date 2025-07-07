import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {NgIf} from '@angular/common';

interface CreateFolderDialogData {
    currentPath: string;
}

interface CreateFolderResult {
    name: string;
    description?: string;
}

@Component({
    selector: 'create-folder-dialog',
    template: `
        <h2 mat-dialog-title>
            <mat-icon class="mr-2">folder_plus</mat-icon>
            Nova Pasta
        </h2>

        <form [formGroup]="folderForm" (ngSubmit)="onSubmit()">
            <mat-dialog-content class="space-y-4">
                <div *ngIf="data.currentPath" class="text-sm text-secondary mb-4">
                    Criar pasta em: <strong>{{ data.currentPath }}</strong>
                </div>

                <mat-form-field class="w-full">
                    <mat-label>Nome da Pasta</mat-label>
                    <input
                        matInput
                        formControlName="name"
                        placeholder="Nome da nova pasta"
                        required
                        #nameInput>
                    <mat-icon matSuffix>folder</mat-icon>
                    <mat-error *ngIf="folderForm.get('name')?.hasError('required')">
                        Nome da pasta é obrigatório
                    </mat-error>
                    <mat-error *ngIf="folderForm.get('name')?.hasError('pattern')">
                        Nome inválido. Não use caracteres especiais como: / \\ : * ? " < > |
                    </mat-error>
                    <mat-error *ngIf="folderForm.get('name')?.hasError('maxlength')">
                        Nome deve ter no máximo 255 caracteres
                    </mat-error>
                </mat-form-field>

                <mat-form-field class="w-full">
                    <mat-label>Descrição (opcional)</mat-label>
                    <textarea
                        matInput
                        formControlName="description"
                        placeholder="Descrição da pasta"
                        rows="3"
                        maxlength="500">
                    </textarea>
                    <mat-icon matSuffix>description</mat-icon>
                    <mat-hint align="end">
                        {{ folderForm.get('description')?.value?.length || 0 }}/500
                    </mat-hint>
                </mat-form-field>
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
                    [disabled]="folderForm.invalid">
                    <mat-icon>add</mat-icon>
                    Criar Pasta
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
export class CreateFolderDialogComponent {
    folderForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<CreateFolderDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: CreateFolderDialogData
    ) {
        this.folderForm = this.fb.group({
            name: ['', [
                Validators.required,
                Validators.maxLength(255),
                Validators.pattern(/^[^\/\\:*?"<>|]+$/) // Não permite caracteres especiais de sistema de arquivos
            ]],
            description: ['', [Validators.maxLength(500)]]
        });
    }

    onSubmit(): void {
        if (this.folderForm.valid) {
            const result: CreateFolderResult = {
                name: this.folderForm.value.name.trim(),
                description: this.folderForm.value.description?.trim()
            };
            this.dialogRef.close(result);
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
