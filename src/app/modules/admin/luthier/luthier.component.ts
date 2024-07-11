import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ReplaySubject, Subject, takeUntil} from 'rxjs';
import {LuthierService} from './luthier.service';
import {LuthierDictionaryComponent} from './dictionary/luthier-dictionary.component';
import {NgClass, NgIf} from '@angular/common';
import {CompactLayoutComponent} from '../../../layout/layouts/vertical/compact/compact.component';
import {LuthierConnectionComponent} from './connection/luthier-connection.component';
import {AuthService, StorageChange} from '../../../core/auth/auth.service';
import {UtilFunctions} from '../../../shared/util/util-functions';
import {LuthierProjectComponent} from './project/luthier-project.component';
import {MatIconModule} from '@angular/material/icon';
import {LuthierDatabaseModel} from '../../../shared/models/luthier.model';

@Component({
    selector     : 'luthier',
    templateUrl  : './luthier.component.html',
    styleUrls : ['/luthier.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports: [
        NgClass,
        NgIf,
        LuthierDictionaryComponent,
        LuthierConnectionComponent,
        LuthierProjectComponent,
        MatIconModule
    ],
})
export class LuthierComponent implements OnInit, OnDestroy
{
    page: 'project' | 'connection' | 'dictionary' | 'manager' | any = 'none';
    public unsubscribeAll: Subject<any> = new Subject<any>();
    public page$: ReplaySubject<String> = new ReplaySubject<String>(1);
    public workDataBase$: ReplaySubject<number> = new ReplaySubject<number>(1);
    public luthierDataBase$: ReplaySubject<number> = new ReplaySubject<number>(1);
    private _workDataBase: number;
    private _luthierDatabase: number;
    set workDataBase(value: number) {
        this.authService.dadosDatabase = value.toString();
        this._workDataBase = value;
    }
    get workDataBase(): number {
        return this._workDataBase;
    }
    get currentDataBase(): LuthierDatabaseModel {
        if (UtilFunctions.isValidStringOrArray(this.workDataBase) === true) {
            const index = this.service.currentDatabases.findIndex(x => x.code === this.workDataBase);
            return this.service.currentDatabases[index];
        }
        return null;
    }
    set luthierDataBase(value: number) {
        this.authService.luthierDatabase = value.toString();
        this._luthierDatabase = value;
    }
    get luthierDataBase(): number {
        return this._luthierDatabase;
    }
    get hasLuthierDatabase(): boolean {
        const database = this.authService.luthierDatabase;
        /*
        if (parseInt(database) != this.luthierDataBase) {
            this._luthierDatabase = parseInt(database);
            this.luthierDataBase$.next(this._luthierDatabase);
        }
         */
        return UtilFunctions.isValidStringOrArray(database);
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
                }
                if (storage.key === 'luthierDatabase') {
                    this._luthierDatabase = UtilFunctions.isValidStringOrArray(storage.value) ? parseInt(storage.value) : null;
                    this.luthierDataBase$.next(this._luthierDatabase);
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
