import {
    AfterViewInit,
    ChangeDetectionStrategy,
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
import {DatePipe, NgClass, NgIf} from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';
import {
    LuthierSubsystemModel,
    LuthierUserActionEnum,
    LuthierUserGroupEnum,
    LuthierUserModel
} from '../../../../shared/models/luthier.model';
import {LuthierComponent} from '../luthier.component';
import {LuthierService} from '../luthier.service';
import {UtilFunctions} from '../../../../shared/util/util-functions';
import {MatTabsModule} from '@angular/material/tabs';
import {MessageDialogService} from '../../../../shared/services/message/message-dialog-service';
import {LuthierUserUserModalComponent} from './modal/user/luthier-user-user-modal.component';
import {FilterPredicateUtil} from '../../../../shared/util/util-classes';
import {LuthierUserGroupModalComponent} from './modal/group/luthier-user-group-modal.component';

@Component({
    selector     : 'luthier-user',
    templateUrl  : './luthier-user.component.html',
    styleUrls : ['./luthier-user.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone   : true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        MatTooltipModule,
        NgClass,
        NgIf,
        DatePipe,
        MatTabsModule

    ],
})
export class LuthierUserComponent implements OnInit, OnDestroy, AfterViewInit
{

    @ViewChild('sortGroups') sortGroups: MatSort;
    @ViewChild('sortUsers') sortUsers: MatSort;
    @ViewChild(MatTable) table: MatTable<any>;
    public unsubscribeAll: Subject<any> = new Subject<any>();
    public dataSourceUsers = new MatTableDataSource<LuthierUserModel>();
    public dataSourceGroups = new MatTableDataSource<LuthierUserModel>();
    displayedUsersColumns = ['buttons', 'code', 'name', 'login', 'email', 'userType', 'date', 'status', 'multiAccess', 'sms', 'groups[?].group.name' ];
    displayedGroupsColumns = ['buttons', 'code', 'name', 'login', 'email', 'userType', 'date', 'status', 'multiAccess', 'sms', 'users[?].user.name' ];
    private _myUser: LuthierUserModel;
    get myUser(): LuthierUserModel {
        return this._myUser;
    }
    get service(): LuthierService {
        if (this._parent != null) {
            return this._parent.service;
        }
        return null;
    }
    get hasProject(): boolean {
        return this.service && this.service.hasProject;
    }
    /**
     * Constructor
     */
    constructor(public _parent: LuthierComponent,
                private _changeDetectorRef: ChangeDetectorRef,
                public messageService: MessageDialogService,
                private _matDialog: MatDialog)
    {
    }

    ngOnInit(): void
    {
        this.service.user$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe((user: LuthierUserModel) =>
            {
                this._myUser = user;
            });
        this.service.users$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe((users: LuthierUserModel[]) =>
            {
                if (UtilFunctions.isValidStringOrArray(users) === true) {
                    this.dataSourceUsers.data = users.filter(x => x.group !== LuthierUserGroupEnum.GROUP);
                    this.dataSourceGroups.data = users.filter(x => x.group === LuthierUserGroupEnum.GROUP);
                }
                else {
                    this.dataSourceUsers.data = [];
                    this.dataSourceGroups.data = [];
                }
                this.dataSourceUsers._updateChangeSubscription();
                this.dataSourceGroups._updateChangeSubscription();
                this._changeDetectorRef.detectChanges();
            });
        this._parent.luthierDataBase$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe((value) =>
            {
                if (UtilFunctions.isValidStringOrArray(value) === true) {
                    firstValueFrom(this.service.getUsers());
                }
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this.unsubscribeAll.next(null);
        this.unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        UtilFunctions.setSortingDataAccessor(this.dataSourceGroups);
        const filterPredicateGroups = FilterPredicateUtil.withColumns(this.displayedGroupsColumns);
        this.dataSourceGroups.filterPredicate = filterPredicateGroups.instance.bind(filterPredicateGroups);
        this.dataSourceGroups.sort = this.sortGroups;

        UtilFunctions.setSortingDataAccessor(this.dataSourceUsers);
        const filterPredicateUsers = FilterPredicateUtil.withColumns(this.displayedUsersColumns);
        this.dataSourceUsers.filterPredicate = filterPredicateGroups.instance.bind(filterPredicateUsers);
        this.dataSourceUsers.sort = this.sortUsers;
    }
    addUser() {
        this.editUser(-1, -1);
    }

    addGroup() {
        this.editGroup(-1, -1);
    }

    refresh() {
        firstValueFrom(this._parent.service.getUsers());
    }

    update() {
        const me = this;
        setTimeout(() =>{
            me.table.renderRows();
            me._changeDetectorRef.detectChanges();
        });
    }

    editUser(id: number, index: number) {
        Promise.all(
            [
                this._parent.service.getActiveSubsystems(),
                id >= 0 ? this._parent.service.getUser(id) : Promise.resolve(null)]
        ).then(value => {
            const subsystems = value[0] as LuthierSubsystemModel[];
            let user = value[1] as LuthierUserModel;
            const modal = this._matDialog.open(LuthierUserUserModalComponent, { disableClose: true, panelClass: 'luthier-user-user-modal-container' });
            modal.componentInstance.title = 'Cadastro de Usuário';
            modal.componentInstance.parent = this;
            if(id < 0){
                user = new LuthierUserModel();
                user.group = LuthierUserGroupEnum.USER;
                user.multiAccess = true;
                user.action = LuthierUserActionEnum.NONE;
            }
            modal.componentInstance.userModel = user;
            modal.componentInstance.subsystems = subsystems;
            modal.componentInstance.index = index;
            modal.afterClosed().subscribe((result) =>
            {
                if ( result === 'ok' ) {
                    this._changeDetectorRef.detectChanges();
                }

            });
        });

    }
    editGroup(id: number, index: number) {
        Promise.all(
            [
                this._parent.service.getActiveSubsystems(),
                id >= 0 ? this._parent.service.getUser(id) : Promise.resolve(null)]
        ).then(value => {
            const subsystems = value[0] as LuthierSubsystemModel[];
            let user = value[1] as LuthierUserModel;
            const modal = this._matDialog.open(LuthierUserGroupModalComponent, { disableClose: true, panelClass: 'luthier-user-group-modal-container' });
            modal.componentInstance.title = 'Cadastro de Grupo de Usuário';
            modal.componentInstance.parent = this;
            if(id < 0){
                user = new LuthierUserModel();
                user.group = LuthierUserGroupEnum.GROUP;
                user.multiAccess = true;
                user.action = LuthierUserActionEnum.NONE;
            }
            modal.componentInstance.userModel = user;
            modal.componentInstance.subsystems = subsystems;
            modal.componentInstance.index = index;
            modal.afterClosed().subscribe((result) =>
            {
                if ( result === 'ok' ) {
                    this._changeDetectorRef.detectChanges();
                }

            });
        });

    }

    deleteUser(id) {
        this.messageService.open('Tem certeza de que deseja remover o usuário?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                this.service.deleteUser(id)
                    .then(result => {
                        this.messageService.open('Usuário removido com sucesso', 'SUCESSO', 'success');
                    })

            }
        });
    }

    announceSortChange($event: any) {

    }

    filterUsers(event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceUsers.filter = filterValue.trim().toLowerCase();
    }
    filterGroups(event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceGroups.filter = filterValue.trim().toLowerCase();
    }

    getUserGroups(model: LuthierUserModel): string {
        if (UtilFunctions.isValidStringOrArray(model.groups) === true) {
            return model.groups.map(x => x.group.name).join('; ');
        }
        return '';
    }

    getGroupUsers(model: LuthierUserModel): string {
        if (UtilFunctions.isValidStringOrArray(model.users) === true) {
            return model.users.map(x => x.user.name).join('; ');
        }
        return '';
    }
}
