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
import {LuthierConnectionModalComponent} from './modal/luthier-connection-modal.component';
import {LuthierDatabaseModel} from '../../../../shared/models/luthier.model';
import {LuthierComponent} from '../luthier.component';
import {LuthierService} from '../luthier.service';

@Component({
    selector     : 'luthier-connection',
    templateUrl  : './luthier-connection.component.html',
    styleUrls : ['./luthier-connection.component.scss'],
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
export class LuthierConnectionComponent implements OnInit, OnDestroy, AfterViewInit
{

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatTable) table: MatTable<any>;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public databases = new MatTableDataSource<LuthierDatabaseModel>();
    displayedColumns = ['buttons', 'code', 'server', 'dbType', 'database', 'user'];
    get workDataBase(): number {
        return this._parent.workDataBase;
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
                private _matDialog: MatDialog)
    {
    }

    ngOnInit(): void
    {
        this._parent.service.databases$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((databases: LuthierDatabaseModel[]) =>
            {
                this.databases.data = databases;
            });
        this._parent.workDataBase$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((workDataBase: number) =>
            {
                setTimeout(() => {
                    this._changeDetectorRef.detectChanges();
                }, 0);
            });

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        this.databases.sort = this.sort;
    }
    add() {
        const modal = this._matDialog.open(LuthierConnectionModalComponent, { disableClose: true, panelClass: 'portal-luthier-database-modal-container' });
        modal.componentInstance.title = "Base de Dados do Produto";
        modal.componentInstance.parent = this;
        modal.componentInstance.model = new LuthierDatabaseModel();
    }

    refresh() {
        firstValueFrom(this._parent.service.getDatabases());
    }

    update() {
        const me = this;
        setTimeout(() =>{
            me.table.renderRows();
            me._changeDetectorRef.detectChanges();
        });
    }

    edit(id) {
        const modal = this._matDialog.open(LuthierConnectionModalComponent, { disableClose: true, panelClass: 'luthier-connection-modal-container' });
        modal.componentInstance.title = "Base de Dados do Produto";
        modal.componentInstance.parent = this;
        modal.componentInstance.model = this.databases.data.filter(x => x.code === id)[0];
    }

    delete(id) {

    }

    announceSortChange($event: any) {

    }

    filter(event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.databases.filter = filterValue.trim().toLowerCase();
    }

    check(id) {
        this._parent.workDataBase = id;
    }
}
