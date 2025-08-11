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
import {PortalLuthierContextService} from './portal-luthier-context.service';
import {PortalLuthierContextModel} from '../../../../shared/models/portal-luthier-context.model';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTable, MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {MatTooltipModule} from '@angular/material/tooltip';
import {PortalLuthierContextModalComponent} from './modal/portal-luthier-context-modal.component';
import {MessageDialogService} from '../../../../shared/services/message/message-dialog-service';
import {UtilFunctions} from '../../../../shared/util/util-functions';
import {FilterPredicateUtil} from '../../../../shared/util/util-classes';
import {SharedPipeModule} from '../../../../shared/pipes/shared-pipe.module';

@Component({
    selector     : 'portal-luthier-context',
    templateUrl  : './portal-luthier-context.component.html',
    styleUrls : ['./portal-luthier-context.component.scss'],
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
export class PortalLuthierContextComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatTable) table: MatTable<any>;
    public unsubscribeAll: Subject<any> = new Subject<any>();
    public dataSource = new MatTableDataSource<PortalLuthierContextModel>();
    displayedColumns = ['buttons', 'id', 'context', 'description', 'luthierDatabase.identifier', 'databaseType', 'debugDataBase'];
    workDataBase: number;
    /**
     * Constructor
     */
    constructor(public service: PortalLuthierContextService,
                public messageService: MessageDialogService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _matDialog: MatDialog)

    {
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
            .subscribe((contexts: PortalLuthierContextModel[]) =>
            {
                this.dataSource.data = contexts;
                console.log('contexts', this.dataSource);
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
        UtilFunctions.setSortingDataAccessor(this.dataSource);
        const filterPredicateMenu = FilterPredicateUtil.withColumns(this.displayedColumns);
        this.dataSource.filterPredicate = filterPredicateMenu.instance.bind(filterPredicateMenu);
        this.dataSource.sort = this.sort;
    }
    add() {
        Promise.all(
            [
                this.service.getAllLuthierDatabases(),
                this.service.getAllRootStorages(),
            ]
        ).then(async value => {
            const modal = this._matDialog.open(PortalLuthierContextModalComponent, { disableClose: true, panelClass: 'portal-luthier-context-modal-container' });
            modal.componentInstance.title = "Luthier Context";
            modal.componentInstance.parent = this;
            modal.componentInstance.model = new PortalLuthierContextModel();
            modal.componentInstance.luthierDatabases = value[0];
            modal.componentInstance.rootStorages = value[1];
        });
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

    edit(model: PortalLuthierContextModel) {
        Promise.all(
            [
                this.service.get(model.id),
                this.service.getAllDatabases(model.luthierDatabase.id),
                this.service.getAllLuthierDatabases(),
                this.service.getAllRootStorages(),
            ]
        ).then(async value => {
            const modal = this._matDialog.open(PortalLuthierContextModalComponent, { disableClose: true, panelClass: 'portal-luthier-context-modal-container' });
            modal.componentInstance.title = "Luthier Context";
            modal.componentInstance.parent = this;
            modal.componentInstance.model = value[0];
            modal.componentInstance.databases = value[1];
            modal.componentInstance.luthierDatabases = value[2];
            modal.componentInstance.rootStorages = value[3];
        });


    }

    delete(id) {
        this.messageService.open('Deseja realmente remover a cofiguração de contexto?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                const index = this.dataSource.data.findIndex(r => r.id === id);
                if (index >= 0) {
                    this.service.delete(id).then(value => {
                        this.messageService.open('Configuração de contexto removida com sucesso', 'SUCESSO', 'success');
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
}
