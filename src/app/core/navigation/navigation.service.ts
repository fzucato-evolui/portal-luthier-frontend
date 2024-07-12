import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Navigation} from 'app/core/navigation/navigation.types';
import {forkJoin, map, Observable, ReplaySubject, tap} from 'rxjs';

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
            this._httpClient.get<Navigation>('api/common/navigation')
        ]).pipe(
            tap(([navigation]) => {
                this._navigation.next(navigation);
            }),
            map(([navigation]) => navigation)
        );

    }
}
