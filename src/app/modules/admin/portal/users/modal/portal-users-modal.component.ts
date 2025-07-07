import {NgFor, NgIf} from '@angular/common';
import {Component, Inject, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectChange, MatSelectModule} from '@angular/material/select';
import {Subject} from 'rxjs';

import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTooltipModule} from '@angular/material/tooltip';
import {UtilFunctions} from 'app/shared/util/util-functions';
import {HasHierarchyLevelDirective, HierarchyComparison} from '../../../../../shared/directives/role.directive';
import {RoleModel, RoleTypeEnum, TipoUsuarioEnum, UserModel} from '../../../../../shared/models/user.model';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {UserService} from '../../../../../shared/services/user/user.service';
import {PortalUsersComponent} from '../portal-users.component';

@Component({
    selector: 'portal-users-modal',
    templateUrl: './portal-users-modal.component.html',
    styleUrls: ['./portal-users-modal.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
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
        HasHierarchyLevelDirective,
        MatTooltipModule

    ],
})
export class PortalUsersModalComponent implements OnInit, OnDestroy {
    form: FormGroup;
    title: string;
    parent: PortalUsersComponent;
    model: UserModel;
    userTypes = Object.values(TipoUsuarioEnum);
    availableRoles: RoleModel[] = [];
    isNewUser: boolean;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    HierarchyComparison = HierarchyComparison;
    constructor(
        private _formBuilder: FormBuilder,
        private _dialogRef: MatDialogRef<PortalUsersModalComponent>,
        private _messageService: MessageDialogService,
        private _userService: UserService,
        @Inject(MAT_DIALOG_DATA) private _data: any
    ) {

    }

    ngOnInit(): void {
        this.isNewUser = !this.model.id;
        // Inicializa o formulário
        this.form = this._formBuilder.group({
            id: [this.model.id],
            name: [this.model.name, [Validators.required]],
            login: [this.model.login, [Validators.required]],
            email: [this.model.email, [Validators.required, Validators.email]],
            password: [this.model.password, this.isNewUser ? [Validators.required] : []],
            newPassword: [this.model.newPassword],
            userType: [this.model.userType || TipoUsuarioEnum.CUSTOM, [Validators.required]],
            enabled: [this.model.enabled ?? true],
            roles: [this.model.roles || [], [Validators.required]]
        });


        // Se for edição, desabilita alguns campos
        if (!this.isNewUser) {
            this.form.get('login').disable();
            if (this.model.userType !== TipoUsuarioEnum.CUSTOM) {
                this.form.get('password').disable();
                this.form.get('newPassword').disable();
            }
        }
        this.form.get('userType').disable();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    canSave(): boolean {
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
            // Se não for um novo usuário e não tiver nova senha, mantém a senha atual
            password: this.isNewUser ? formValue.password :
                     (formValue.newPassword ? formValue.newPassword : this.model.password)
        };

        // Remove campos desnecessários
        delete userToSave.newPassword;

        // Salva o usuário
        const saveOperation = this.isNewUser ?
            this.parent.service.create(userToSave) :
            this.parent.service.update(userToSave);

        saveOperation.subscribe({
            next: () => {
                this._messageService.open(
                    `Usuário ${this.isNewUser ? 'criado' : 'atualizado'} com sucesso`,
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

    changeRoles(event: MatSelectChange): void {
        const rolesControl = this.form.get('roles');
        if (!rolesControl) return;

        const selectedRoles = event.value as RoleModel[];
        if (UtilFunctions.isValidStringOrArray(selectedRoles) === false) {
            rolesControl.setValue([...selectedRoles], { emitEvent: false });
            return;
        }
        const previousRoles = rolesControl.value as RoleModel[];

        // Encontra a role que foi alterada (adicionada ou removida)
        const changedRole = selectedRoles.find(r => !previousRoles.some(pr => pr.id === r.id)) ||
                          previousRoles.find(r => !selectedRoles.some(sr => sr.id === r.id));

        if (changedRole?.type === RoleTypeEnum.HIERARCHICAL) {
            // Se a role alterada é hierárquica, mantém apenas ela e as não-hierárquicas
            const nonHierarchicalRoles = selectedRoles.filter(r => r.type !== RoleTypeEnum.HIERARCHICAL);
            rolesControl.setValue([...nonHierarchicalRoles, changedRole], { emitEvent: false });
        }
    }

}
