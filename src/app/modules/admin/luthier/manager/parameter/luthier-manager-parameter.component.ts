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
import {DatePipe, NgClass, NgIf} from '@angular/common';
import {LuthierManagerParameterModalComponent} from './modal/luthier-manager-parameter-modal.component';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {LuthierParameterModel} from '../../../../../shared/models/luthier.model';
import {LuthierService} from '../../luthier.service';
import {LuthierComponent} from '../../luthier.component';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {UtilFunctions} from '../../../../../shared/util/util-functions';
import {FilterPredicateUtil} from '../../../../../shared/util/util-classes';

@Component({
    selector     : 'luthier-manager-parameter',
    templateUrl  : './luthier-manager-parameter.component.html',
    styleUrls : ['./luthier-manager-parameter.component.scss'],
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
        NgIf,
        DatePipe

    ],
})
export class LuthierManagerParameterComponent implements OnInit, OnDestroy, AfterViewInit
{

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatTable) table: MatTable<any>;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public datasource = new MatTableDataSource<LuthierParameterModel>();
    displayedColumns = ['buttons', 'name', 'user.name', 'creationDate', 'description'];

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
        this.service.parameters$.pipe(takeUntil(this._unsubscribeAll))
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
            const modal = this._matDialog.open(LuthierManagerParameterModalComponent, { disableClose: true, panelClass: 'luthier-manager-parameter-modal-container' });
            modal.componentInstance.title = "Parâmetro Luthier";
            modal.componentInstance.parent = this;
            modal.componentInstance.model = new LuthierParameterModel();
            modal.componentInstance.users = users;
        })

    }

    refresh() {
        firstValueFrom(this._parent.service.getParameters());
    }

    update() {
        const me = this;
        setTimeout(() =>{
            me.table.renderRows();
            me._changeDetectorRef.detectChanges();
        });
    }

    edit(name) {
        Promise.all(
            [
                    this.service.getParameter(name),
                    firstValueFrom(this.service.getUsers())
                ]
        ).then(async value => {
                const modal = this._matDialog.open(LuthierManagerParameterModalComponent, { disableClose: true, panelClass: 'luthier-manager-parameter-modal-container' });
                modal.componentInstance.title = "Parâmetro Luthier";
                modal.componentInstance.parent = this;
                modal.componentInstance.model = value[0];
                modal.componentInstance.users = value[1];
            });
    }

    delete(name) {
        this._messageService.open('Tem certeza de que deseja remover o parâmetro?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                this.service.deleteParameter(name)
                    .then(result => {
                        this._messageService.open('Parâmetro removido com sucesso', 'SUCESSO', 'success');
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
