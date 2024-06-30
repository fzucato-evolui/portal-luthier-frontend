import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import {forkJoin, Observable, ReplaySubject, tap, map} from 'rxjs';
import {PortalLuthierDatabaseModel} from '../../shared/models/portal-luthier-database.model';
import {FuseNavigationItem} from '../../../@fuse/components/navigation';

@Injectable({providedIn: 'root'})
export class NavigationService
{
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation>
    {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    get(): Observable<Navigation>
    {
        return forkJoin([
            this._httpClient.get<Navigation>('api/common/navigation'),
            this._httpClient.get<PortalLuthierDatabaseModel[]>('api/public/admin/portal/luthier-database/all'),
        ]).pipe(
            tap(([navigation, databases]) => {

                navigation.compact.forEach(menu => {
                    if (menu.id === 'dictionary') {
                        databases.forEach(database => {
                            const item: FuseNavigationItem =
                                {
                                    id   : `${menu.id}.${database.id}`,
                                    title: `${database.identifier} - ${database.databaseType}`,
                                    type : 'basic',
                                    awesomeIcon : {fontSet:"fas", fontIcon:"fa-database"},
                                    link : `/${menu.id}/${database.id}`,
                                    roles : ['ROLE_SUPER', 'ROLE_HYPER']
                                }
                                menu.children.push(item);

                        })
                    }
                });
                this._navigation.next(navigation);
            }),
            map(([navigation, databases]) => navigation)
        );

    }
}
