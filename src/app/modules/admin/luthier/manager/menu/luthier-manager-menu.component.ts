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
import {LuthierManagerMenuModalComponent} from './modal/luthier-manager-menu-modal.component';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {LuthierMenuModel, LuthierResourceModel} from '../../../../../shared/models/luthier.model';
import {LuthierService} from '../../luthier.service';
import {LuthierComponent} from '../../luthier.component';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {UtilFunctions} from '../../../../../shared/util/util-functions';
import {FilterPredicateUtil} from '../../../../../shared/util/util-classes';

@Component({
    selector     : 'luthier-manager-menu',
    templateUrl  : './luthier-manager-menu.component.html',
    styleUrls : ['./luthier-manager-menu.component.scss'],
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
export class LuthierManagerMenuComponent implements OnInit, OnDestroy, AfterViewInit
{

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatTable) table: MatTable<any>;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public datasource = new MatTableDataSource<LuthierMenuModel>();
    displayedColumns = ['buttons', 'code', 'caption', 'custom', 'compType', 'type', 'visibility', 'resource', 'lockBy.name'];
    public resources: Array<LuthierResourceModel> = [];

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
        this.service.menus$.pipe(takeUntil(this._unsubscribeAll))
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
        firstValueFrom(this.service.checkUser()).then(user => {
            const modal = this._matDialog.open(LuthierManagerMenuModalComponent, { disableClose: true, panelClass: 'luthier-manager-menu-modal-container' });
            modal.componentInstance.title = "Menu Luthier";
            modal.componentInstance.parent = this;
            modal.componentInstance.model = new LuthierMenuModel();
            modal.componentInstance.myUser = user;
            modal.componentInstance.resources = this.resources;
        })

    }

    refresh() {
        firstValueFrom(this._parent.service.getMenus());
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
                    this.service.getMenu(code),
                    firstValueFrom(this.service.checkUser())
                ]
        ).then(async value => {
                const modal = this._matDialog.open(LuthierManagerMenuModalComponent, { disableClose: true, panelClass: 'luthier-manager-menu-modal-container' });
                modal.componentInstance.title = "Menu Luthier";
                modal.componentInstance.parent = this;
                modal.componentInstance.model = value[0];
                modal.componentInstance.myUser = value[1];
                modal.componentInstance.resources = this.resources;
            });
    }

    delete(code) {
        this._messageService.open('Tem certeza de que deseja remover o menu?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                this.service.deleteMenu(code)
                    .then(result => {
                        this._messageService.open('Menu removido com sucesso', 'SUCESSO', 'success');
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
        if (UtilFunctions.isValidObject(value) === true) {
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
