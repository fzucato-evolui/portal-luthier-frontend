import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {NgIf} from '@angular/common';

@Component({
    selector: 'rename-file-dialog',
    template: `
        <h2 mat-dialog-title>
            <mat-icon class="mr-2">edit</mat-icon>
            Renomear {{ data.isDirectory ? 'Pasta' : 'Arquivo' }}
        </h2>

        <form [formGroup]="renameForm" (ngSubmit)="onSubmit()">
            <mat-dialog-content class="space-y-4">
                <div class="text-sm text-secondary mb-4">
                    Nome atual: <strong>{{ data.fileName + (data.isDirectory ? '.' + data.extension : '') }}</strong>
                </div>

                <mat-form-field class="w-full">
                    <mat-label>Novo Nome</mat-label>
                    <input
                        matInput
                        formControlName="name"
                        placeholder="Digite o novo nome"
                        required
                        #nameInput>
                    <mat-icon matPrefix>{{ data.isDirectory ? 'folder' : 'description' }}</mat-icon>
                    <span matSuffix *ngIf="!data.isDirectory">
                        .{{ data.extension }}
                    </span>
                    <mat-error *ngIf="renameForm.get('name')?.hasError('required')">
                        Nome é obrigatório
                    </mat-error>
                    <mat-error *ngIf="renameForm.get('name')?.hasError('pattern')">
                        Nome inválido. Não use caracteres especiais como: / \\ : * ? " < > |
                    </mat-error>
                    <mat-error *ngIf="renameForm.get('name')?.hasError('maxlength')">
                        Nome deve ter no máximo 255 caracteres
                    </mat-error>
                </mat-form-field>

                <div *ngIf="!data.isDirectory" class="text-xs text-secondary">
                    <mat-icon class="icon-size-4 mr-1">info</mat-icon>
                    Atenção: Não é permitido alterar a extensão do arquivo.
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
                    [disabled]="renameForm.invalid || renameForm.value.name === data.fileName">
                    <mat-icon>save</mat-icon>
                    Renomear
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
export class RenameFileDialogComponent {
    renameForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<RenameFileDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { fileName: string; isDirectory: boolean; extension: string }
    ) {
        //Remove a extensão do nome do arquivo se não for um diretório
        if (!data.isDirectory && data.fileName.includes('.')) {
            data.fileName = data.fileName.substring(0, data.fileName.lastIndexOf('.'));
        }

        this.renameForm = this.fb.group({
            name: [data.fileName, [
                Validators.required,
                Validators.maxLength(255),
                Validators.pattern(/^[^\/\\:*?"<>|]+$/)
            ]]
        });
    }

    onSubmit(): void {
        if (this.renameForm.valid) {
            const newName = this.renameForm.value.name.trim() + (this.data.isDirectory ? '' : '.' + this.data.extension);
            this.dialogRef.close(newName);
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
