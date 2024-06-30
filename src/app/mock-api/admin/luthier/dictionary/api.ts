import {Injectable} from '@angular/core';
import {cloneDeep} from 'lodash-es';
import {FuseMockApiService} from '../../../../../@fuse/lib/mock-api';
import {databases, tables} from './data';
import {LuthierDatabaseModel, LuthierTableModel} from '../../../../shared/models/luthier.model';

@Injectable({providedIn: 'root'})
export class AdminLuthierDictionaryMockApi
{
    private readonly _tables: LuthierTableModel[] = tables;
    private readonly _databases: LuthierDatabaseModel[] = databases;

    /**
     * Constructor
     */
    constructor(private _fuseMockApiService: FuseMockApiService)
    {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void
    {
        this._fuseMockApiService
            .onGet('api2/public/admin/luthier/dictionary/database/all')
            .reply(() => [
                200,
                cloneDeep(this._databases)
            ]);
        this._fuseMockApiService
            .onGet('api2/public/admin/luthier/dictionary/table/all')
            .reply(() => [
                200,
                cloneDeep(this._tables)
            ]);
    }
}
