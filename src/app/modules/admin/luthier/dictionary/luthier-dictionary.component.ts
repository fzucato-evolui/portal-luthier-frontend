import {CdkScrollable, CdkVirtualScrollViewport, ScrollingModule} from '@angular/cdk/scrolling';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {FuseMediaWatcherService} from '@fuse/services/media-watcher';
import {debounceTime, ReplaySubject, takeUntil} from 'rxjs';
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
import {MatTreeModule, MatTreeNestedDataSource} from '@angular/material/tree';
import {NestedTreeControl} from '@angular/cdk/tree';
import {LuthierDictionaryVisionComponent} from './vision/luthier-dictionary-vision.component';

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
    ],
})
export class LuthierDictionaryComponent implements OnInit, OnDestroy
{
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
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
    get workDataBase(): string {

        return UtilFunctions.isValidStringOrArray(this._parent.workDataBase) === false || isNaN(this._parent.workDataBase) ? null : this._parent.workDataBase.toString();
    }
    get service(): LuthierService {
        return this._parent.service;
    }
    /**
     * Constructor
     */
    constructor(private _fuseMediaWatcherService: FuseMediaWatcherService,
                private _fuseNavigationService: FuseNavigationService,
                private _changeDetectorRef: ChangeDetectorRef,
                public messageService: MessageDialogService,
                private _parent: LuthierComponent)
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
                            this.filterObjects(item);

                        },
                    },
                    {
                        id      : 'luthier.dictionary.objects.views',
                        title   : 'Views',
                        type    : 'basic',
                        awesomeIcon : {fontSet: 'fas', fontIcon: 'fa-eye'},
                        function: item => {
                            this.objectType = 'VIEW';
                            this.filterObjects(item);

                        },
                    },
                    {
                        id      : 'luthier.dictionary.objects.visions',
                        title   : 'Visões',
                        type    : 'basic',
                        awesomeIcon : {fontSet: 'fas', fontIcon: 'fa-glasses'},
                        function: item => {
                            this.objectType = 'VISION';
                            this.filterObjects(item);

                        },
                    },

                ],
            },
            {
                id      : 'luthier.dictionary.tools',
                title   : 'Ferramentas',
                type    : 'aside',
                awesomeIcon : {fontSet: 'fas', fontIcon: 'fa-hammer'},
                children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
            }
        ];
        this._parent.page$
            .pipe(takeUntil(this._parent.unsubscribeAll))
            .subscribe((page: string) =>
            {
                if (page === 'dictionary') {
                    setTimeout(() => {
                        this._parent.parent.navigation.secondary = secondaryNavigation;
                    }, 0);
                    this.refreshScroll();
                }
            });
        this._parent.workDataBase$
            .pipe(takeUntil(this._parent.unsubscribeAll), debounceTime(100))
            .subscribe((workDataBase: number) =>
            {
                if (workDataBase !== null) {
                    this.refreshScroll();
                }
                else {
                    this._changeDetectorRef.detectChanges();
                }
            });
        if (this._parent.page === 'dictionary') {
            setTimeout(() => {
                this._parent.parent.navigation.secondary = secondaryNavigation;
                this._changeDetectorRef.detectChanges();
            }, 0);
        }

        this._parent.service.tables$
            .pipe(takeUntil(this._parent.unsubscribeAll))
            .subscribe((tables: LuthierTableModel[]) =>
            {
                this.selectedTab = null;
                this.tabsOpened = [];
                this.tables = tables;

                this.filterObjects();
            });
        this._parent.service.visions$
            .pipe(takeUntil(this._parent.unsubscribeAll))
            .subscribe((visions: LuthierVisionDatasetModel[]) =>
            {
                this.selectedTab = null;
                this.tabsOpened = [];
                this.visions = visions;

                this.filterObjects();
            });
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._parent.unsubscribeAll))
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

    }

    filterObjects(item?: FuseNavigationItem) {
        let filterText = this.filtroComponent ? this.filtroComponent.nativeElement.value : null;
        filterText =  UtilFunctions.isValidStringOrArray(filterText) === true ? UtilFunctions.removeAccents(filterText.toUpperCase()) : '';
        if (this.objectType === 'TABLE' || this.objectType === 'VIEW') {
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
        else {

            const filtrered = this.visions.filter(x => {
                const model = x;
                let valid = true;
                if (UtilFunctions.isValidStringOrArray(filterText) === true) {

                    valid = UtilFunctions.removeAccents(model.name).toUpperCase().includes(filterText) ||
                        UtilFunctions.removeAccents(model.description).toUpperCase().includes(filterText) ||
                        x.children.findIndex(y =>
                            UtilFunctions.removeAccents(y.name).toUpperCase().includes(filterText) ||
                            UtilFunctions.removeAccents(y.description).toUpperCase().includes(filterText) ||
                            y.children.findIndex(z =>
                                UtilFunctions.removeAccents(z.name).toUpperCase().includes(filterText) ||
                                UtilFunctions.removeAccents(z.description).toUpperCase().includes(filterText)
                            ) >=0)>=0;
                }
                return valid;
            });
            this.filteredObjects.next(filtrered);
        }
        if (item) {
            this._parent.parent.navigation.secondary[0].children.forEach(x => {
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

    addTab(table: LuthierDictionaryObjectType) {
        const index = this.tabsOpened.findIndex(x => UtilFunctions.isValidStringOrArray(table.code) &&  x.code === table.code && x.objectType === table.objectType);
        if (index >= 0) {
            this.selectedTab = table;
        }
        else {
            if (table.objectType === 'TABLE' || table.objectType === 'VIEW') {
                this._parent.service.getTable(table.code)
                    .then(response => {
                        this.tabsOpened.push(response);
                        this.selectedTab = response;
                        this._changeDetectorRef.markForCheck();
                    })
            }
            else if (table.objectType === 'VISION') {
                this._parent.service.getVision(table.code)
                    .then(response => {
                        this.tabsOpened.push(response);
                        this.selectedTab = response;
                        this._changeDetectorRef.markForCheck();
                    })
            }
        }

    }

    openedNav() {
        this.refreshScroll();
    }

    removeTab(index: number) {
        this.tabsOpened.splice(index, 1);
    }

    refreshScroll() {
        if (this.cdkVirtualScrollViewPort && this.tables) {
            this.filteredObjects.next(null);
            this._changeDetectorRef.detectChanges();
            this.filterObjects();
            setTimeout(() => {
                this.cdkVirtualScrollViewPort.checkViewportSize();
                this._changeDetectorRef.detectChanges();
            }, 100);
        }
    }
    hasChild = (_: number, node: LuthierVisionModel | LuthierVisionDatasetModel) => !!node.children && node.children.length > 0;

    getVisionDatasource(table: LuthierVisionModel) {
        const datasource = new MatTreeNestedDataSource<LuthierVisionModel>();
        datasource.data = [table];
        return datasource;
    }
}
