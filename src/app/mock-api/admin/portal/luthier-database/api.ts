import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import {FuseMockApiService} from '../../../../../@fuse/lib/mock-api';
import {PortalLuthierDatabaseModel} from '../../../../shared/models/portal-luthier-database.model';
import {databases} from './data';

@Injectable({providedIn: 'root'})
export class AdminPortalLuthierDatabaseMockApi
{
    private readonly _databases: PortalLuthierDatabaseModel[] = databases;

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
        // -----------------------------------------------------------------------------------------------------
        // @ Feather icons - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api2/public/admin/portal/luthier-database/all')
            .reply(() => [
                200,
                cloneDeep(this._databases)
            ]);
    }
}
