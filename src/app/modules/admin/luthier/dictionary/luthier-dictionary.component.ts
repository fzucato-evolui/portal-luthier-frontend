import {CdkScrollable, CdkVirtualScrollViewport, ScrollingModule} from '@angular/cdk/scrolling';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {FuseMediaWatcherService} from '@fuse/services/media-watcher';
import {debounceTime, firstValueFrom, ReplaySubject, Subject, takeUntil} from 'rxjs';
import {
    FuseNavigationItem,
    FuseNavigationService,
    FuseVerticalNavigationComponent
} from '../../../../../@fuse/components/navigation';
import {
    LuthierDatabaseModel,
    LuthierDictionaryObjectType,
    LuthierTableModel,
    LuthierVisionDatasetModel,
    LuthierVisionModel
} from '../../../../shared/models/luthier.model';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {LuthierComponent} from '../luthier.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {UtilFunctions} from '../../../../shared/util/util-functions';
import {MatMenuModule} from '@angular/material/menu';
import {MatTooltipModule} from '@angular/material/tooltip';
import {LuthierDictionaryTableComponent} from './table/luthier-dictionary-table.component';
import {MessageDialogService} from '../../../../shared/services/message/message-dialog-service';
import {LuthierService} from '../luthier.service';
import {MatTree, MatTreeModule, MatTreeNestedDataSource} from '@angular/material/tree';
import {NestedTreeControl} from '@angular/cdk/tree';
import {LuthierDictionaryVisionComponent} from './vision/luthier-dictionary-vision.component';
import {LuthierDictionaryDatasetComponent} from './dataset/luthier-dictionary-dataset.component';
import {Clipboard, ClipboardModule} from '@angular/cdk/clipboard';
import {saveAs} from 'file-saver';
import {cloneDeep} from 'lodash-es';
import {MatDialog} from '@angular/material/dialog';
import {
    LuthierDictionaryCheckObjectsModalComponent
} from './modal/check-objects/luthier-dictionary-check-objects-modal.component';

