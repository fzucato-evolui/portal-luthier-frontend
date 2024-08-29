import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {Subject} from 'rxjs';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTable, MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {NgClass, NgIf} from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';
import {LuthierResourceModalComponent} from './modal/luthier-resource-modal.component';
import {LuthierDatabaseModel, LuthierResourceModel} from '../../../../shared/models/luthier.model';
import {LuthierComponent} from '../luthier.component';
import {LuthierService} from '../luthier.service';
import {MessageDialogService} from '../../../../shared/services/message/message-dialog-service';

@Component({
    selector     : 'luthier-resource',
    templateUrl  : './luthier-resource.component.html',
    styleUrls : ['./luthier-resource.component.scss'],
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
export class LuthierResourceComponent implements OnInit, OnDestroy, AfterViewInit
{

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatTable) table: MatTable<any>;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public datasource = new MatTableDataSource<LuthierResourceModel>();
    displayedColumns = ['buttons', 'code', 'name', 'identifier', 'resourceType', 'description', 'height', 'width'];
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
        const modal = this._matDialog.open(LuthierResourceModalComponent, { disableClose: true, panelClass: 'portal-luthier-database-modal-container' });
        modal.componentInstance.title = "Base de Dados do Produto";
        modal.componentInstance.parent = this;
        modal.componentInstance.model = new LuthierDatabaseModel();
    }

    refresh() {
        this._parent.service.getResources().then(value => {
            this.datasource.data = value;
            this._changeDetectorRef.detectChanges();
        });
    }

    update() {
        const me = this;
        setTimeout(() =>{
            me.table.renderRows();
            me._changeDetectorRef.detectChanges();
        });
    }

    edit(id) {
        this.service.getResource(id)
            .then(result => {
                const modal = this._matDialog.open(LuthierResourceModalComponent, { disableClose: true, panelClass: 'luthier-connection-modal-container' });
                modal.componentInstance.title = "Base de Dados do Produto";
                modal.componentInstance.parent = this;
                //modal.componentInstance.model = this.datasource.data.filter(x => x.code === id)[0];
            })
    }

    delete(id) {
        this._messageService.open('Tem certeza de que deseja remover o recurso?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                this.service.deleteResource(id)
                    .then(result => {
                        this._messageService.open('Recurso removido com sucesso', 'SUCESSO', 'success');
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

    check(id) {
        this._parent.workDataBase = id;
    }
}
