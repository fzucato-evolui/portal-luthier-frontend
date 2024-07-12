import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, ReplaySubject} from 'rxjs';
import {UtilFunctions} from "../../util/util-functions";
import {catchError, switchMap} from "rxjs/operators";
import {of} from "rxjs/internal/observable/of";
import {RootService} from "../root/root.service";
import {UserModel} from '../../models/user.model';

export interface StorageChange {
    key: string;
    value: string;
    oldValue: string;
    storageArea: "localStorage" | "sessionStorage";
}

export interface StorageGetItem {
    key: string;
    storageArea: "localStorage" | "sessionStorage";
}
@Injectable({
    providedIn: 'root'
})
export class UserService
{
    private _storageChange$: ReplaySubject<StorageChange> = new ReplaySubject<StorageChange>(1)
    private _user: ReplaySubject<UserModel> = new ReplaySubject<UserModel>(1);
    private model: UserModel;
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, public rootService: RootService)
    {
        this.rootService.model$.subscribe(value => {
            this.user = value.user;
        })
    }

    get storageChange$(): Observable<StorageChange> {
        return this._storageChange$.asObservable();
    }
    set accessToken(token: string)
    {
        if (UtilFunctions.isValidStringOrArray(token) === true) {
            const oldValue = this.accessToken;
            localStorage.setItem('accessToken', token);
        }
        else {
            localStorage.removeItem('accessToken')
        }
        /*
        this._storageChange$.next({
            value: token,
            oldValue: oldValue,
            storageArea: 'sessionStorage',
            key: 'accessToken'
        });
         */
    }

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }
    set luthierDatabase(id: string)
    {
        const oldValue = this.luthierDatabase;
        if (UtilFunctions.isValidStringOrArray(id) === true) {
            sessionStorage.setItem('luthierDatabase', id);
        }
        else {
            sessionStorage.removeItem('luthierDatabase');
        }
        this._storageChange$.next({
            value: id,
            oldValue: oldValue,
            storageArea: 'sessionStorage',
            key: 'luthierDatabase'
        });
        /*
        const event = new StorageEvent('storage', {
            key: 'test',
            oldValue: oldValue,
            newValue: id

        });
        window.dispatchEvent(event);

         */
    }

    get luthierDatabase(): string
    {
        return sessionStorage.getItem('luthierDatabase') ?? '';
    }

    set dadosDatabase(id: string)
    {
        const oldValue = this.dadosDatabase;
        if (UtilFunctions.isValidStringOrArray(id) === true) {
            sessionStorage.setItem('dadosDatabase', id);
        }
        else {
            sessionStorage.removeItem('dadosDatabase');
        }
        this._storageChange$.next({
            value: id,
            oldValue: oldValue,
            storageArea: 'sessionStorage',
            key: 'dadosDatabase'
        });
    }

    get dadosDatabase(): string
    {
        return sessionStorage.getItem('dadosDatabase') ?? '';
    }
    set user(value: UserModel)
    {
        this.model = value;
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<UserModel>
    {
        //console.log(this.model);
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    hasAnyAuthority(authorities: any[], user: UserModel): boolean {
        if(authorities.length === 0 && UtilFunctions.isValidObject(user)) {
            return true;
        }

        for (let i = 0; i < authorities.length; i++) {
            if (UtilFunctions.isValidStringOrArray(user.authorities) === true && user.authorities.findIndex( x => x === authorities[i]) >= 0) {
                return true;
            }
        }
        return false;
    }

    signIn(credentials: UserModel): Observable<any>
    {

        return this._httpClient.post('/api/public/auth/login', credentials).pipe(
            switchMap((response: any) => {

                // Store the access token in the local storage
                this.accessToken = response.accessToken;

                // Store the user on the user service
                this.user = response.user;
                this.rootService.user = response.user;

                // Return a new observable with the response
                return of(response);
            })
        );
    }

    getLoggedUser(): Observable<UserModel>
    {
        // Renew token
        return this._httpClient.get('/api/public/auth/user').pipe(
            catchError(() =>

                // Return false
                of(null)
            ),
            switchMap((response: any) => {

                // Store the user on the user service
                this.user = response;

                // Return true
                return of(response);
            })
        );
    }

    signOut(): Observable<any>
    {
        // Remove the access token from the local storage
        this.accessToken = null;
        this.luthierDatabase = null;
        this.dadosDatabase = null;
        this.user = null;
        this.rootService.user = null;
        return of(true);
    }
}
