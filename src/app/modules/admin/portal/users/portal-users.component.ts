import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {firstValueFrom, Subject, takeUntil} from 'rxjs';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTable, MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {NgClass, NgIf} from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {PortalUsersService} from './portal-users.service';
import {TipoUsuarioEnum, UserModel} from '../../../../shared/models/user.model';
import {PortalUsersModalComponent} from './modal/portal-users-modal.component';
import {MessageDialogService} from '../../../../shared/services/message/message-dialog-service';
import {UserService} from '../../../../shared/services/user/user.service';
import {HasHierarchyLevelDirective, HierarchyComparison} from '../../../../shared/directives/role.directive';
import {SharedPipeModule} from 'app/shared/pipes/shared-pipe.module';

@Component({
    selector: 'portal-users',
    templateUrl: './portal-users.component.html',
    styleUrls: ['./portal-users.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        MatTooltipModule,
        MatSelectModule,
        MatCheckboxModule,
        FormsModule,
        ReactiveFormsModule,
        SharedPipeModule,
        NgClass,
        NgIf,
        HasHierarchyLevelDirective
    ],
})
export class PortalUsersComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatTable) table: MatTable<any>;

    public unsubscribeAll: Subject<any> = new Subject<any>();
    public dataSource = new MatTableDataSource<UserModel>();
    displayedColumns = ['buttons', 'id', 'name', 'login', 'email', 'userType', 'enabled', 'roles'];
    userTypes = Object.values(TipoUsuarioEnum);
    HierarchyComparison = HierarchyComparison;
    constructor(
        public service: PortalUsersService,
        public messageService: MessageDialogService,
        private _changeDetectorRef: ChangeDetectorRef,
        public userService: UserService,
        private _matDialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.service.model$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe((users: UserModel[]) => {
                this.dataSource.data = users;
            });

        // Carrega os dados iniciais
        firstValueFrom(this.service.getAll());
    }

    ngOnDestroy(): void {
        this.unsubscribeAll.next(null);
        this.unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        this.dataSource.sortingDataAccessor = (item, property) => {
            if (typeof item[property] === 'string') {
                return item[property].toLowerCase();
            }
            return item[property];
        };
        this.dataSource.sort = this.sort;
    }

    add(): void {
        firstValueFrom(this.service.getAllRoles()).then(roles => {
            const modal = this._matDialog.open(PortalUsersModalComponent, {
                disableClose: true,
                panelClass: 'portal-users-modal-container'
            });
            modal.componentInstance.title = 'Novo Usuário';
            modal.componentInstance.parent = this;
            modal.componentInstance.model = new UserModel();
            modal.componentInstance.availableRoles = roles;
        })

    }

    refresh(): void {
        firstValueFrom(this.service.getAll());
    }

    update(): void {
        setTimeout(() => {
            this.table.renderRows();
            this._changeDetectorRef.detectChanges();
        });
    }

    edit(id: number): void {
        firstValueFrom(this.service.getAllRoles()).then(roles => {
            const modal = this._matDialog.open(PortalUsersModalComponent, {
                disableClose: true,
                panelClass: 'portal-users-modal-container'
            });
            modal.componentInstance.title = 'Editar Usuário';
            modal.componentInstance.parent = this;
            modal.componentInstance.model = this.dataSource.data.find(x => x.id === id);
            modal.componentInstance.availableRoles = roles;
        })
    }

    delete(id: number): void {
        this.messageService.open('Deseja realmente remover este usuário?', 'CONFIRMAÇÃO', 'confirm')
            .subscribe((result) => {
                if (result === 'confirmed') {
                    firstValueFrom(this.service.delete(id))
                        .then(() => {
                            this.messageService.open('Usuário removido com sucesso', 'SUCESSO', 'success');
                        })
                        .catch((error) => {
                            this.messageService.open(error.error.message || 'Erro ao remover usuário', 'ERRO', 'error');
                        });
                }
            });
    }

    filter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    getRoleNames(roles: any[]): string {
        return roles?.map(role => role.name).join(', ') || '';
    }
}
