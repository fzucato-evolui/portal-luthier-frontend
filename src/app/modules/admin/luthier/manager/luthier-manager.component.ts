import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {debounceTime, firstValueFrom, Subject, takeUntil} from 'rxjs';
import {
    FuseNavigationItem,
    FuseNavigationService,
    FuseVerticalNavigationComponent
} from '../../../../../@fuse/components/navigation';
import {LuthierDatabaseModel} from '../../../../shared/models/luthier.model';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {LuthierComponent} from '../luthier.component';
import {UtilFunctions} from '../../../../shared/util/util-functions';
import {MessageDialogService} from '../../../../shared/services/message/message-dialog-service';
import {LuthierService} from '../luthier.service';
import {FormsModule} from '@angular/forms';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {LuthierManagerParameterComponent} from './parameter/luthier-manager-parameter.component';
import {LuthierManagerSemaphoreComponent} from './semaphore/luthier-manager-semaphore.component';
import {LuthierManagerMenuComponent} from './menu/luthier-manager-menu.component';
import {LuthierManagerMenutreeComponent} from './menutree/luthier-manager-menutree.component';
import {LuthierManagerPatchesComponent} from './patches/luthier-manager-patches.component';
import {TranslocoModule} from '@ngneat/transloco';

export type LuthierManagerObjectType = 'PARAMETER' | 'SEMAPHORE' | 'MENU' | 'MENU_TREE' | 'PATCHES_IMPORT' | 'PATCHES_EXPORT';
@Component({
    selector     : 'luthier-manager',
    templateUrl  : './luthier-manager.component.html',
    styleUrls : ['./luthier-manager.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone   : true,
    imports: [
        NgClass,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        NgForOf,
        NgIf,
        MatButtonToggleModule,
        LuthierManagerParameterComponent,
        LuthierManagerSemaphoreComponent,
        LuthierManagerMenuComponent,
        LuthierManagerMenutreeComponent,
        LuthierManagerPatchesComponent,
        TranslocoModule
    ],
})
export class LuthierManagerComponent implements OnInit, OnDestroy
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    tabsOpened: LuthierManagerObjectType[] = [];
    selectedTab: LuthierManagerObjectType;
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
    constructor(
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
                id: 'luthier.manager.objects',
                title: 'Objetos',
                type: 'aside',
                awesomeIcon: {fontSet: 'fas', fontIcon: 'fa-diagram-project'},
                children: [
                    {
                        id: 'luthier.manager.objects.menus',
                        title: 'Menus',
                        type: 'basic',
                        awesomeIcon: {fontSet: 'fas', fontIcon: 'fa-bars'},
                        roles: ['ROLE_SUPER', 'ROLE_HYPER'],
                        function: item => {
                            this.addTab('MENU');

                        },
                    },
                    {
                        id: 'luthier.manager.objects.parameters',
                        title: 'Árvore de Menus',
                        type: 'basic',
                        awesomeIcon: {fontSet: 'fas', fontIcon: 'fa-folder-tree'},
                        roles: ['ROLE_SUPER', 'ROLE_HYPER'],
                        function: item => {
                            this.addTab('MENU_TREE');

                        },
                    },
                    {
                        id: 'luthier.manager.objects.parameters',
                        title: 'Parâmetros',
                        type: 'basic',
                        awesomeIcon: {fontSet: 'fas', fontIcon: 'fa-p'},
                        roles: ['ROLE_SUPER', 'ROLE_HYPER'],
                        function: item => {
                            this.addTab('PARAMETER');

                        },
                    },
                    {
                        id: 'luthier.manager.objects.semaphores',
                        title: 'Semáforos',
                        type: 'basic',
                        awesomeIcon: {fontSet: 'fas', fontIcon: 'fa-traffic-light'},
                        roles: ['ROLE_SUPER', 'ROLE_HYPER'],
                        function: item => {
                            this.addTab('SEMAPHORE');

                        },
                    },
                    {
                        id: 'luthier.manager.objects.patches',
                        title: 'Patches',
                        type: 'aside',
                        awesomeIcon: {fontSet: 'fas', fontIcon: 'fa-file-zipper'},
                        roles: ['ROLE_SUPER','ROLE_HYPER'],
                        children: [
                            {
                                id: 'luthier.manager.objects.patches.import',
                                title: 'Importar',
                                type: 'basic',
                                awesomeIcon: {fontSet: 'fas', fontIcon: 'fa-download'},
                                roles: ['ROLE_SUPER', 'ROLE_HYPER'],
                                function: item => {
                                    this.addTab('PATCHES_IMPORT');

                                },
                            },
                            {
                                id: 'luthier.manager.objects.patches.export',
                                title: 'Exportar',
                                type: 'basic',
                                awesomeIcon: {fontSet: 'fas', fontIcon: 'fa-upload'},
                                roles: ['ROLE_SUPER', 'ROLE_HYPER'],
                                function: item => {
                                    this.addTab('PATCHES_EXPORT');

                                },
                            }
                        ]

                    }
                ]
            },
            {
                id      : 'luthier.manager.tools',
                title   : 'Ferramentas',
                type    : 'aside',
                awesomeIcon : {fontSet: 'fas', fontIcon: 'fa-hammer'},
                roles : ['ROLE_SUPER', 'ROLE_HYPER'],
                children: [
                    {
                        id      : 'luthier.manager.tools.syncParameters',
                        title   : 'Sincronizar Parâmetros',
                        type    : 'basic',
                        awesomeIcon : {fontSet: 'fas', fontIcon: 'fa-rotate'},
                        function: item => {
                            this.syncParameters();

                        },
                    },
                    {
                        id      : 'luthier.manager.tools.syncSemaphores',
                        title   : 'Sincronizar Semáforos',
                        type    : 'basic',
                        awesomeIcon : {fontSet: 'fas', fontIcon: 'fa-rotate'},
                        function: item => {
                            this.syncSemaphores();

                        },
                    },
                ],
            }
        ];
        this._parent.page$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((page: string) =>
            {
                if (page === 'manager') {
                    setTimeout(() => {
                        this._parent.parent.sercondaryNavigation = secondaryNavigation;
                        this._changeDetectorRef.detectChanges();
                    }, 100);

                }
            });
        this._parent.workDataBase$
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(100))
            .subscribe((workDataBase: number) =>
            {
                this.tabsOpened = [];
                this.selectedTab = null;
                if (workDataBase !== null) {
                    this.enableSecondaryMenu(false);
                }
                else {
                    this.enableSecondaryMenu(true);
                }
                this._changeDetectorRef.detectChanges();
            });
        this._parent.luthierDataBase$
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(100))
            .subscribe((luthierDataBase: number) =>
            {
                this.tabsOpened = [];
                this.selectedTab = null;
                this.enableSecondaryMenu(true);
                this._changeDetectorRef.detectChanges();
            });
        if (this._parent.page === 'manager') {
            setTimeout(() => {
                this._parent.parent.sercondaryNavigation = secondaryNavigation;
                if(!this.workDataBase) {
                    this.enableSecondaryMenu(true);
                }
                this._changeDetectorRef.detectChanges();
            }, 0);
        }

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
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

    removeTab(i: number) {
        this.tabsOpened.splice(i, 1);
    }

    addTab(objectType: LuthierManagerObjectType) {
        if (!this.tabsOpened.includes(objectType)) {
            if (objectType === 'PARAMETER') {
                Promise.all(
                    [
                        firstValueFrom(this.service.getParameters()),
                        firstValueFrom(this.service.getUsers())
                    ]
                ).then(async value => {
                    this.tabsOpened.push(objectType);
                    this.selectedTab = objectType;
                    this._changeDetectorRef.detectChanges();
                });
            }
            else if (objectType === 'SEMAPHORE') {
                firstValueFrom(this.service.getSemaphores())
                    .then(async value => {
                        this.tabsOpened.push(objectType);
                        this.selectedTab = objectType;
                        this._changeDetectorRef.detectChanges();
                    });
            }
            else if (objectType === 'MENU') {
                Promise.all(
                    [
                        firstValueFrom(this.service.getMenus()),
                        firstValueFrom(this.service.getResources(true))
                    ]
                ).then(async value => {
                    this.tabsOpened.push(objectType);
                    this.selectedTab = objectType;
                    this._changeDetectorRef.detectChanges();
                });
            }
            else if (objectType === 'MENU_TREE') {
                Promise.all(
                    [
                        firstValueFrom(this.service.getMenus()),
                        firstValueFrom(this.service.getMenuTree()),
                        firstValueFrom(this.service.getSubsystems())
                    ]
                ).then(async value => {
                    this.tabsOpened.push(objectType);
                    this.selectedTab = objectType;
                    this._changeDetectorRef.detectChanges();
                });
            }
            else if (objectType === 'PATCHES_EXPORT') {
                Promise.all(
                    [

                    ]
                ).then(async value => {
                    this.tabsOpened.push(objectType);
                    this.selectedTab = objectType;
                    this._changeDetectorRef.detectChanges();
                });
            }
            else if (objectType === 'PATCHES_IMPORT') {
                //this.messageService.open('Ainda não implementado', 'INFORMAÇÃO', 'info');
                Promise.all(
                    [

                    ]
                ).then(async value => {
                    this.tabsOpened.push(objectType);
                    this.selectedTab = objectType;
                    this._changeDetectorRef.detectChanges();
                });
            }
        }
        else {
            this.selectedTab = objectType;
            this._changeDetectorRef.detectChanges();
        }

    }

    syncParameters() {
        this.messageService.open('Serão inseridos os parâmetros presentes na base luthier e ausentes na base de dados. Tem certeza de que deseja continuar?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                this.service.syncParameters()
                    .then(result => {
                        this.messageService.open('Parâmetros sincronizados com sucesso', 'SUCESSO', 'success');
                    })

            }
        });

    }

    syncSemaphores() {
        this.messageService.open('Serão inseridos os semáforos presentes na base luthier e ausentes na base de dados. Tem certeza de que deseja continuar?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                this.service.syncSemaphores()
                    .then(result => {
                        this.messageService.open('Semáforos sincronizados com sucesso', 'SUCESSO', 'success');
                    })

            }
        });

    }
}
