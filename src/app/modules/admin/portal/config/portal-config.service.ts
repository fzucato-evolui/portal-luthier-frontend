import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom, Observable, ReplaySubject} from 'rxjs';
import {tap} from 'rxjs/operators';
import {SystemConfigModel} from '../../../../shared/models/system-config.model';

@Injectable({
    providedIn: 'root'
})

export class PortalConfigService
{
    private _model: ReplaySubject<Array<SystemConfigModel>> = new ReplaySubject<Array<SystemConfigModel>>(1);
    private baseRestUrl = 'api/admin/portal/config';
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {

    }
   get model$(): Observable<Array<SystemConfigModel>>
   {
     return this._model.asObservable();
   }


    get(): Observable<Array<SystemConfigModel>>
    {
        return this._httpClient.get<Array<SystemConfigModel>>(`${this.baseRestUrl}`).pipe(
            tap((resp: Array<SystemConfigModel>) =>
            {
                this._model.next(resp);
            }),
        );

    }


    save(model: SystemConfigModel): Promise<SystemConfigModel>
    {
        return firstValueFrom(this._httpClient.post<SystemConfigModel>(this.baseRestUrl, model));

        //return of(new RootModel())
    }

}
