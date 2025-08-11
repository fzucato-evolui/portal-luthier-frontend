import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, firstValueFrom, Observable, of, switchMap, tap} from 'rxjs';
import {PortalLuthierContextModel} from '../../../../shared/models/portal-luthier-context.model';
import {UtilFunctions} from '../../../../shared/util/util-functions';
import {LuthierDatabaseModel} from '../../../../shared/models/luthier.model';
import {PortalLuthierDatabaseModel} from '../../../../shared/models/portal-luthier-database.model';
import {PortalStorageRootModel} from '../../../../shared/models/portal-storage.model';


@Injectable({providedIn: 'root'})
export class PortalLuthierContextService
{
    private baseRestUrl = 'api/admin/portal/luthier-context';
    private _model: BehaviorSubject<PortalLuthierContextModel[]> = new BehaviorSubject(null);
    private _currentModel: PortalLuthierContextModel[] = [];

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    private set model(value: Array<PortalLuthierContextModel>)
    {
        this._currentModel = value;
        // Store the value
        this._model.next(value);
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get model$(): Observable<PortalLuthierContextModel[]> {
        return this._model.asObservable();
    }

    getAll(): Observable<any>
    {
        return this._httpClient.get<PortalLuthierContextModel[]>(`${this.baseRestUrl}/all`).pipe(
            tap((response: PortalLuthierContextModel[]) =>
            {
                this.model = response;
            }),
        );
    }

    get(id: number) : Promise<PortalLuthierContextModel> {
        return firstValueFrom(this._httpClient.get<PortalLuthierContextModel>(`${this.baseRestUrl}/${id}`).pipe(
            switchMap((response: PortalLuthierContextModel) => {
                return of(response);
            })));
    }

    save(model: PortalLuthierContextModel) : Promise<PortalLuthierContextModel> {
        return firstValueFrom(this._httpClient.post<PortalLuthierContextModel>(`${this.baseRestUrl}`, model).pipe(
            switchMap((response: PortalLuthierContextModel) => {
                if (UtilFunctions.isValidStringOrArray(this._currentModel) === false) {
                    this._currentModel = new Array<PortalLuthierContextModel>();
                }
                if (model.id && model.id > 0) {
                    const index = this._currentModel.findIndex(x => x.id === model.id);
                    if (index < 0) {
                        this._currentModel.push(response);
                    } else {
                        this._currentModel[index] = response;
                    }
                } else {
                    this._currentModel.push(response);
                }
                this.model = this._currentModel;
                return of(response);
            })));
    }

    delete(id: number) : Promise<any> {
        return firstValueFrom(this._httpClient.delete<any>(`${this.baseRestUrl}/${id}`).pipe(
            switchMap((response: any) => {
                const index = this._currentModel.findIndex(x => x.id === id);
                if (index >= 0) {
                    this._currentModel.splice(index, 1);
                    this.model = this._currentModel;
                }
                return of(response);
            })));
    }

    getAllDatabases(id: number) : Promise<Array<LuthierDatabaseModel>> {
        return firstValueFrom(this._httpClient.get<Array<LuthierDatabaseModel>>(`${this.baseRestUrl}/all-databases/${id}`).pipe(
            switchMap((response: Array<LuthierDatabaseModel>) => {
                return of(response);
            })));
    }

    getAllLuthierDatabases() : Promise<Array<PortalLuthierDatabaseModel>> {
        return firstValueFrom(this._httpClient.get<Array<PortalLuthierDatabaseModel>>(`${this.baseRestUrl}/all-luthier-databases`).pipe(
            switchMap((response: Array<PortalLuthierDatabaseModel>) => {
                return of(response);
            })));
    }

    getAllRootStorages(): Promise<Array<PortalStorageRootModel>> {
        return firstValueFrom(this._httpClient.get<Array<PortalStorageRootModel>>(`${this.baseRestUrl}/all-root-storages`));
    }

}
