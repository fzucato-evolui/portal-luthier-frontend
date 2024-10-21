import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {firstValueFrom, of, Subject, takeUntil} from 'rxjs';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {
    LuthierMenuModel,
    LuthierResourceModel,
    LuthierSubsystemModel
} from '../../../../../shared/models/luthier.model';
import {LuthierService} from '../../luthier.service';
import {LuthierComponent} from '../../luthier.component';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {UtilFunctions} from '../../../../../shared/util/util-functions';
import {FilterPredicateUtil} from '../../../../../shared/util/util-classes';
import {MatSidenavModule} from '@angular/material/sidenav';
import {CdkScrollable, CdkVirtualScrollViewport, ScrollingModule} from '@angular/cdk/scrolling';
import {MatMenuModule} from '@angular/material/menu';
import {MatTreeModule} from '@angular/material/tree';
import {FuseMediaWatcherService} from '../../../../../../@fuse/services/media-watcher';
import {MatTabGroup, MatTabsModule} from '@angular/material/tabs';
import {LuthierManagerMenuModalComponent} from '../menu/modal/luthier-manager-menu-modal.component';
import {LuthierSubsystemModalComponent} from '../../subsystem/modal/luthier-subsystem-modal.component';

@Component({
    selector     : 'luthier-manager-menutree',
    templateUrl  : './luthier-manager-menutree.component.html',
    styleUrls : ['./luthier-manager-menutree.component.scss'],
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
        NgForOf,
        DatePipe,
        MatSidenavModule,
        CdkScrollable,
        MatMenuModule,
        ScrollingModule,
        MatTreeModule,
        MatTabsModule

    ],
})
export class LuthierManagerMenutreeComponent implements OnInit, OnDestroy, AfterViewInit
{
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    public resources: Array<LuthierResourceModel> = [];
    @ViewChild(CdkVirtualScrollViewport, { static: false })
    cdkVirtualScrollViewPort: CdkVirtualScrollViewport;
    @ViewChild('sortMenu') sortMenu: MatSort;
    @ViewChild('sortSubsystem') sortSubsystem: MatSort;
    @ViewChild('menuTreeTab', { static: false }) menuTreeTab: MatTabGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public datasourceMenu = new MatTableDataSource<LuthierMenuModel>();
    displayedMenuColumns = ['buttons', 'code', 'caption', 'visibility', 'lockBy.name'];

