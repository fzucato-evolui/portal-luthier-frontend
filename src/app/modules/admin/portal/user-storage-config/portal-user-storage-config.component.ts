import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {Subject, takeUntil} from 'rxjs';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTable, MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {CommonModule, DatePipe} from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';
import {PortalUserStorageConfigService} from './portal-user-storage-config.service';
import {PortalUserStorageListModel} from '../../../../shared/models/portal-user-storage-config.model';
import {PortalUserStorageConfigModalComponent} from './modal/portal-user-storage-config-modal.component';
import {MessageDialogService} from 'app/shared/services/message/message-dialog-service';
import {UtilFunctions} from 'app/shared/util/util-functions';
import {FilterPredicateUtil} from 'app/shared/util/util-classes';
import {AppRoles} from 'app/shared/models/app-roles.model';
import {UserService} from 'app/shared/services/user/user.service';

@Component({
    selector: 'portal-user-storage-config',
    templateUrl: './portal-user-storage-config.component.html',
    styleUrls: ['./portal-user-storage-config.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        MatTooltipModule,
        DatePipe
    ]
})
export class PortalUserStorageConfigComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatTable) table: MatTable<any>;

    public unsubscribeAll: Subject<any> = new Subject<any>();
    public dataSource = new MatTableDataSource<PortalUserStorageListModel>();
    displayedColumns = ['buttons', 'id', 'name', 'email', 'activeConfigs', 'lastConfigUpdate'];

    // Expor AppRoles para uso no template
    readonly AppRoles = AppRoles;

    constructor(
        public service: PortalUserStorageConfigService,
        public messageService: MessageDialogService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _matDialog: MatDialog,
        private _userService: UserService
    ) {}

    ngOnInit(): void {
        this.service.users$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe(users => {
                this.dataSource.data = users;
            });
    }

    ngOnDestroy(): void {
        this.unsubscribeAll.next(null);
        this.unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        UtilFunctions.setSortingDataAccessor(this.dataSource);
        const filterPredicateMenu = FilterPredicateUtil.withColumns(this.displayedColumns);
        this.dataSource.filterPredicate = filterPredicateMenu.instance.bind(filterPredicateMenu);
        this.dataSource.sort = this.sort;
    }

    refresh(): void {
        this.service.loadUsers();
    }

    update(): void {
        setTimeout(() => {
            this.table.renderRows();
            this._changeDetectorRef.detectChanges();
        });
    }

    edit(user: PortalUserStorageListModel): void {
        this.service.getUserConfigs(user.id).then(configs => {
            const modal = this._matDialog.open(PortalUserStorageConfigModalComponent, {
                disableClose: true,
                panelClass: 'portal-user-storage-config-modal-container',
                data: {
                    userId: user.id,
                    userName: user.name,
                    configs: configs,
                    users: this.dataSource.data
                }
            });
            modal.componentInstance.title = "Configurações de Armazenamento";
            modal.componentInstance.parent = this;
        });
    }

    addConfig(): void {
        this.service.getUsersWithoutStorageConfigs().subscribe(usersWithoutConfig => {
            const modal = this._matDialog.open(PortalUserStorageConfigModalComponent, {
                disableClose: true,
                panelClass: 'portal-user-storage-config-modal-container',
                data: {
                    users: usersWithoutConfig
                }
            });
            modal.componentInstance.title = "Nova Configuração de Armazenamento";
            modal.componentInstance.parent = this;
        });
    }

    filter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    announceSortChange(): void {
        // Implementação se necessário
    }

    // Métodos auxiliares para verificação de roles
    hasRole(role: string): boolean {
        return this._userService.userHasRole(role);
    }

    hasHierarchyLevel(level: number): boolean {
        const userLevel = this._userService.getUserHighestHierarchyLevel();
        return userLevel !== undefined && userLevel <= level;
    }
}
