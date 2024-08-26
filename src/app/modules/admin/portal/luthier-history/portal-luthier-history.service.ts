import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, firstValueFrom, Observable, of, switchMap, tap} from 'rxjs';
import {UtilFunctions} from '../../../../shared/util/util-functions';
import {
    PortalLuthierHistoryFilterModel,
    PortalLuthierHistoryModel
} from '../../../../shared/models/portal_luthier_history.model';
import {PortalLuthierHistoryConfigModel} from '../../../../shared/models/system-config.model';


@Injectable({providedIn: 'root'})
export class PortalLuthierHistoryService
{
    private baseRestUrl = 'api/admin/portal/luthier-history';
    private _model: BehaviorSubject<PortalLuthierHistoryModel[]> = new BehaviorSubject(null);
    private _config: BehaviorSubject<PortalLuthierHistoryConfigModel> = new BehaviorSubject(null);
    private _currentModel: PortalLuthierHistoryModel[] = [];

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    private set model(value: Array<PortalLuthierHistoryModel>)
    {
        this._currentModel = value;
        // Store the value
        this._model.next(value);
    }

    private set config(value: PortalLuthierHistoryConfigModel)
    {
        // Store the value
        this._config.next(value);
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get model$(): Observable<PortalLuthierHistoryModel[]> {
        return this._model.asObservable();
    }

    get config$(): Observable<PortalLuthierHistoryConfigModel> {
        return this._config.asObservable();
    }

    getAll(): Observable<any>
    {
        return this._httpClient.get<PortalLuthierHistoryModel[]>(`${this.baseRestUrl}/all`).pipe(
            tap((response: PortalLuthierHistoryModel[]) =>
            {
                this.model = response;
            }),
        );
    }

    getConfig(): Observable<any>
    {
        return this._httpClient.get<PortalLuthierHistoryConfigModel>(`${this.baseRestUrl}/config`).pipe(
            tap((response: PortalLuthierHistoryConfigModel) =>
            {
                this.model = [];
                this.config = response;
            }),
        );
    }

    filter(model: PortalLuthierHistoryFilterModel): Observable<any>
    {
        return this._httpClient.post<PortalLuthierHistoryModel[]>(`${this.baseRestUrl}/filter`, model).pipe(
            tap((response: PortalLuthierHistoryModel[]) =>
            {
                this.model = response;
            }),
        );
    }

    get(id: number) : Promise<PortalLuthierHistoryModel> {
        return firstValueFrom(this._httpClient.get<PortalLuthierHistoryModel>(`${this.baseRestUrl}/${id}`).pipe(
            switchMap((response: PortalLuthierHistoryModel) => {
                return of(response);
            })));
    }

    save(model: PortalLuthierHistoryModel) : Promise<PortalLuthierHistoryModel> {
        return firstValueFrom(this._httpClient.post<PortalLuthierHistoryModel>(`${this.baseRestUrl}`, model).pipe(
            switchMap((response: PortalLuthierHistoryModel) => {
                if (UtilFunctions.isValidStringOrArray(this._currentModel) === false) {
                    this._currentModel = new Array<PortalLuthierHistoryModel>();
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

    copy(id: number) : Promise<any> {
        return firstValueFrom(this._httpClient.patch<any>(`${this.baseRestUrl}/copy/${id}`, null));
    }
}
