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
import {PortalLuthierDatabaseService} from './portal-luthier-database.service';
import {PortalLuthierDatabaseModel} from '../../../../shared/models/portal-luthier-database.model';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTable, MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {NgClass, NgIf} from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';
import {StorageChange} from '../../../../core/auth/auth.service';
import {UtilFunctions} from '../../../../shared/util/util-functions';
import {PortalLuthierDatabaseModalComponent} from './modal/portal-luthier-database-modal.component';
import {MessageDialogService} from '../../../../shared/services/message/message-dialog-service';
import {UserService} from '../../../../shared/services/user/user.service';
import {cloneDeep} from 'lodash-es';

@Component({
    selector     : 'portal-luthier-database',
    templateUrl  : './portal-luthier-database.component.html',
    styleUrls : ['./portal-luthier-database.component.scss'],
    encapsulation: ViewEncapsulation.None,
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
        NgIf

    ],
})
export class PortalLuthierDatabaseComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatTable) table: MatTable<any>;
    public unsubscribeAll: Subject<any> = new Subject<any>();
    public dataSource = new MatTableDataSource<PortalLuthierDatabaseModel>();
    displayedColumns = ['buttons', 'id', 'identifier', 'description', 'host', 'databaseType', 'database', 'user'];
    workDataBase: number;
    /**
     * Constructor
     */
    constructor(public service: PortalLuthierDatabaseService,
                public messageService: MessageDialogService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _userService: UserService,
                private _matDialog: MatDialog)

    {
        //window.addEventListener('storage', this.handleStorageChange);
    }

    handleStorageChange(event: StorageEvent) {
        console.log('Storage event detected:', event);

    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.service.model$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe((databases: PortalLuthierDatabaseModel[]) =>
            {
                this.dataSource.data = databases;
                console.log('databases', this.dataSource);
            });
        const luthierDatabase = this._userService.luthierDatabase;
        if (UtilFunctions.isValidStringOrArray(luthierDatabase) === true) {
            this.workDataBase = parseInt(luthierDatabase);
        }
        this._userService.storageChange$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe((storage: StorageChange) =>
            {
                if (storage.key === 'luthierDatabase') {
                    if (UtilFunctions.isValidStringOrArray(storage.value) === true) {
                        this.workDataBase = parseInt(storage.value);
                    }
                    else {
                        this.workDataBase = null;
                    }
                }
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        window.removeEventListener('storage', this.handleStorageChange, false);
        // Unsubscribe from all subscriptions
        this.unsubscribeAll.next(null);
        this.unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        this.dataSource.sortingDataAccessor = (item, property) => {
            if (typeof item[property] === 'string') {
                return item[property].toLowerCase(); // Normalize case
            }
            return item[property];
        };
        this.dataSource.sort = this.sort;
    }
    add() {
        const modal = this._matDialog.open(PortalLuthierDatabaseModalComponent, { disableClose: true, panelClass: 'portal-luthier-database-modal-container' });
        modal.componentInstance.title = "Base Luthier";
        modal.componentInstance.parent = this;
        modal.componentInstance.model = new PortalLuthierDatabaseModel();
    }

    refresh() {
        firstValueFrom(this.service.getAll());
    }

    update() {
        const me = this;
        setTimeout(() =>{
            me.table.renderRows();
            me._changeDetectorRef.detectChanges();
        });
    }

    edit(id) {
        const modal = this._matDialog.open(PortalLuthierDatabaseModalComponent, { disableClose: true, panelClass: 'portal-luthier-database-modal-container' });
        modal.componentInstance.title = "Base Luthier";
        modal.componentInstance.parent = this;
        modal.componentInstance.model = this.dataSource.data.filter(x => x.id === id)[0];
    }
    clone(id) {
        const modal = this._matDialog.open(PortalLuthierDatabaseModalComponent, { disableClose: true, panelClass: 'portal-luthier-database-modal-container' });
        modal.componentInstance.title = "Base Luthier";
        modal.componentInstance.parent = this;
        const model = cloneDeep(this.dataSource.data.filter(x => x.id === id)[0]);
        model.id = null;
        modal.componentInstance.model = model;
    }

    delete(id) {
        this.messageService.open('Deseja realmente remover a Base Luthier?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                const index = this.dataSource.data.findIndex(r => r.id === id);
                if (index >= 0) {
                    this.service.delete(id).then(value => {
                        this.messageService.open('Base Luthier removida com sucesso', 'SUCESSO', 'success');
                    });
                }
            }
        });
    }

    announceSortChange($event: any) {

    }

    filter(event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    check(id) {
        this._userService.luthierDatabase = id;
    }

    copy(id) {
        this.messageService.open('Deseja realmente copiar os metatados do banco de trabalho para esse banco? Todos os dados atuais desse banco serão apagados.', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                const index = this.dataSource.data.findIndex(r => r.id === id);
                if (index >= 0) {
                    this.service.copy(id).then(value => {
                        this.messageService.open('Dados copiados com sucesso', 'SUCESSO', 'success');
                    });
                }
            }
        });

    }

}