@Component({
    selector     : 'luthier-dictionary',
    templateUrl  : './luthier-dictionary.component.html',
    styleUrls : ['/luthier-dictionary.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone   : true,
    imports: [
        NgClass,
        MatSidenavModule,
        FuseVerticalNavigationComponent,
        MatIconModule,
        MatButtonModule,
        CdkScrollable,
        NgForOf,
        FormsModule,
        MatInputModule,
        ReactiveFormsModule,
        MatButtonToggleModule,
        AsyncPipe,
        MatFormFieldModule,
        MatMenuModule,
        MatTooltipModule,
        ScrollingModule,
        NgIf,
        LuthierDictionaryTableComponent,
        MatTreeModule,
        LuthierDictionaryVisionComponent,
        LuthierDictionaryDatasetComponent,
        ClipboardModule
    ],
})
export class LuthierDictionaryComponent implements OnInit, OnDestroy
{
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private databases: LuthierDatabaseModel[];
    tables: LuthierTableModel[];
    visions: LuthierVisionModel[];
    filteredObjects: ReplaySubject<Array<LuthierDictionaryObjectType>> = new ReplaySubject<Array<LuthierDictionaryObjectType>>(1);
    tabsOpened: LuthierDictionaryObjectType[] = [];
    selectedTab: LuthierDictionaryObjectType;
    objectType = 'TABLE';
    @ViewChild('filtro', {static: false}) filtroComponent: ElementRef;
    @ViewChild(CdkVirtualScrollViewport, { static: false })
    cdkVirtualScrollViewPort: CdkVirtualScrollViewport;
    scrollVisible = true;
    treeControl = new NestedTreeControl<LuthierVisionModel>(node => node.children);
    @ViewChildren(MatTree) trees: QueryList<MatTree<any>>;
    get workDataBase(): string {

        return UtilFunctions.isValidStringOrArray(this._parent.workDataBase) === false || isNaN(this._parent.workDataBase) ? null : this._parent.workDataBase.toString();
    }
    get service(): LuthierService {
        return this._parent.service;
    }
    get currentDataBase(): LuthierDatabaseModel {
        return this._parent.currentDataBase;
    }
    get parent(): LuthierComponent {
        return this._parent;
    }
    /**
     * Constructor
     */
    constructor(private _fuseMediaWatcherService: FuseMediaWatcherService,
                private _fuseNavigationService: FuseNavigationService,
                private _changeDetectorRef: ChangeDetectorRef,
                public messageService: MessageDialogService,
                private _parent: LuthierComponent,
                private _matDialog: MatDialog,
                public clipboard: Clipboard)
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
        const secondaryNavigation: FuseNavigationItem[] = [
            {
                id      : 'luthier.dictionary.objects',
                title   : 'Objetos',
                type    : 'aside',
                awesomeIcon : {fontSet: 'fas', fontIcon: 'fa-diagram-project'},
                children: [
                    {
                        id      : 'luthier.dictionary.objects.tables',
                        title   : 'Tabelas',
                        type    : 'basic',
                        active  : true,
                        awesomeIcon : {fontSet: 'fas', fontIcon: 'fa-table'},
                        function: item => {
                            this.objectType = 'TABLE';
                            this.filteredObjects.next(null);
                            this.filterObjects(item);
                            this._changeDetectorRef.markForCheck();

                        },
                    },
                    {
                        id      : 'luthier.dictionary.objects.views',
                        title   : 'Views',
                        type    : 'basic',
                        awesomeIcon : {fontSet: 'fas', fontIcon: 'fa-eye'},
                        function: item => {
                            this.objectType = 'VIEW';
                            this.filteredObjects.next(null);
                            this.filterObjects(item);
                            this._changeDetectorRef.markForCheck();

                        },
                    },
                    {
                        id      : 'luthier.dictionary.objects.visions',
                        title   : 'Visões',
                        type    : 'basic',
                        awesomeIcon : {fontSet: 'fas', fontIcon: 'fa-glasses'},
                        function: item => {
                            this.objectType = 'VISION';
                            this.filteredObjects.next(null);
                            this.filterObjects(item);
                            this._changeDetectorRef.markForCheck();
                        },
                    },

                ],
            },
            {
                id      : 'luthier.dictionary.tools',
                title   : 'Ferramentas',
                type    : 'aside',
                awesomeIcon : {fontSet: 'fas', fontIcon: 'fa-hammer'},
                roles : ['ROLE_SUPER', 'ROLE_HYPER'],
                children: [
                    {
                        id      : 'luthier.dictionary.tools.sync',
                        title   : 'Sincronizar Schemas da Base Luthier',
                        type    : 'basic',
                        awesomeIcon : {fontSet: 'fas', fontIcon: 'fa-rotate'},
                        function: item => {
                            this.syncSchemas();

                        },
                    },
                    {
                        id      : 'luthier.dictionary.tools.check-objects',
                        title   : 'Checar Objetos na Base de Dados',
                        type    : 'basic',
                        awesomeIcon : {fontSet: 'fas', fontIcon: 'fa-list-check'},
                        function: item => {
                            this.checkObjects();

                        },
                    },
                ],
            }
        ];
        this._parent.page$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((page: string) =>
            {
                if (page === 'dictionary') {
                    setTimeout(() => {
                        this._parent.parent.sercondaryNavigation = secondaryNavigation;
                    }, 0);
                    this.refreshScroll();
                }
            });
        this._parent.workDataBase$
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(100))
            .subscribe((workDataBase: number) =>
            {
                if (workDataBase !== null) {
                    this.refreshScroll();
                }
                else {
                    this._changeDetectorRef.detectChanges();
                }
            });
        this._parent.luthierDataBase$
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(100))
            .subscribe((luthierDataBase: number) =>
            {
                this.tabsOpened = [];
                this.selectedTab = null;
                if (luthierDataBase !== null) {
                    firstValueFrom(this.service.getTables());
                    firstValueFrom(this.service.getVisions());
                    this.enableSecondaryMenu(false);
                }
                else {
                    this.service.visions = [];
                    this.service.tables = [];
                    this.service.databases = [];
                    this.enableSecondaryMenu(true);
                }
                this._changeDetectorRef.detectChanges();
            });
        if (this._parent.page === 'dictionary') {
            setTimeout(() => {
                this._parent.parent.sercondaryNavigation = secondaryNavigation;
                this._changeDetectorRef.detectChanges();
            }, 0);
        }

        this._parent.service.tables$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tables: LuthierTableModel[]) =>
            {
                this.tables = tables;
                this.filterObjects();
            });
        this._parent.service.visions$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((visions: LuthierVisionDatasetModel[]) =>
            {
                this.visions = visions;
                this.filterObjects();
            });
        // Subscribe to media changes
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
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    filterObjects(item?: FuseNavigationItem) {
        let filterText = this.filtroComponent ? this.filtroComponent.nativeElement.value : null;
        filterText =  UtilFunctions.isValidStringOrArray(filterText) === true ? UtilFunctions.removeAccents(filterText.toUpperCase()) : '';
        if (this.objectType === 'TABLE' || this.objectType === 'VIEW') {
            if (UtilFunctions.isValidStringOrArray(this.tables)) {
                this.filteredObjects.next(this.tables.filter(x => {
                    const model = x;
                    let valid = model.objectType === this.objectType;
                    if (valid && UtilFunctions.isValidStringOrArray(filterText) === true) {
                        valid = UtilFunctions.removeAccents(model.description.toUpperCase()).includes(filterText) ||
                            UtilFunctions.removeAccents(model.name.toUpperCase()).includes(filterText);
                    }
                    return valid;
                }));
            }

        }
        else {
            if (UtilFunctions.isValidStringOrArray(this.visions) === true) {
                const filtrered = this.visions.filter(x => {
                    const model = x;
                    let valid = true;
                    if (UtilFunctions.isValidStringOrArray(filterText) === true) {
                        valid = this.recursiveFilter(filterText, x);
                    }
                    return valid;
                });
                this.filteredObjects.next(filtrered);
            }
        }
        if (item) {
            this._parent.parent.sercondaryNavigation[0].children.forEach(x => {
                x.active = x.id === item.id ? true : null;
            });
            const navComponent = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>("secondaryNavigation");

            // Return if the navigation component does not exist
            if (!navComponent) {
                return null;
            }
            navComponent.refresh();
        }

    }

    recursiveFilter(filterText: string, model: LuthierVisionModel | LuthierVisionDatasetModel): boolean {
        let valid = UtilFunctions.removeAccents(model.name).toUpperCase().includes(filterText) ||
            UtilFunctions.removeAccents(model.description).toUpperCase().includes(filterText);
        if (!valid && UtilFunctions.isValidStringOrArray(model.children)) {
            for (const x of model.children) {
                valid = this.recursiveFilter(filterText, x);
                if (valid) {
                    return true;
                }
            }
        }
        return valid;
    }

    addTab(table: LuthierDictionaryObjectType) {
        if (UtilFunctions.isValidStringOrArray(table.code) === true) {
            const index = this.tabsOpened.findIndex(x =>  x.code === table.code && x.objectType === table.objectType);
            if (index >= 0) {
                this.selectedTab = this.tabsOpened[index];
            }
            else {
                if (table.objectType === 'TABLE' || table.objectType === 'VIEW') {
                    this._parent.service.getTable(table.code)
                        .then(response => {
                            response.id = crypto.randomUUID();
                            this.tabsOpened.push(response);
                            this.selectedTab = response;
                            this._changeDetectorRef.markForCheck();
                        })
                }
                else if (table.objectType === 'VISION') {
                    this._parent.service.getVision(table.code)
                        .then(response => {
                            response.id = crypto.randomUUID();
                            this.tabsOpened.push(response);
                            this.selectedTab = response;
                            this._changeDetectorRef.markForCheck();
                        })
                }
                else if (table.objectType === 'VISION_DATASET') {
                    this._parent.service.getDataset(table.code)
                        .then(response => {
                            response.id = crypto.randomUUID();
                            this.tabsOpened.push(response);
                            this.selectedTab = response;
                            this._changeDetectorRef.markForCheck();
                        })
                }
            }
        }
        else {
            this.tabsOpened.push(table);
            this.selectedTab = table;
            this._changeDetectorRef.markForCheck();
        }

    }

    openedNav() {
        this.refreshScroll();
    }

    removeTab(index: number) {
        this.tabsOpened.splice(index, 1);
    }

    refreshScroll() {
        if (this.cdkVirtualScrollViewPort) {
            this.filteredObjects.next(null);
            this._changeDetectorRef.detectChanges();
            this.filterObjects();
            setTimeout(() => {
                this.cdkVirtualScrollViewPort.checkViewportSize();
                this._changeDetectorRef.detectChanges();
            }, 100);
        }
    }
    hasChild = (_: number, node: LuthierVisionModel | LuthierVisionDatasetModel) => {
        return !!node.children && node.children.length > 0 && node.children.filter(x => !x['removed']).length > 0;
    }

    removeObject(object: LuthierDictionaryObjectType, vision: LuthierVisionModel) {
        this.messageService.open('Tem certeza de que deseja remover o objeto?. Todos os vínculos serão removidos.', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                if (object.objectType === 'TABLE' || object.objectType == 'VIEW') {
                    this.service.deleteTable(object.code)
                        .then(result => {

                            let index = this.tabsOpened.findIndex(x => x.objectType === object.objectType && x.id === object.id);
                            this.tabsOpened.splice(index, 1);
                            this.selectedTab = null;
                            object['removed'] = true;
                            this.filterObjects(null);
                            this._changeDetectorRef.detectChanges();
                            this.messageService.open(`${object.objectType === 'TABLE' ? 'Tabela' : 'View'} removida com sucesso`, 'SUCESSO', 'success');
                        })

                }
                else if (object.objectType === 'VISION') {
                    this.service.deleteVision(object.code)
                        .then(result => {

                            let index = this.tabsOpened.findIndex(x => x.objectType === object.objectType && x.id === object.id);
                            this.tabsOpened.splice(index, 1);
                            this.selectedTab = null;
                            object['removed'] = true;
                            vision['updated'] = true;
                            this._changeDetectorRef.detectChanges();
                            this.messageService.open(`Visão removida com sucesso`, 'SUCESSO', 'success');
                        })

                }
                else if (object.objectType === 'VISION_DATASET') {
                    /*
                    if (this.removeDataset(object.code, vision) === true) {
                        this.filterObjects(null);
                    }
                     */
                    this.service.deleteDataset(object as LuthierVisionDatasetModel, vision)
                        .then(result => {
                            let index = this.tabsOpened.findIndex(x => x.objectType === object.objectType && this.compareCode(x, object));
                            this.tabsOpened.splice(index, 1);
                            this.selectedTab = null;
                            object['removed'] = true;
                            vision['updated'] = true;
                            this._changeDetectorRef.detectChanges();
                            this.messageService.open(`Dataset removido com sucesso`, 'SUCESSO', 'success');
                        })
                }

            }
        });

    }
    removeDataset(code: number, model: LuthierVisionModel | LuthierVisionDatasetModel): boolean {
        if (UtilFunctions.isValidStringOrArray(model.children) === false) {
            return false;
        }
        let index = model.children.findIndex(x => x.code === code);
        if (index < 0) {
            for (const x of model.children) {
                if (this.removeDataset(code, x)) {
                    return true;
                }
            }
            return false;
        }
        else {
            //Necessario para corrigir bug do mattree que nao apaga os filhos imediatamente da arvore
            model.children[index]['removed'] = true;
            model.children.splice(index, 1);
            return true;
        }

    }

    childreenWasRemoved(model: LuthierVisionModel | LuthierVisionDatasetModel): boolean {
        if (!UtilFunctions.isValidStringOrArray(model.children)) {
            return true;
        }
        if (model.children.filter(x => x['removed'] === true).length === model.children.length) {
            return true;
        }
        return false;
    }

    addDataset(model: LuthierVisionModel | LuthierVisionDatasetModel, vision: LuthierVisionModel): any {
        return this.service.getVisionChildreen(vision.code)
            .then(relatives => {
                const newModel = new LuthierVisionDatasetModel();
                newModel.vision = cloneDeep(vision);
                newModel.vision.children = null;
                newModel.name = 'Novo_Dataset';
                newModel.id = crypto.randomUUID();
                newModel.objectType = 'VISION_DATASET';
                newModel.parent = model.objectType === 'VISION_DATASET' ? model as LuthierVisionDatasetModel : null;
                newModel.relatives = relatives;
                newModel.fields = [];
                newModel.searchs = [];
                newModel.customFields = [];
                newModel.customizations = [];
                newModel.groupInfos = [];
                this.addTab(newModel);

            })


    }
    refresh() {
        if (this.objectType === 'VISION') {
            firstValueFrom(this.service.getVisions());
        }
        else {
            firstValueFrom(this.service.getTables());
        }
    }
    addObject() {
        if (this.objectType === 'VISION') {
            const newModel = new LuthierVisionModel();
            newModel.name = 'Nova_Visao';
            newModel.id = crypto.randomUUID();
            newModel.objectType = 'VISION';
            this.addTab(newModel);
        }
        else {
            const newModel = new LuthierTableModel();
            newModel.name = this.objectType === 'TABLE' ? 'Nova_Tabela' : 'Nova_View';
            newModel.id = crypto.randomUUID();
            newModel.objectType = this.objectType;
            newModel.fields = [];
            newModel.searchs = [];
            newModel.customFields = [];
            newModel.customizations = [];
            newModel.groupInfos = [];
            newModel.references = [];
            newModel.indexes = [];
            newModel.views = [];
            this.addTab(newModel);
        }
    }


    syncSchemas() {
        this.messageService.open('Serão criados índices, referências e sequences e tabelas. Pode haver alguma inconsistência de dados com a estrutura atual. Tem certeza de que deseja continuar?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                this.service.syncSchemas()
                    .then(result => {
                        this.messageService.open('Schemas sincronizados com sucesso', 'SUCESSO', 'success');
                    })

            }
        });

    }

    checkObjects() {
        this.messageService.open('Tem certeza de que deseja checar os objetos do banco de trabalho Luthier atual na base de dados atual?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {

                this.service.checkObjects()
                    .then(result => {
                        const modal = this._matDialog.open(LuthierDictionaryCheckObjectsModalComponent, { disableClose: true, panelClass: 'luthier-dictionary-check-objects-modal-container' });
                        modal.componentInstance.title = "Resumo das Alterações";
                        modal.componentInstance.parent = this;
                        modal.componentInstance.model = result;
                        //this.messageService.open('Objetos checados com sucesso', 'SUCESSO', 'success');
                    })

                /*
                this.service.getJSON('changes.json')
                    .then(result => {
                        const modal = this._matDialog.open(LuthierDictionaryCheckObjectsModalComponent, { disableClose: true, panelClass: 'luthier-dictionary-check-objects-modal-container' });
                        modal.componentInstance.title = "Resumo das Alterações";
                        modal.componentInstance.parent = this;
                        modal.componentInstance.model = result;
                    })
                */

            }
        });

    }

    enableSecondaryMenu(disabled: boolean) {
        if (UtilFunctions.isValidStringOrArray(this._parent.parent.sercondaryNavigation) === true) {
            this._parent.parent.sercondaryNavigation.forEach(x => {
                x.disabled = disabled;
                x.children.forEach(y => {
                    y.disabled = disabled;
                });
            });
            const navComponent = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>("secondaryNavigation");

            // Return if the navigation component does not exist
            if (!navComponent) {
                return null;
            }
            navComponent.refresh();
        }
    }

    export(object: LuthierDictionaryObjectType, vision: LuthierVisionModel, clipBoard: boolean) {
        if (object.objectType === 'TABLE' || object.objectType === 'VIEW') {
            this.service.getTable(object.code)
                .then(result => {
                    if (clipBoard === true) {
                        this.clipboard.copy(JSON.stringify(result));
                        this.messageService.open('Dados copiados para o clipboard', 'SUCESSO', 'success');
                    }
                    else {
                        const blob = new Blob([JSON.stringify(result)], {type: "text/plain;charset=utf-8"});
                        saveAs(blob, `${object.objectType}_${object.name}.json`);
                    }
                })
        }
        else if (object.objectType === 'VISION') {
            this.service.getVision(object.code)
                .then(result => {
                    if (clipBoard === true) {
                        this.clipboard.copy(JSON.stringify(result));
                        this.messageService.open('Dados copiados para o clipboard', 'SUCESSO', 'success');
                    }
                    else {
                        const blob = new Blob([JSON.stringify(result)], {type: "text/plain;charset=utf-8"});
                        saveAs(blob, `${object.objectType}_${object.name}.json`);
                    }
                })
        }
    }

    getTreeDataSource(table: LuthierVisionModel, tree: MatTree<any>): MatTreeNestedDataSource<LuthierVisionModel> {
        if (!tree.dataSource) {
            const dataSource = new MatTreeNestedDataSource<LuthierVisionModel>();
            dataSource.data = [table];
            return dataSource;
        }
        else {
            const dataSource = tree.dataSource as MatTreeNestedDataSource<LuthierVisionModel>;
            if (table['removed'] === true) {
                dataSource.data = null
                dataSource.disconnect();
                table['updated'] = false;
            }
            else if (table['updated'] === true) {
                dataSource.data = null
                dataSource.data = [table];
                table['updated'] = false;
            }
            else {
                dataSource.data = [table];
            }
            return dataSource;
        }


    }

    updateDatasetNode (dataset: LuthierVisionDatasetModel) {
        const visionIndex = this.visions.findIndex(x => x.code === dataset.vision.code);
        this.visions[visionIndex]['updated'] = true;
    }

    compareCode(v1: any , v2: any): boolean {
        if (v1 && v2) {
            if (UtilFunctions.isValidStringOrArray(v1.code) === true) {
                return v1.code === v2.code || v1.code === v2;
            }
            else {
                return v1.id === v2.id || v1.id === v2;
            }
        }
        else {
            return v1 === v2;
        }
    }

    downloadFile(model: any, filename: string) {
        const blob = new Blob([JSON.stringify(model)], {type: "text/plain;charset=utf-8"});
        saveAs(blob, filename);
    }
}
