import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, firstValueFrom, Observable, of, switchMap, tap} from 'rxjs';
import {PortalLicenseModel} from '../../../../shared/models/portal-license.model';
import {UtilFunctions} from '../../../../shared/util/util-functions';
import {LuthierDatabaseModel} from '../../../../shared/models/luthier.model';
import {UserModel} from '../../../../shared/models/user.model';


@Injectable({providedIn: 'root'})
export class PortalLicenseService
{
    private baseRestUrl = 'api/admin/portal/license';
    private _model: BehaviorSubject<PortalLicenseModel[]> = new BehaviorSubject(null);
    private _currentModel: PortalLicenseModel[] = [];

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    private set model(value: Array<PortalLicenseModel>)
    {
        this._currentModel = value;
        // Store the value
        this._model.next(value);
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get model$(): Observable<PortalLicenseModel[]> {
        return this._model.asObservable();
    }

    getAll(): Observable<any>
    {
        return this._httpClient.get<PortalLicenseModel[]>(`${this.baseRestUrl}/all`).pipe(
            tap((response: PortalLicenseModel[]) =>
            {
                this.model = response;
            }),
        );
    }

    get(id: number) : Promise<PortalLicenseModel> {
        return firstValueFrom(this._httpClient.get<PortalLicenseModel>(`${this.baseRestUrl}/${id}`).pipe(
            switchMap((response: PortalLicenseModel) => {
                return of(response);
            })));
    }

    save(model: PortalLicenseModel) : Promise<PortalLicenseModel> {
        return firstValueFrom(this._httpClient.post<PortalLicenseModel>(`${this.baseRestUrl}`, model).pipe(
            switchMap((response: PortalLicenseModel) => {
                if (UtilFunctions.isValidStringOrArray(this._currentModel) === false) {
                    this._currentModel = new Array<PortalLicenseModel>();
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

    getAllAllowedUsers() : Promise<Array<UserModel>> {
        return firstValueFrom(this._httpClient.get<Array<UserModel>>(`${this.baseRestUrl}/get-all-external-users`).pipe(
            switchMap((response: Array<UserModel>) => {
                return of(response);
            })));
    }

    getToken(id: number) : Promise<{token: string}> {
        return firstValueFrom(this._httpClient.get<{token: string}>(`${this.baseRestUrl}/get-token/${id}`).pipe(
            switchMap((response: {token: string}) => {
                return of(response);
            })));
    }

}
