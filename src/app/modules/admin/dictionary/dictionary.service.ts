import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {LuthierDatabaseModel, LuthierTableModel} from '../../../shared/models/luthier.model';

@Injectable({providedIn: 'root'})
export class DictionaryService
{
    private _databases: BehaviorSubject<LuthierDatabaseModel[]> = new BehaviorSubject(null);
    private _tables: BehaviorSubject<LuthierTableModel[]> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get databases$(): Observable<LuthierDatabaseModel[]>
    {
        return this._databases.asObservable();
    }

    get tables$(): Observable<LuthierTableModel[]>
    {
        return this._tables.asObservable();
    }

    getDatabases(): Observable<any>
    {
        return this._httpClient.get<LuthierDatabaseModel[]>('api/admin/luthier/dictionary/database/all').pipe(
            tap((response: LuthierDatabaseModel[]) =>
            {
                this._databases.next(response);
            }),
        );
    }

    getTables(): Observable<any>
    {
        return this._httpClient.get<LuthierTableModel[]>('api/admin/luthier/dictionary/table/all').pipe(
            tap((response: LuthierTableModel[]) =>
            {
                this._tables.next(response);
            }),
        );
    }

}
