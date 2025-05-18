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
import {PortalLicenseService} from './portal-license.service';
import {PortalLicenseModel} from '../../../../shared/models/portal-license.model';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTable, MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {DatePipe, JsonPipe} from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';
import {PortalLicenseModalComponent} from './modal/portal-license-modal.component';
import {MessageDialogService} from '../../../../shared/services/message/message-dialog-service';
import {UtilFunctions} from '../../../../shared/util/util-functions';
import {FilterPredicateUtil} from '../../../../shared/util/util-classes';
import {SharedPipeModule} from '../../../../shared/pipes/shared-pipe.module';

@Component({
    selector     : 'portal-license',
    templateUrl  : './portal-license.component.html',
    styleUrls : ['./portal-license.component.scss'],
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
        DatePipe,
        JsonPipe,
        SharedPipeModule

    ],
})
export class PortalLicenseComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatTable) table: MatTable<any>;
    public unsubscribeAll: Subject<any> = new Subject<any>();
    public dataSource = new MatTableDataSource<PortalLicenseModel>();
    displayedColumns = ['buttons', 'id', 'user.name', 'status', 'licenseType', 'since', 'until', 'allowedIPs', 'allowedMacs'];
    workDataBase: number;
    /**
     * Constructor
     */
    constructor(public service: PortalLicenseService,
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
            .subscribe((contexts: PortalLicenseModel[]) =>
            {
                this.dataSource.data = contexts;
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
        this.service.getAllAllowedUsers()
            .then(value => {
                const modal = this._matDialog.open(PortalLicenseModalComponent, { disableClose: true, panelClass: 'portal-license-modal-container' });
                modal.componentInstance.title = "Licença";
                modal.componentInstance.parent = this;
                modal.componentInstance.model = new PortalLicenseModel();
                modal.componentInstance.users = value;
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

    edit(model: PortalLicenseModel) {
        Promise.all(
            [
                this.service.get(model.id),
                this.service.getAllAllowedUsers()
            ]
        ).then(async value => {
            const modal = this._matDialog.open(PortalLicenseModalComponent, { disableClose: true, panelClass: 'portal-license-modal-container' });
            modal.componentInstance.title = "Licença";
            modal.componentInstance.parent = this;
            modal.componentInstance.model = value[0];
            modal.componentInstance.users = value[1];
        });


    }

    delete(id) {
        this.messageService.open('Deseja realmente remover a licença?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                const index = this.dataSource.data.findIndex(r => r.id === id);
                if (index >= 0) {
                    this.service.delete(id).then(value => {
                        this.messageService.open('Licença removida com sucesso', 'SUCESSO', 'success');
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

    getToken(id) {
        this.service.getToken(id).then(value => {
            this.messageService.open(`<div class="max-w-96 break-words">${value.token}</div>`, 'TOKEN', 'success');
        });
    }
}
