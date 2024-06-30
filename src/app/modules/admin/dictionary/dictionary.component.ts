import { CdkScrollable } from '@angular/cdk/scrolling';
import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { DemoSidebarComponent } from 'app/modules/admin/ui/page-layouts/common/demo-sidebar/demo-sidebar.component';
import { Subject, takeUntil } from 'rxjs';
import {Chat} from '../apps/chat/chat.types';
import {DictionaryService} from './dictionary.service';
import {LuthierDatabaseModel, LuthierTableModel} from '../../../shared/models/luthier.model';
import {FuseNavigationItem, FuseVerticalNavigationComponent} from '../../../../@fuse/components/navigation';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
    selector     : 'dictionary',
    templateUrl  : './dictionary.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports      : [
        MatSidenavModule,
        DemoSidebarComponent,
        FuseVerticalNavigationComponent,
        MatIconModule,
        RouterLink,
        MatButtonModule,
        CdkScrollable],
})
export class DictionaryComponent implements OnInit, OnDestroy
{
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private databases: LuthierDatabaseModel[];
    private tables: LuthierTableModel[];
    menuTableData: FuseNavigationItem[] = [];
    /**
     * Constructor
     */
    constructor(private _fuseMediaWatcherService: FuseMediaWatcherService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _service: DictionaryService)
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
        this._service.databases$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((databases: LuthierDatabaseModel[]) =>
            {
                this.databases = databases;
                console.log('databases', this.databases);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._service.tables$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tables: LuthierTableModel[]) =>
            {
                this.tables = tables;
                this.tables.forEach(table => {
                    this.menuTableData.push({
                        title: `[${table.name}] ${table.description}`,
                        type : 'basic',
                        awesomeIcon : {
                            fontSet: 'fas',
                            fontIcon : table.objectType === 'TABLE' ? 'fa-table' : 'table-list'
                        },
                        function: item => {
                            console.log("clicked at ", item);
                        },
                        meta: table
                    })
                })

                // Mark for check
                this._changeDetectorRef.markForCheck();
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
}
