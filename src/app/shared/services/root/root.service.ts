import {Injectable} from "@angular/core";
import {Observable} from "rxjs/internal/Observable";
import {RootModel} from "../../models/root.model";
import {BehaviorSubject, catchError, map, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {GoogleConfigModel, SystemConfigModelEnum} from '../../models/system-config.model';
import {UserModel} from '../../models/user.model';

@Injectable({providedIn: 'root'})
export class RootService {
    private _model: BehaviorSubject <RootModel> = new BehaviorSubject <RootModel>(new RootModel());
    constructor(private _httpClient: HttpClient) {

    }

    get model$(): Observable<RootModel>
    {
        return this._model.asObservable();
    }

    get googleConfig$(): Observable<GoogleConfigModel>
    {
      return this._model.asObservable().pipe(
        map(value => {
           const index = value.configs.findIndex(x => x.configType.toString() === SystemConfigModelEnum.GOOGLE.toString());
           if (index >= 0) {
             const c: GoogleConfigModel = value.configs[index].config as GoogleConfigModel;
             return c;
           }

          return null;
        })
      );
    }


    set user(model: UserModel) {
        const current = this._model.getValue();
        current.user = model;
        this._model.next(current);
    }


    get(): Observable<RootModel>
    {
        return this._httpClient.get<RootModel>('/api/public/root').pipe(
            tap((resp: RootModel) =>
            {
                this._model.next(resp);
            }),
            catchError(error => {
                console.error("pipe error", error);
                throw error;
            })

        );

        //return of(new RootModel())
    }

}
