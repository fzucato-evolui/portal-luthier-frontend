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
import {NgIf} from '@angular/common';
import {LuthierSubsystemModalComponent} from './modal/luthier-subsystem-modal.component';
import {LuthierResourceModel, LuthierSubsystemModel} from '../../../../shared/models/luthier.model';
import {LuthierComponent} from '../luthier.component';
import {LuthierService} from '../luthier.service';
import {MessageDialogService} from '../../../../shared/services/message/message-dialog-service';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {UtilFunctions} from '../../../../shared/util/util-functions';
import {FilterPredicateUtil} from '../../../../shared/util/util-classes';
import {SharedPipeModule} from 'app/shared/pipes/shared-pipe.module';

@Component({
    selector     : 'luthier-subsystem',
    templateUrl  : './luthier-subsystem.component.html',
    styleUrls : ['./luthier-subsystem.component.scss'],
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
        NgIf,
        SharedPipeModule
    ],
})
export class LuthierSubsystemComponent implements OnInit, OnDestroy, AfterViewInit
{

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatTable) table: MatTable<any>;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public resources: Array<LuthierResourceModel> = [];
    public datasource = new MatTableDataSource<LuthierSubsystemModel>();
    displayedColumns = ['buttons', 'code', 'description', 'status', 'plataform', 'resource'];
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
                private _messageService: MessageDialogService,
                private _matDialog: MatDialog)
    {
    }

    ngOnInit(): void
    {
        this.service.subsystems$.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                this.datasource.data = value;
            });

        this.service.resources$.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                this.resources = value;
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
        const modal = this._matDialog.open(LuthierSubsystemModalComponent, { disableClose: true, panelClass: 'luthier-subsystem-modal-container' });
        modal.componentInstance.title = "Subsistema Luthier";
        modal.componentInstance.parent = this;
        modal.componentInstance.model = new LuthierSubsystemModel();
        modal.componentInstance.resources = this.resources;
    }

    refresh() {
        firstValueFrom(this._parent.service.getSubsystems());
    }

    update() {
        const me = this;
        setTimeout(() =>{
            me.table.renderRows();
            me._changeDetectorRef.detectChanges();
        });
    }

    edit(id) {
        this.service.getSubsystem(id)
            .then(result => {
                const modal = this._matDialog.open(LuthierSubsystemModalComponent, { disableClose: true, panelClass: 'luthier-subsystem-modal-container' });
                modal.componentInstance.title = "Subsistema Luthier";
                modal.componentInstance.parent = this;
                modal.componentInstance.model = result;
                modal.componentInstance.resources = this.resources;
            })
    }

    delete(id) {
        this._messageService.open('Tem certeza de que deseja remover o subsistema?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                this.service.deleteSubsystem(id)
                    .then(result => {
                        this._messageService.open('Subsistema removido com sucesso', 'SUCESSO', 'success');
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

    getSeletctedImage(value: any): string {
        if (UtilFunctions.isValidObject(value) === true && UtilFunctions.isValidStringOrArray(this.resources) === true) {
            const code = value.code;
            if (UtilFunctions.isValidStringOrArray(code) === true) {
                const index = this.resources.findIndex(x => x.code === code);
                if (index >= 0) {
                    return this.resources[index].file;
                }
            }
        }
        return null;

    }

}
