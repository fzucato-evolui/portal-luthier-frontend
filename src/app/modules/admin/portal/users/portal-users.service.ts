import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {RoleModel, UserModel} from '../../../../shared/models/user.model';

@Injectable({
    providedIn: 'root'
})
export class PortalUsersService {
    private _model$: BehaviorSubject<UserModel[]> = new BehaviorSubject<UserModel[]>([]);
    private _baseUrl = `/api/admin/portal/user`;

    constructor(private _httpClient: HttpClient) {}

    get model$(): Observable<UserModel[]> {
        return this._model$.asObservable();
    }

    getAll(): Observable<UserModel[]> {
        return this._httpClient.get<UserModel[]>(`${this._baseUrl}/list`).pipe(
            tap((response) => {
                this._model$.next(response);
            })
        );
    }
    getAllRoles(): Observable<RoleModel[]> {
        return this._httpClient.get<RoleModel[]>(`${this._baseUrl}/list-roles`);
    }

    getById(id: number): Observable<UserModel> {
        return this._httpClient.get<UserModel>(`${this._baseUrl}/${id}`);
    }

    create(user: UserModel): Observable<UserModel> {
        return this._httpClient.post<UserModel>(`${this._baseUrl}`, user).pipe(
            tap((response) => {
                const currentData = this._model$.value;
                this._model$.next([...currentData, response]);
            })
        );
    }

    update(user: UserModel): Observable<UserModel> {
        return this._httpClient.put<UserModel>(`${this._baseUrl}`, user).pipe(
            tap((response) => {
                const currentData = this._model$.value;
                const index = currentData.findIndex(item => item.id === response.id);
                if (index !== -1) {
                    currentData[index] = response;
                    this._model$.next([...currentData]);
                }
            })
        );
    }

    delete(id: number): Observable<void> {
        return this._httpClient.delete<void>(`${this._baseUrl}/${id}`).pipe(
            tap(() => {
                const currentData = this._model$.value;
                const index = currentData.findIndex(item => item.id === id);
                if (index !== -1) {
                    currentData.splice(index, 1);
                    this._model$.next([...currentData]);
                }
            })
        );
    }

    updateCurrentUser(user: UserModel): Observable<UserModel> {
        return this._httpClient.put<UserModel>(`${this._baseUrl}/update-current-user`, user);
    }
}
