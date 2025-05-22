import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { PortalUserStorageConfig, PortalUserStorageListModel } from '../../../../shared/models/portal-user-storage-config.model';
import { firstValueFrom, tap } from 'rxjs';
import { UserModel } from 'app/shared/models/user.model';

@Injectable({
    providedIn: 'root'
})
export class PortalUserStorageConfigService {
    private readonly API_URL = '/api/admin/portal/user-storage-config';

    private _users: BehaviorSubject<PortalUserStorageListModel[]> = new BehaviorSubject<PortalUserStorageListModel[]>([]);
    private _loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private _error: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    private _apiUserConfigsUrl = `/api/admin/portal/user-storage-config`;

    get users$(): Observable<PortalUserStorageListModel[]> {
        return this._users.asObservable();
    }

    get loading$(): Observable<boolean> {
        return this._loading.asObservable();
    }

    get error$(): Observable<string | null> {
        return this._error.asObservable();
    }

    constructor(private _httpClient: HttpClient) {}

    loadUsers(): void {
        this._loading.next(true);
        this._error.next(null);

        this._httpClient.get<PortalUserStorageListModel[]>(`${this.API_URL}/users`)
            .subscribe({
                next: (users) => {
                    this._users.next(users);
                    this._loading.next(false);
                },
                error: (error) => {
                    this._error.next('Erro ao carregar usuários');
                    this._loading.next(false);
                    console.error(error);
                }
            });
    }

    getUserConfigs(userId: number): Promise<PortalUserStorageConfig[]> {
        return this._httpClient.get<PortalUserStorageConfig[]>(`${this.API_URL}/user/${userId}/all`).toPromise();
    }

    saveConfig(config: PortalUserStorageConfig): Observable<PortalUserStorageConfig> {
        return this._httpClient.post<PortalUserStorageConfig>(this.API_URL, config);
    }

    activateConfig(id: number): Observable<void> {
        return this._httpClient.post<void>(`${this.API_URL}/${id}/activate`, {});
    }

    deleteConfig(id: number): Observable<void> {
        return this._httpClient.delete<void>(`${this.API_URL}/${id}`);
    }

    /**
     * Busca a lista de usuários sem configurações de armazenamento.
     *
     * @returns Observable com a lista de usuários
     */
    getUsersWithoutStorageConfigs(): Observable<UserModel[]> {
        this._loading.next(true);
        this._error.next(null);
        return this._httpClient.get<UserModel[]>(`${this._apiUserConfigsUrl}/users/without-config`).pipe(
            tap({
                next: () => this._loading.next(false),
                error: (error) => {
                    this._error.next('Erro ao carregar usuários sem configuração');
                    this._loading.next(false);
                    console.error(error);
                }
            })
        );
    }
} 