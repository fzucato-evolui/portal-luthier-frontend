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
import {MatTable, MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {LuthierManagerSemaphoreModalComponent} from './modal/luthier-manager-semaphore-modal.component';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {LuthierSemaphoreModel} from '../../../../../shared/models/luthier.model';
import {LuthierService} from '../../luthier.service';
import {LuthierComponent} from '../../luthier.component';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {UtilFunctions} from '../../../../../shared/util/util-functions';
import {FilterPredicateUtil} from '../../../../../shared/util/util-classes';
import {SharedPipeModule} from '../../../../../shared/pipes/shared-pipe.module';

@Component({
    selector     : 'luthier-manager-semaphore',
    templateUrl  : './luthier-manager-semaphore.component.html',
    styleUrls : ['./luthier-manager-semaphore.component.scss'],
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
        SharedPipeModule
    ],
})
export class LuthierManagerSemaphoreComponent implements OnInit, OnDestroy, AfterViewInit
{

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatTable) table: MatTable<any>;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public datasource = new MatTableDataSource<LuthierSemaphoreModel>();
    displayedColumns = ['buttons', 'code', 'name', 'description', 'behavior', 'currentValue', 'initialValue', 'valueType', 'timeout', 'mask'];

    get service(): LuthierService {
        if (this._parent != null) {
            return this._parent.service;
        }
        return null;
    }
    /**
     * Constructor
     */
    constructor(public _parent: LuthierComponent,
                private _changeDetectorRef: ChangeDetectorRef,
                private _messageService: MessageDialogService,
                private _matDialog: MatDialog)
    {
    }

    ngOnInit(): void
    {
        this.service.semaphores$.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                this.datasource.data = value;
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
        UtilFunctions.setSortingDataAccessor(this.datasource);
        const filterPredicateSearchs = FilterPredicateUtil.withColumns(this.displayedColumns);
        this.datasource.filterPredicate = filterPredicateSearchs.instance.bind(filterPredicateSearchs);
        this.datasource.sort = this.sort;
    }
    add() {
        firstValueFrom(this.service.getUsers()).then(users => {
            const modal = this._matDialog.open(LuthierManagerSemaphoreModalComponent, { disableClose: true, panelClass: 'luthier-manager-semaphore-modal-container' });
            modal.componentInstance.title = "Semáforo Luthier";
            modal.componentInstance.parent = this;
            modal.componentInstance.model = new LuthierSemaphoreModel();
            modal.componentInstance.users = users;
        })

    }

    refresh() {
        firstValueFrom(this._parent.service.getSemaphores());
    }

    update() {
        const me = this;
        setTimeout(() =>{
            me.table.renderRows();
            me._changeDetectorRef.detectChanges();
        });
    }

    edit(code) {
        Promise.all(
            [
                    this.service.getSemaphore(code),
                    firstValueFrom(this.service.getUsers())
                ]
        ).then(async value => {
                const modal = this._matDialog.open(LuthierManagerSemaphoreModalComponent, { disableClose: true, panelClass: 'luthier-manager-semaphore-modal-container' });
                modal.componentInstance.title = "Semáforo Luthier";
                modal.componentInstance.parent = this;
                modal.componentInstance.model = value[0];
                modal.componentInstance.users = value[1];
            });
    }

    delete(code) {
        this._messageService.open('Tem certeza de que deseja remover o semáforo?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                this.service.deleteSemaphore(code)
                    .then(result => {
                        this._messageService.open('Semáforo removido com sucesso', 'SUCESSO', 'success');
                    })

            }
        });
    }

    announceSortChange($event: any) {

    }

    filter(event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.datasource.filter = filterValue.trim().toLowerCase();
    }

}
