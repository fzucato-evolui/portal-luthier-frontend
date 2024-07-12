import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, firstValueFrom, Observable, of, switchMap, tap} from 'rxjs';
import {PortalLuthierDatabaseModel} from '../../../../shared/models/portal-luthier-database.model';
import {UtilFunctions} from '../../../../shared/util/util-functions';


@Injectable({providedIn: 'root'})
export class PortalLuthierDatabaseService
{
    private baseRestUrl = 'api/admin/portal/luthier-database';
    private _model: BehaviorSubject<PortalLuthierDatabaseModel[]> = new BehaviorSubject(null);
    private _currentModel: PortalLuthierDatabaseModel[] = [];

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    private set model(value: Array<PortalLuthierDatabaseModel>)
    {
        this._currentModel = value;
        // Store the value
        this._model.next(value);
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get model$(): Observable<PortalLuthierDatabaseModel[]> {
        return this._model.asObservable();
    }

    getAll(): Observable<any>
    {
        return this._httpClient.get<PortalLuthierDatabaseModel[]>(`${this.baseRestUrl}/all`).pipe(
            tap((response: PortalLuthierDatabaseModel[]) =>
            {
                this.model = response;
            }),
        );
    }

    get(id: number) : Promise<PortalLuthierDatabaseModel> {
        return firstValueFrom(this._httpClient.get<PortalLuthierDatabaseModel>(`${this.baseRestUrl}/${id}`).pipe(
            switchMap((response: PortalLuthierDatabaseModel) => {
                return of(response);
            })));
    }

    save(model: PortalLuthierDatabaseModel) : Promise<PortalLuthierDatabaseModel> {
        return firstValueFrom(this._httpClient.post<PortalLuthierDatabaseModel>(`${this.baseRestUrl}`, model).pipe(
            switchMap((response: PortalLuthierDatabaseModel) => {
                if (UtilFunctions.isValidStringOrArray(this._currentModel) === false) {
                    this._currentModel = new Array<PortalLuthierDatabaseModel>();
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
}
