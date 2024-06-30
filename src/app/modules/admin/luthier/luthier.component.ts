import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {firstValueFrom, ReplaySubject, Subject, takeUntil} from 'rxjs';
import {LuthierService} from './luthier.service';
import {LuthierDictionaryComponent} from './dictionary/luthier-dictionary.component';
import {NgClass} from '@angular/common';
import {CompactLayoutComponent} from '../../../layout/layouts/vertical/compact/compact.component';
import {FuseNavigationItem} from '../../../../@fuse/components/navigation';
import {LuthierConnectionComponent} from './connection/luthier-connection.component';
import {AuthService, StorageChange} from '../../../core/auth/auth.service';
import {UtilFunctions} from '../../../shared/util/util-functions';

@Component({
    selector     : 'luthier',
    templateUrl  : './luthier.component.html',
    styleUrls : ['/luthier.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports: [
        NgClass,
        LuthierDictionaryComponent,
        LuthierConnectionComponent
    ],
})
export class LuthierComponent implements OnInit, OnDestroy
{
    page: 'connection' | 'dictionary' | 'manager' | any = 'none';
    public unsubscribeAll: Subject<any> = new Subject<any>();
    public page$: ReplaySubject<String> = new ReplaySubject<String>(1);
    public workDataBase$: ReplaySubject<number> = new ReplaySubject<number>(1);
    private _workDataBase: number;
    set workDataBase(value: number) {
        this.authService.dadosDatabase = value.toString();
        this._workDataBase = value;
    }
    get workDataBase(): number {
        return this._workDataBase;
    }
    /**
     * Constructor
     */
    constructor(private _route: ActivatedRoute,
                public parent: CompactLayoutComponent,
                private authService: AuthService,
                public service: LuthierService)
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
        const dadosDatabase = this.authService.dadosDatabase;
        if (UtilFunctions.isValidStringOrArray(dadosDatabase) === true) {
            this.workDataBase = parseInt(dadosDatabase);
        }
        this.authService.storageChange$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe((storage: StorageChange) =>
            {
                if (storage.key === 'dadosDatabase') {
                    this._workDataBase = UtilFunctions.isValidStringOrArray(storage.value) ? parseInt(storage.value) : null;
                    this.workDataBase$.next(this._workDataBase);
                    console.log("changed database", this._workDataBase);
                }
                if (storage.key === 'luthierDatabase') {
                    if (UtilFunctions.isValidStringOrArray(storage.value) === true) {
                        firstValueFrom(this.service.getTables());
                    }
                    else {
                        this.service.tables = [];
                        this.service.databases = [];
                    }
                }
            });
        this._route.url.pipe(takeUntil(this.unsubscribeAll)).subscribe(segment => {
            this.page = segment[0].path;
            setTimeout(() => {
                this.parent.navigation.secondary = null;
            }, 0);
            this.page$.next(this.page);
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
}
