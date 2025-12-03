import {NgFor, NgIf} from '@angular/common';
import {Component, Inject, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators
} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {Subject} from 'rxjs';

import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTooltipModule} from '@angular/material/tooltip';
import {HierarchyComparison} from '../../../../../shared/directives/role.directive';
import {RoleModel, TipoUsuarioEnum, UserModel} from '../../../../../shared/models/user.model';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {UserService} from '../../../../../shared/services/user/user.service';

export const passwordGroupValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    const password = control.get('password');
    const newPassword = control.get('newPassword');
    const confirm = control.get('passwordConfirm');

    const anyFilled = password?.value || newPassword?.value || confirm?.value;

    // Limpa erros antigos do group-validation
    password?.setErrors(null);
    newPassword?.setErrors(null);
    confirm?.setErrors(null);

    // Regra 1: se qualquer um for preenchido → todos obrigatórios
    if (anyFilled) {
        if (!password?.value) password?.setErrors({ required: true });
        if (!newPassword?.value) newPassword?.setErrors({ required: true });
        if (!confirm?.value) confirm?.setErrors({ required: true });
    }

    // Regra 2: Senhas iguais
    if (newPassword?.value && confirm?.value && newPassword.value !== confirm.value) {
        confirm?.setErrors({ mismatch: true });
    }

    return null;
};

@Component({
    selector: 'portal-users-profile-modal',
    templateUrl: './portal-users-profile-modal.component.html',
    styleUrls: ['./portal-users-profile-modal.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatIconModule,
        ReactiveFormsModule,
        MatSlideToggleModule,
        NgIf,
        NgFor,
        MatTooltipModule

    ],
})
export class PortalUsersProfileModalComponent implements OnInit, OnDestroy {
    form: FormGroup;
    title: string;
    isNewUser: boolean = false;
    model: UserModel;
    userTypes = Object.values(TipoUsuarioEnum);
    availableRoles: RoleModel[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    HierarchyComparison = HierarchyComparison;
    constructor(
        private _formBuilder: FormBuilder,
        private _dialogRef: MatDialogRef<PortalUsersProfileModalComponent>,
        private _messageService: MessageDialogService,
        private _userService: UserService,
        @Inject(MAT_DIALOG_DATA) private _data: any
    ) {

    }

    ngOnInit(): void {
        // Inicializa o formulário
        this.form = this._formBuilder.group({
            id: [this.model.id],
            name: [this.model.name, [Validators.required]],
            login: [this.model.login, [Validators.required]],
            email: [this.model.email, [Validators.required, Validators.email]],
            password: ['', []],
            newPassword: ['', []],
            passwordConfirm: ['', []],
            userType: [this.model.userType || TipoUsuarioEnum.CUSTOM, [Validators.required]],
            enabled: [this.model.enabled ?? true],
            roles: [this.model.roles || [], [Validators.required]]
        }, {
            validators: [passwordGroupValidator]
        });

        this.form.get('login').disable();
        this.form.get('enabled').disable();
        this.form.get('roles').disable();
        if (this.model.userType !== TipoUsuarioEnum.CUSTOM) {
            this.form.get('name').disable();
            this.form.get('email').disable();
        }
        this.form.get('userType').disable();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    canSave(): boolean {
        if (this.model.userType !== TipoUsuarioEnum.CUSTOM) {
            return false;
        }
        if (this.form) {
            return !this.form.invalid;
        }
        return false;
    }
    save(): void {
        if (this.form.invalid) {
            return;
        }

        // Prepara o modelo para salvar
        const formValue = this.form.getRawValue();
        const userToSave = {
            ...this.model,
            ...formValue,
        };

        // Remove campos desnecessários
        //delete userToSave.newPassword;

        // Salva o usuário
        const saveOperation = this._userService.update(userToSave);

        saveOperation.subscribe({
            next: () => {
                this._messageService.open(
                    `Usuário 'atualizado' com sucesso`,
                    'SUCESSO',
                    'success'
                );
                this._dialogRef.close();
            }
        });
    }

    close(): void {
        this._dialogRef.close();
    }

    compareRoles(role1: RoleModel, role2: RoleModel): boolean {
        return role1?.id === role2?.id;
    }

}
