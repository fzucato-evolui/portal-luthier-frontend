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
import {LuthierModuleModalComponent} from './modal/luthier-module-modal.component';
import {LuthierDatabaseModel, LuthierModuleModel} from '../../../../shared/models/luthier.model';
import {LuthierComponent} from '../luthier.component';
import {LuthierService} from '../luthier.service';
import {MessageDialogService} from '../../../../shared/services/message/message-dialog-service';

@Component({
    selector     : 'luthier-module',
    templateUrl  : './luthier-module.component.html',
    styleUrls : ['./luthier-module.component.scss'],
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
export class LuthierModuleComponent implements OnInit, OnDestroy, AfterViewInit
{

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatTable) table: MatTable<any>;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public datasource = new MatTableDataSource<LuthierModuleModel>();
    displayedColumns = ['buttons', 'code', 'name', 'description', 'parent.name'];
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
        this.service.modules$.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                this.datasource.data = value;
            })


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
        this.datasource.sort = this.sort;
    }
    add() {
        const modal = this._matDialog.open(LuthierModuleModalComponent, { disableClose: true, panelClass: 'luthier-module-modal-container' });
        modal.componentInstance.title = "Módulo Luthier";
        modal.componentInstance.parent = this;
        modal.componentInstance.model = new LuthierDatabaseModel();
        modal.componentInstance.possibleParents = this.datasource.data;
    }

    refresh() {
        firstValueFrom(this._parent.service.getModules());
    }

    update() {
        const me = this;
        setTimeout(() =>{
            me.table.renderRows();
            me._changeDetectorRef.detectChanges();
        });
    }

    edit(id) {
        this.service.getModule(id)
            .then(result => {
                const modal = this._matDialog.open(LuthierModuleModalComponent, { disableClose: true, panelClass: 'luthier-module-modal-container' });
                modal.componentInstance.title = "Módulo Luthier";
                modal.componentInstance.parent = this;
                modal.componentInstance.model = result;
                modal.componentInstance.possibleParents = this.datasource.data.filter(x => x.parent?.code !== id && x.code !== id);
            })
    }

    delete(id) {
        this._messageService.open('Tem certeza de que deseja remover o módulo?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                this.service.deleteModule(id)
                    .then(result => {
                        this._messageService.open('Módulo removido com sucesso', 'SUCESSO', 'success');
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
