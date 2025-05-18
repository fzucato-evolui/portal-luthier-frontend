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
import {NgClass, NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {
    LuthierCustomMenuTreeModel,
    LuthierItemMenuTreeModel,
    LuthierItemMenuTreeTypeEnum,
    LuthierMenuDetailModel,
    LuthierMenuModel,
    LuthierMenuTreeModel,
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
import {MatTreeModule, MatTreeNestedDataSource} from '@angular/material/tree';
import {FuseMediaWatcherService} from '../../../../../../@fuse/services/media-watcher';
import {MatTabsModule} from '@angular/material/tabs';
import {LuthierManagerMenuModalComponent} from '../menu/modal/luthier-manager-menu-modal.component';
import {LuthierSubsystemModalComponent} from '../../subsystem/modal/luthier-subsystem-modal.component';
import {cloneDeep} from 'lodash-es';
import {NestedTreeControl} from '@angular/cdk/tree';
import {PortalHistoryPersistTypeEnum} from '../../../../../shared/models/portal_luthier_history.model';
import {LuthierManagerObjectType} from '../luthier-manager.component';
import {SharedPipeModule} from 'app/shared/pipes/shared-pipe.module';

export class DragItemDataTransfer {
    type: LuthierManagerObjectType
    data: LuthierMenuModel | LuthierItemMenuTreeModel
}
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
        MatSidenavModule,
        CdkScrollable,
        MatMenuModule,
        ScrollingModule,
        MatTreeModule,
        MatTabsModule,
        SharedPipeModule

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
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public datasourceMenu = new MatTableDataSource<LuthierMenuModel>();
    displayedMenuColumns = ['buttons', 'code', 'caption', 'visibility', 'lockBy.name', 'custom'];

    public datasourceSubsystem = new MatTableDataSource<LuthierSubsystemModel>();
    displayedSubsystemColumns = ['buttons', 'code', 'description', 'status', 'plataform'];

    public treeControl = new NestedTreeControl<LuthierItemMenuTreeModel>(node => node.children);
    public dataSourceTree = new MatTreeNestedDataSource<LuthierItemMenuTreeModel>();

    private _model: LuthierMenuTreeModel;
    private _cloneModel: LuthierMenuTreeModel;
    incKey: number = 0;
    LuthierItemMenuTreeTypeEnum = LuthierItemMenuTreeTypeEnum;
    set model(value: LuthierMenuTreeModel) {
        this._model = value;
        this._cloneModel = cloneDeep(this._model);
        if (value) {
            this.dataSourceTree.data = this._cloneModel.tree;
        }
        else {
            this.dataSourceTree.data = [];
        }
    }
    get model(): LuthierMenuTreeModel {
        return this._cloneModel;
    }

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
        this.service.menuChanged$.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                if (this.model && UtilFunctions.isValidStringOrArray(this.model.tree) === true) {
                    this.model.tree.forEach(x => this.changeMenu(
                            x,
                            null,
                            value.menu,
                            value.persistType === PortalHistoryPersistTypeEnum.DELETE
                        )
                    );
                    this.dataSourceTree.data = null;
                    this.dataSourceTree.data = this._cloneModel.tree;
                    this._changeDetectorRef.detectChanges();
                }
            });
        this.service.subsystems$.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                this.datasourceSubsystem.data = value;
            });
        this.service.subsystemChanged$.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                if (this.model && UtilFunctions.isValidStringOrArray(this.model.tree) === true) {
                    let index = this.model.tree.findIndex(x => x.code === value.subsystem.code);
                    if (index >= 0) {
                        if (value.persistType === PortalHistoryPersistTypeEnum.DELETE) {
                            this.model.tree.splice(index, 1);
                            this.model.subsystems = this.model.subsystems.filter(x => x.code !== value.subsystem.code);
                            this.model.menus = this.model.menus.filter(x => x.subsystem.code !== value.subsystem.code);
                            this.model.customMenus = this.model.customMenus.filter(x => x.subsystemCode !== value.subsystem.code);
                        }
                        else {
                            this.model.tree[index].caption = value.subsystem.description;
                        }
                    }
                    else {
                        const model = value.subsystem;
                        this.model.subsystems.push(model);
                        const newMenu = new LuthierItemMenuTreeModel();
                        newMenu.code = model.code;
                        newMenu.caption = model.description;
                        newMenu.type = LuthierItemMenuTreeTypeEnum.SUBSYSTEM;
                        newMenu.order = 1;
                        newMenu.key = null;
                        this.model.tree.push(newMenu);
                    }

                    this.dataSourceTree.data = null;
                    this.dataSourceTree.data = this._cloneModel.tree;
                    this._changeDetectorRef.detectChanges();
                }
            });
        this.service.menuTree$.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                this.model = value;
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

    hasChild = (_: number, node: LuthierItemMenuTreeModel) => !!node.children && node.children.length > 0;

    removeMenu(menu: LuthierItemMenuTreeModel) {
        try {
            const rootNodeIndex = this._cloneModel.tree.findIndex(x => x.code === menu.subsystemCode);
            const parentNode = this.getParentNode(menu, this._cloneModel.tree[rootNodeIndex]);
            if (parentNode !== null) {
                this.deleteAllMenuInheritance(menu, true);
                parentNode.parent.children.splice(parentNode.nodeIndex, 1); // Remove the node
                if (menu.last) {
                    if (parentNode.nodeIndex > 0) {
                        parentNode.parent.children[parentNode.nodeIndex - 1].last = true;
                    }
                } else {
                    if (parentNode.parent.children.length > 0) {
                        for (let i = 0; i < parentNode.parent.children.length; i++) {
                            const child = parentNode.parent.children[i];
                            child.order = i + 1;
                            this.setMenuOrder(child, parentNode.parent);
                        }
                    }
                }
                this.dataSourceTree.data = null;
                this.dataSourceTree.data = this._cloneModel.tree;
            }
            this._changeDetectorRef.detectChanges();
        }
        catch (e) {
            console.error(e);
            this._messageService.open(e, "ERRO", 'error');
        }
    }

    cloneMenu(menu: LuthierItemMenuTreeModel) {
        try {
            const rootNodeIndex = this._cloneModel.tree.findIndex(x => x.code === menu.subsystemCode);
            const parentNode = this.getParentNode(menu, this._cloneModel.tree[rootNodeIndex]);
            if (parentNode !== null) {
                this.incKey = 0;
                this.cloneAllMenuInheritance(menu, parentNode.parent, true, parentNode.nodeIndex);
                this.dataSourceTree.data = null;
                this.dataSourceTree.data = this._cloneModel.tree;
            }
            this._changeDetectorRef.detectChanges();
        }
        catch (e) {
            console.error(e);
            this._messageService.open(e, "ERRO", 'error');
        }
    }
    moveMenuDown(menu: LuthierItemMenuTreeModel) {
        try {
            const rootNodeIndex = this._cloneModel.tree.findIndex(x => x.code === menu.subsystemCode);
            const parentNode = this.getParentNode(menu, this._cloneModel.tree[rootNodeIndex]);
            if (parentNode !== null) {
                const afterMenu = parentNode.parent.children[parentNode.nodeIndex + 1];
                menu.order = parentNode.nodeIndex + 1;
                afterMenu.order = parentNode.nodeIndex;
                if (afterMenu.last) {
                    menu.last = true;
                }
                this.switchPositions(parentNode.parent.children, parentNode.nodeIndex, parentNode.nodeIndex + 1);
                this.setMenuOrder(menu, parentNode.parent);
                this.setMenuOrder(afterMenu, parentNode.parent);
                this.dataSourceTree.data = null;
                this.dataSourceTree.data = this._cloneModel.tree;
            }
            this._changeDetectorRef.detectChanges();
        }
        catch (e) {
            console.error(e);
            this._messageService.open(e, "ERRO", 'error');
        }
    }
    moveMenuUp(menu: LuthierItemMenuTreeModel) {
        try {
            const rootNodeIndex = this._cloneModel.tree.findIndex(x => x.code === menu.subsystemCode);
            const parentNode = this.getParentNode(menu, this._cloneModel.tree[rootNodeIndex]);
            if (parentNode !== null) {
                const beforeMenu = parentNode.parent.children[parentNode.nodeIndex - 1];
                menu.order = parentNode.nodeIndex - 1;
                beforeMenu.order = parentNode.nodeIndex;
                if (menu.last) {
                    beforeMenu.last = true;
                }
                this.switchPositions(parentNode.parent.children, parentNode.nodeIndex - 1, parentNode.nodeIndex);
                this.setMenuOrder(menu, parentNode.parent);
                this.setMenuOrder(beforeMenu, parentNode.parent);
                this.dataSourceTree.data = null;
                this.dataSourceTree.data = this._cloneModel.tree;
            }
            this._changeDetectorRef.detectChanges();
        }
        catch (e) {
            console.error(e);
            this._messageService.open(e, "ERRO", 'error');
        }
    }
    getParentNode(node: LuthierItemMenuTreeModel, parentNode: LuthierItemMenuTreeModel): {parent: LuthierItemMenuTreeModel, nodeIndex: number}  {
        if (UtilFunctions.isValidStringOrArray(parentNode.children) === false) {
            parentNode.children = [];
        }
        const index = parentNode.children.findIndex(child => child.code === node.code && child.id === node.id && child.type === node.type);
        if (index !== -1) {
            return {parent: parentNode, nodeIndex: index};
        }
        else if (UtilFunctions.isValidStringOrArray(parentNode.children) === true) {
            for(const child of parentNode.children) {
                const ret = this.getParentNode(node, child);
                if (ret !== null) {
                    return ret;
                }
            }
        }
        return null;
    }

    deleteAllMenuInheritance(menu: LuthierItemMenuTreeModel, needPersist: boolean) {
        if (menu.type === LuthierItemMenuTreeTypeEnum.SYSTEM_MENU) {
            const index = this.model.menus.findIndex(x => x.code === menu.code && x.id === menu.id);
            if (index >= 0) {
                const model = this._cloneModel.menus[index];
                if (UtilFunctions.isValidStringOrArray(model.code) && needPersist) {
                    model.persistType = PortalHistoryPersistTypeEnum.DELETE;
                }
                else {
                    this._cloneModel.menus.splice(index, 1);
                }
            }
        }
        else {
            const index = this.model.customMenus.findIndex(x => x.code === menu.code && x.id === menu.id);
            if (index >= 0) {
                const model = this._cloneModel.customMenus[index];
                if (UtilFunctions.isValidStringOrArray(model.code) && needPersist) {
                    model.persistType = PortalHistoryPersistTypeEnum.DELETE;
                }
                else {
                    this._cloneModel.customMenus.splice(index, 1);
                }
            }
        }
        if (UtilFunctions.isValidStringOrArray(menu.children) === true) {
            for(const child of menu.children) {
                this.deleteAllMenuInheritance(child, needPersist);
            }
        }
    }

    cloneAllMenuInheritance(menu: LuthierItemMenuTreeModel, parentMenu: LuthierItemMenuTreeModel, needAdd: boolean, childIndex: number) {
        let clone = menu;
        let order = menu.order;
        if (needAdd) {
            clone = cloneDeep(menu);
            order = parentMenu.children.length + 1;
            childIndex = order;
        }
        const id = crypto.randomUUID();
        this.incKey = this.incKey + 1;
        let key: any = null;

        if (menu.type === LuthierItemMenuTreeTypeEnum.SYSTEM_MENU) {
            key = this.generateKey() + this.incKey.toString().padStart(3, "0");
            const index = this.model.menus.findIndex(x => x.code === menu.code && x.id === menu.id);
            if (index >= 0) {
                const model = this._cloneModel.menus[index];
                const newModel = new LuthierMenuDetailModel();
                newModel.code = null;
                newModel.id = id;
                newModel.menu = model.menu;
                newModel.subsystem = model.subsystem;
                newModel.key = key;
                newModel.order = order;
                newModel.parent = parentMenu.type === LuthierItemMenuTreeTypeEnum.SUBSYSTEM ? null : {code: parentMenu.code, id: parentMenu.id};
                newModel.persistType = PortalHistoryPersistTypeEnum.SAVE;
                if (UtilFunctions.isValidStringOrArray(this.model.menus) === false) {
                    this.model.menus = [];
                }
                this.model.menus.push(newModel);
            }
        }
        else {
            const index = this.model.customMenus.findIndex(x => x.code === menu.code && x.id === menu.id);
            if (index >= 0) {
                const model = this._cloneModel.customMenus[index];
                const newModel = new LuthierCustomMenuTreeModel();
                newModel.code = null;
                newModel.id = id;
                newModel.menu = model.menu;

                if (parentMenu.type === LuthierItemMenuTreeTypeEnum.SUBSYSTEM) {
                    newModel.parent = null;
                    key = null;
                }
                else if (parentMenu.type === LuthierItemMenuTreeTypeEnum.CUSTOM_MENU) {
                    newModel.parent = {code: parentMenu.code, id: parentMenu.id};
                    key = null;
                }
                else {
                    newModel.parent = null;
                    key = parentMenu.key;
                }
                newModel.key = key;
                newModel.aboveMenuItem = UtilFunctions.isValidStringOrArray(parentMenu.children) && childIndex > 0 ? parentMenu.children[childIndex - 1] : null;
                newModel.subsystemCode = menu.subsystemCode;
                newModel.persistType = PortalHistoryPersistTypeEnum.SAVE;
                if (UtilFunctions.isValidStringOrArray(this._cloneModel.customMenus) === false) {
                    this._cloneModel.customMenus = [];
                }
                this._cloneModel.customMenus.push(newModel);
            }
        }
        clone.code = null;
        clone.id = id;
        clone.key = key;
        clone.order = order;
        if (UtilFunctions.isValidStringOrArray(clone.children) === true) {
            for(let i = 0; i < clone.children.length; i++) {
                const child = clone.children[i];
                this.cloneAllMenuInheritance(child, clone, false, i);
            }
        }

        if (needAdd) {
            if (UtilFunctions.isValidStringOrArray(parentMenu.children) === false) {
                parentMenu.children = [];
            }
            else {
                parentMenu.children[parentMenu.children.length - 1].last = false;
            }
            clone.last = true;
            parentMenu.children.push(clone);

        }
    }

    save() {
        const menus = this.model.menus.filter(menu => menu.persistType === PortalHistoryPersistTypeEnum.SAVE || menu.persistType === PortalHistoryPersistTypeEnum.DELETE);
        const custom = this.model.customMenus.filter(menu => menu.persistType === PortalHistoryPersistTypeEnum.SAVE || menu.persistType === PortalHistoryPersistTypeEnum.DELETE);
        if (menus.length === 0 && custom.length === 0) {
            this._messageService.open('Nada foi alterado', "ALERTA", 'warning');
            return;
        }
        else {
            const modelToSave = new LuthierMenuTreeModel();
            modelToSave.menus = menus;
            modelToSave.customMenus = custom;

            this.service.saveMenuTree(modelToSave)
                .then(result => {
                    this.model = result;
                });

        }
        //console.log(menus, custom);
    }

    revert() {
        this.model = this._model;
        this.datasourceMenu.data.forEach(menu => {
            menu['selected'] = false;
        });
        this.datasourceSubsystem.data.forEach(subsystem => {
            subsystem['selected'] = false;
        });
        this._changeDetectorRef.detectChanges();
    }

    generateKey(): string {
        const date = new Date();

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

        return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
    }

    switchPositions<T>(arr: T[], index1: number, index2: number): T[] {
        // Check if the indices are within the bounds of the array
        if (index1 < 0 || index1 >= arr.length || index2 < 0 || index2 >= arr.length) {
            throw new Error("Index out of bounds");
        }

        // Swap elements using destructuring
        [arr[index1], arr[index2]] = [arr[index2], arr[index1]];

        return arr;
    }

    private setMenuOrder(child: LuthierItemMenuTreeModel, parent: LuthierItemMenuTreeModel) {
        if (child.type === LuthierItemMenuTreeTypeEnum.SYSTEM_MENU) {
            const menuIndex = this.model.menus.findIndex(x => x.code === child.code && x.id === child.id);
            if (menuIndex != -1) {
                const menuTarget = this.model.menus[menuIndex];
                menuTarget.order = child.order;
                menuTarget.persistType = PortalHistoryPersistTypeEnum.SAVE;
            }
        } else {
            const menuIndex = this.model.customMenus.findIndex(x => x.code === child.code && x.id === child.id);
            if (menuIndex != -1) {
                const menuTarget = this.model.customMenus[menuIndex];
                const i = child.order;
                if (i > 0) {
                    menuTarget.aboveMenuItem = parent.children[i - 1];
                } else {
                    menuTarget.aboveMenuItem = null;
                }
                menuTarget.persistType = PortalHistoryPersistTypeEnum.SAVE;
            }
        }
    }

    dragMenuRowStart(event: DragEvent, row: LuthierMenuModel) {
        const dataTransfer: DragItemDataTransfer = {type: 'MENU', data: row};
        event.dataTransfer.setData('text/json', JSON.stringify(dataTransfer));
    }

    dragTreeMenuStart(event: DragEvent, node: LuthierItemMenuTreeModel) {
        if (node.type === LuthierItemMenuTreeTypeEnum.SUBSYSTEM) {
            return;
        }
        if (UtilFunctions.isValidStringOrArray(event.dataTransfer?.getData('text/json')) === true) {
            return;
        }
        const dataTransfer: DragItemDataTransfer = {type: 'MENU_TREE', data: node};
        event.dataTransfer?.setData('text/json', JSON.stringify(dataTransfer));
    }

    allowDrop(event: DragEvent, node: LuthierItemMenuTreeModel) {
        event.preventDefault();
    }

    onDrop(event: DragEvent, node: LuthierItemMenuTreeModel) {
        event.preventDefault();
        try {
            if (UtilFunctions.isValidStringOrArray(node.children) === false) {
                node.children = [];
            }
            const dataTransfer: DragItemDataTransfer = JSON.parse(event.dataTransfer?.getData('text/json'));
            if (dataTransfer.type === 'MENU') {
                const model: LuthierMenuModel = dataTransfer.data as LuthierMenuModel;
                const newMenu = new LuthierItemMenuTreeModel();
                newMenu.code = null;
                newMenu.subsystemCode = node.type !== LuthierItemMenuTreeTypeEnum.SUBSYSTEM ? node.subsystemCode : node.code;
                newMenu.id = crypto.randomUUID();
                newMenu.order = node.children.length + 1;
                newMenu.last = true;
                newMenu.caption = model.caption;
                newMenu.menuKey = model.key;
                newMenu.children = [];
                if (model.custom === true) {
                    newMenu.type = LuthierItemMenuTreeTypeEnum.CUSTOM_MENU;
                    newMenu.key = null;
                    const menu = new LuthierCustomMenuTreeModel();
                    menu.menu = model;
                    menu.code = newMenu.code;
                    menu.id = newMenu.id;
                    menu.subsystemCode = newMenu.subsystemCode;
                    if (node.children.length > 0) {
                        menu.aboveMenuItem = node.children[node.children.length];
                    }
                    if (node.type === LuthierItemMenuTreeTypeEnum.SUBSYSTEM) {
                        menu.parent = null;
                        menu.key = null;
                    } else if (node.type === LuthierItemMenuTreeTypeEnum.SYSTEM_MENU) {
                        menu.parent = null;
                        menu.key = node.key;
                    } else {
                        menu.parent = {code: node.code, id: node.id};
                        menu.key = null;
                    }
                    menu.persistType = PortalHistoryPersistTypeEnum.SAVE;
                    this.model.customMenus.push(menu);
                } else {
                    newMenu.type = LuthierItemMenuTreeTypeEnum.SYSTEM_MENU;
                    newMenu.key = this.generateKey() + "001";
                    const menu = new LuthierMenuDetailModel();
                    menu.menu = model;
                    menu.code = newMenu.code;
                    menu.id = newMenu.id;
                    menu.order = newMenu.order;
                    menu.key = newMenu.key;
                    menu.subsystem = {code: newMenu.subsystemCode};
                    if (node.type === LuthierItemMenuTreeTypeEnum.SUBSYSTEM) {
                        menu.parent = null;
                    } else if (node.type === LuthierItemMenuTreeTypeEnum.SYSTEM_MENU) {
                        menu.parent = {code: node.code, id: node.id};
                    } else {
                        throw new Error("Menus customizados não podem ter menus do sistema como filhos");
                    }
                    menu.persistType = PortalHistoryPersistTypeEnum.SAVE;
                    this.model.menus.push(menu);
                }
                if (node.children.length > 0) {
                    node.children[node.children.length - 1].last = false;
                }
                node.children.push(newMenu);

            }
            else if (dataTransfer.type === 'MENU_TREE') {

                const model: LuthierItemMenuTreeModel = dataTransfer.data as LuthierItemMenuTreeModel;
                const newMenu = model;
                const rootNodeIndex = this.model.tree.findIndex(x => x.code === model.subsystemCode);
                const parentNode = this.getParentNode(model, this.model.tree[rootNodeIndex]);
                if (parentNode.parent.code === node.code && parentNode.parent.id === node.id && parentNode.parent.type === model.type) {
                    return;
                }
                if (newMenu.type === LuthierItemMenuTreeTypeEnum.SYSTEM_MENU) {
                    const menuIndex = this.model.menus.findIndex(x => x.code === newMenu.code && x.id === newMenu.id);
                    if (node.type === LuthierItemMenuTreeTypeEnum.CUSTOM_MENU) {
                        throw new Error("Menus customizados não podem ter menus do sistema como filhos")
                    }
                    else if (node.type === LuthierItemMenuTreeTypeEnum.SUBSYSTEM) {
                        this.model.menus[menuIndex].parent = null;
                    }
                    else {
                        this.model.menus[menuIndex].parent = {code: node.code, id: node.id};
                    }
                    this.model.menus[menuIndex].persistType = PortalHistoryPersistTypeEnum.SAVE;
                }
                else {
                    const menuIndex = this.model.menus.findIndex(x => x.code === newMenu.code && x.id === newMenu.id);
                    if (node.type === LuthierItemMenuTreeTypeEnum.CUSTOM_MENU) {
                        this.model.menus[menuIndex].parent = {code: node.code, id: node.id};
                        this.model.menus[menuIndex].key = null;
                    }
                    else if (node.type === LuthierItemMenuTreeTypeEnum.SUBSYSTEM) {
                        this.model.menus[menuIndex].parent = null;
                        this.model.menus[menuIndex].key = null;
                    }
                    else {
                        this.model.menus[menuIndex].parent = null;
                        this.model.menus[menuIndex].key = node.key;
                    }
                    this.model.customMenus[menuIndex].persistType = PortalHistoryPersistTypeEnum.SAVE;
                }

                newMenu.subsystemCode = node.type !== LuthierItemMenuTreeTypeEnum.SUBSYSTEM ? node.subsystemCode : node.code;
                newMenu.order = node.children.length + 1;
                newMenu.last = true;

                if (node.children.length > 0) {
                    node.children[node.children.length - 1].last = false;
                }
                parentNode.parent.children.splice(parentNode.nodeIndex, 1);
                node.children.push(newMenu);

            }
            this.dataSourceTree.data = null;
            this.dataSourceTree.data = this._cloneModel.tree;
            this._changeDetectorRef.detectChanges();
        }
        catch (e) {
            console.error(e);
            this._messageService.open(e, "ERRO", 'error');
        }

    }

    expandMenus(row: LuthierMenuModel, event: MouseEvent, ignoreExpandAndColllapse: boolean) {

        const clickedElement = event.target as HTMLElement;

        if (!ignoreExpandAndColllapse) {
            if (clickedElement.tagName === 'TD') {
                const cellIndex = clickedElement['cellIndex'];
                if (cellIndex === 0) {
                    return;
                }
            }
        }
        this.dataSourceTree.data.forEach((node) => {
            this.expandNodes(node, row.custom ? LuthierItemMenuTreeTypeEnum.CUSTOM_MENU : LuthierItemMenuTreeTypeEnum.SYSTEM_MENU, row, ignoreExpandAndColllapse);
        });
        row['selected'] = true;
        this.datasourceMenu.data.forEach(menu => {
            if (menu.type !== row.type || menu.code !== row.code) {
                menu['selected'] = false;
            }
        });
        this.datasourceSubsystem.data.forEach(subsystem => {
            subsystem['selected'] = false;
        });
    }

    selectSubsystem(row: LuthierSubsystemModel, event: MouseEvent, ignoreExpandAndColllapse: boolean) {
        const clickedElement = event.target as HTMLElement;

        if (!ignoreExpandAndColllapse) {
            if (clickedElement.tagName === 'TD') {
                const cellIndex = clickedElement['cellIndex'];
                if (cellIndex === 0) {
                    return;
                }
            }
        }
        this.dataSourceTree.data.forEach((node) => {
            this.expandNodes(node, LuthierItemMenuTreeTypeEnum.SUBSYSTEM, row, ignoreExpandAndColllapse);
        });
        row['selected'] = true;
        this.datasourceMenu.data.forEach(menu => {
            menu['selected'] = false;
        });
        this.datasourceSubsystem.data.forEach(subsystem => {
            if (subsystem.code !== row.code) {
                subsystem['selected'] = false;
            }
        });
    }

    expandNodes (node: LuthierItemMenuTreeModel, type: LuthierItemMenuTreeTypeEnum, row: LuthierMenuModel | LuthierSubsystemModel, ignoreExpandAndColllapse: boolean)  {
        let shouldExpand = false;
        if (node.type === type ) {
            if (type === LuthierItemMenuTreeTypeEnum.CUSTOM_MENU || type === LuthierItemMenuTreeTypeEnum.SYSTEM_MENU) {
                if (node.menuKey === (row as LuthierMenuModel).key) {
                    if (!ignoreExpandAndColllapse) {
                        this.treeControl.expand(node);
                    }
                    node['selected'] = true;
                    shouldExpand = true;
                }
                else {
                    node['selected'] = false;
                }
            }
            else {
                if (node.code === (row as LuthierMenuModel).code) {
                    if (!ignoreExpandAndColllapse) {
                        this.treeControl.expand(node);
                    }
                    node['selected'] = true;
                    shouldExpand = true;
                }
                else {
                    node['selected'] = false;
                }
            }
        }
        else {
            node['selected'] = false;
        }
        // Verificacao recursiva
        if (node.children) {
            node.children.forEach((child) => {
                const childExpanded = this.expandNodes(child, type, row, ignoreExpandAndColllapse);
                shouldExpand = shouldExpand || childExpanded;
            });
        }

        if (!ignoreExpandAndColllapse) {
            // Expande o pai e os descendentes
            if (shouldExpand) {
                this.treeControl.expand(node);
            } else {
                this.treeControl.collapse(node);
            }
        }

        return shouldExpand;
    }

    private changeMenu (node: LuthierItemMenuTreeModel, nodeParent:LuthierItemMenuTreeModel,  row: LuthierMenuModel, wasRemoved:boolean): boolean  {
        let removed = false;
        const type: LuthierItemMenuTreeTypeEnum = row.custom ? LuthierItemMenuTreeTypeEnum.CUSTOM_MENU : LuthierItemMenuTreeTypeEnum.SYSTEM_MENU;
        if (node.type === type ) {
            if (node.menuKey === (row as LuthierMenuModel).key) {
                let index = nodeParent.children.findIndex(x => x.code === node.code && x.id === node.id && x.type === node.type);
                if (index >= 0) {
                    if (wasRemoved) {
                        this.deleteAllMenuInheritance(node, false);
                        nodeParent.children.splice(index, 1);
                        removed = true;
                    }
                    else {
                        nodeParent.children[index].caption = (row as LuthierMenuModel).caption;
                    }
                }
            }
        }
        if (!node.children) {
            node.children = new Array<LuthierItemMenuTreeModel>();
        }
        for (let i = 0; i < node.children.length;) {
            const child = node.children[i];
            const childRemoved = this.changeMenu(child, node, row, wasRemoved);
            if (!childRemoved) {
                i++;
            }
        }
        return removed;
    }

    selectNode(node: LuthierItemMenuTreeModel, event: MouseEvent) {
        if (node.type === LuthierItemMenuTreeTypeEnum.SUBSYSTEM) {
            const index = this.datasourceSubsystem.data.findIndex(x => x.code === node.code);
            if (index >= 0) {
                const model = this.datasourceSubsystem.data[index];
                this.selectSubsystem(model, event, true);
            }
        }
        else if (node.type === LuthierItemMenuTreeTypeEnum.SYSTEM_MENU) {
            const index = this.datasourceMenu.data.findIndex(x => x.key === node.menuKey && x.custom === false);
            if (index >= 0) {
                const model = this.datasourceMenu.data[index];
                this.expandMenus(model, event, true);
            }
        }
        else if (node.type === LuthierItemMenuTreeTypeEnum.CUSTOM_MENU) {
            const index = this.datasourceMenu.data.findIndex(x => x.key === node.menuKey && x.custom === true);
            if (index >= 0) {
                const model = this.datasourceMenu.data[index];
                this.expandMenus(model, event, true);
            }
        }
    }

    editNodeMenu(node) {
        if (node.type === LuthierItemMenuTreeTypeEnum.SUBSYSTEM) {
            const index = this.datasourceSubsystem.data.findIndex(x => x.code === node.code);
            if (index >= 0) {
                const model = this.datasourceSubsystem.data[index];
                this.editSubsystem(model.code);
            }
        }
        else if (node.type === LuthierItemMenuTreeTypeEnum.SYSTEM_MENU) {
            const index = this.datasourceMenu.data.findIndex(x => x.key === node.menuKey && x.custom === false);
            if (index >= 0) {
                const model = this.datasourceMenu.data[index];
                this.editMenu(model.code);
            }
        }
        else if (node.type === LuthierItemMenuTreeTypeEnum.CUSTOM_MENU) {
            const index = this.datasourceMenu.data.findIndex(x => x.key === node.menuKey && x.custom === true);
            if (index >= 0) {
                const model = this.datasourceMenu.data[index];
                this.editMenu(model.code);
            }
        }
    }
}