    public datasourceSubsystem = new MatTableDataSource<LuthierSubsystemModel>();
    displayedSubsystemColumns = ['buttons', 'code', 'description', 'status', 'plataform'];

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
                private _fuseMediaWatcherService: FuseMediaWatcherService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _messageService: MessageDialogService,
                private _matDialog: MatDialog)
    {
    }

    ngOnInit(): void
    {
        this.service.menus$.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                this.datasourceMenu.data = value;
            });
        this.service.subsystems$.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                this.datasourceSubsystem.data = value;
            });
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) =>
            {
                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }
                this._changeDetectorRef.markForCheck();
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
        UtilFunctions.setSortingDataAccessor(this.datasourceMenu);
        const filterPredicateMenu = FilterPredicateUtil.withColumns(this.displayedMenuColumns);
        this.datasourceMenu.filterPredicate = filterPredicateMenu.instance.bind(filterPredicateMenu);
        this.datasourceMenu.sort = this.sortMenu;

        UtilFunctions.setSortingDataAccessor(this.datasourceSubsystem);
        const filterPredicateSubsystem = FilterPredicateUtil.withColumns(this.displayedSubsystemColumns);
        this.datasourceSubsystem.filterPredicate = filterPredicateSubsystem.instance.bind(filterPredicateSubsystem);
        this.datasourceSubsystem.sort = this.sortSubsystem;
    }

    refreshMenu() {
        firstValueFrom(this._parent.service.getMenus());
    }
    refreshSubsystem() {
        firstValueFrom(this._parent.service.getSubsystems());
    }

    addMenu() {
        Promise.all(
            [
                firstValueFrom(this.service.checkUser()),
                UtilFunctions.isValidStringOrArray(this.resources) === false ? firstValueFrom(this.service.getResources(true)) : firstValueFrom(of(this.resources))
            ]
        ).then(async value => {
            const modal = this._matDialog.open(LuthierManagerMenuModalComponent, { disableClose: true, panelClass: 'luthier-manager-menu-modal-container' });
            modal.componentInstance.title = "Menu Luthier";
            modal.componentInstance.parent = this;
            modal.componentInstance.model = new LuthierMenuModel();
            modal.componentInstance.myUser = value[0];
            modal.componentInstance.resources = value[1];

        });

    }

    editMenu(code) {
        Promise.all(
            [
                    this.service.getMenu(code),
                    firstValueFrom(this.service.checkUser()),
                    UtilFunctions.isValidStringOrArray(this.resources) === false ? firstValueFrom(this.service.getResources(true)) : firstValueFrom(of(this.resources))
                ]
        ).then(async value => {
                const modal = this._matDialog.open(LuthierManagerMenuModalComponent, { disableClose: true, panelClass: 'luthier-manager-menu-modal-container' });
                modal.componentInstance.title = "Menu Luthier";
                modal.componentInstance.parent = this;
                modal.componentInstance.model = value[0];
                modal.componentInstance.myUser = value[1];
                modal.componentInstance.resources = value[2];

            });
    }

    deleteMenu(code) {
        this._messageService.open('Tem certeza de que deseja remover o menu?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                this.service.deleteMenu(code)
                    .then(result => {
                        this._messageService.open('Menu removido com sucesso', 'SUCESSO', 'success');
                    })

            }
        });
    }

    addSubsystem() {
        Promise.all(
            [
                UtilFunctions.isValidStringOrArray(this.resources) === false ? firstValueFrom(this.service.getResources(true)) : firstValueFrom(of(this.resources))
            ]
        ).then(async value => {
            const modal = this._matDialog.open(LuthierSubsystemModalComponent, { disableClose: true, panelClass: 'luthier-subsystem-modal-container' });
            modal.componentInstance.title = "Subsistema Luthier";
            modal.componentInstance.parent = this;
            modal.componentInstance.model = new LuthierSubsystemModel();
            modal.componentInstance.resources = value[0];
        });

    }

    editSubsystem(id) {
        Promise.all(
            [
                this.service.getSubsystem(id),
                UtilFunctions.isValidStringOrArray(this.resources) === false ? firstValueFrom(this.service.getResources(true)) : firstValueFrom(of(this.resources))
            ]
        ).then(async value => {
            const modal = this._matDialog.open(LuthierSubsystemModalComponent, { disableClose: true, panelClass: 'luthier-subsystem-modal-container' });
            modal.componentInstance.title = "Subsistema Luthier";
            modal.componentInstance.parent = this;
            modal.componentInstance.model = value[0],
            modal.componentInstance.resources = value[1];
        });
    }

    deleteSubsystem(id) {
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

    filterMenu(event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.datasourceMenu.filter = filterValue.trim().toLowerCase();
    }

    filterSubsystem(event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.datasourceSubsystem.filter = filterValue.trim().toLowerCase();
    }

    openedNav() {
        this.refreshScroll();
    }

    refreshScroll() {
        if (this.cdkVirtualScrollViewPort) {
            this._changeDetectorRef.detectChanges();
            setTimeout(() => {
                this.cdkVirtualScrollViewPort.checkViewportSize();
                this._changeDetectorRef.detectChanges();
            }, 100);
        }
    }

    onSubsystemRowClicked(row: LuthierSubsystemModel, event: MouseEvent) {
        const clickedElement = event.target as HTMLElement;

        if (clickedElement.tagName === 'TD') {
            const cellIndex = clickedElement['cellIndex'];
            if (cellIndex != 0) {
                this.menuTreeTab.selectedIndex = this.datasourceSubsystem.filteredData.findIndex(x => x.code === row.code);
            }
        }
    }


}
