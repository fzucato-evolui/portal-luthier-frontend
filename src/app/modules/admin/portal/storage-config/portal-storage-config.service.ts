import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, firstValueFrom, Observable} from 'rxjs';
import {PortalStorageConfigModel} from 'app/shared/models/portal-storage-config.model';

@Injectable({
    providedIn: 'root'
})
export class PortalStorageConfigService {
    private readonly API_URL = '/api/admin/portal/storage-config';

    private _configs: BehaviorSubject<PortalStorageConfigModel[]> = new BehaviorSubject<PortalStorageConfigModel[]>([]);
    private _loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private _error: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    get configs$(): Observable<PortalStorageConfigModel[]> {
        return this._configs.asObservable();
    }

    get loading$(): Observable<boolean> {
        return this._loading.asObservable();
    }

    get error$(): Observable<string | null> {
        return this._error.asObservable();
    }

    constructor(private _httpClient: HttpClient) {}

    loadConfigs(): void {
        this._loading.next(true);
        this._error.next(null);

        this._httpClient.get<PortalStorageConfigModel[]>(`${this.API_URL}`)
            .subscribe({
                next: (users) => {
                    this._configs.next(users);
                    this._loading.next(false);
                },
                error: (error) => {
                    this._error.next('Erro ao carregar configurações');
                    this._loading.next(false);
                    console.error(error);
                }
            });
    }

    getConfig(id: number): Promise<PortalStorageConfigModel> {
        return firstValueFrom(this._httpClient.get<PortalStorageConfigModel>(`${this.API_URL}/${id}`));
    }

    saveConfig(config: PortalStorageConfigModel): Observable<PortalStorageConfigModel> {
        return this._httpClient.post<PortalStorageConfigModel>(this.API_URL, config);
    }

    deleteConfig(id: number): Observable<void> {
        return this._httpClient.delete<void>(`${this.API_URL}/${id}`);
    }
}
