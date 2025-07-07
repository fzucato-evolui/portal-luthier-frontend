import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, ReplaySubject} from 'rxjs';
import {UtilFunctions} from "../../util/util-functions";
import {catchError, switchMap} from "rxjs/operators";
import {of} from "rxjs/internal/observable/of";
import {RootService} from "../root/root.service";
import {RoleTypeEnum, UserConfigModel, UserModel} from '../../models/user.model';

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
    set luthierDatabase(id: string)
    {
        const oldValue = this.luthierDatabase;
        if (UtilFunctions.isValidStringOrArray(id) === true) {
            sessionStorage.setItem('luthierDatabase', id);
        }
        else {
            sessionStorage.removeItem('luthierDatabase');
            this.dadosDatabase = null;
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
    get user(): UserModel {
        return this.model;
    }

    get user$(): Observable<UserModel>
    {
        //console.log(this.model);
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Check if the current user has a specific role by name.
     * @param roleName The name of the role to check.
     * @returns boolean - True if the user has the role, false otherwise.
     */
    userHasRole(roleName: string): boolean {
        // If model or roles are not valid, user has no roles
        if (!UtilFunctions.isValidObject(this.model) || !Array.isArray(this.model.roles)) {
             return false;
        }
        return this.model.roles.some(role => role.name === roleName);
    }

    /**
     * Find the highest hierarchical role level for the current user.
     * @returns number | undefined - The highest hierarchy level or undefined if no hierarchical roles.
     */
    getUserHighestHierarchyLevel(): number | undefined {
        // If model or roles are not valid, user has no roles
        if (!UtilFunctions.isValidObject(this.model) || !Array.isArray(this.model.roles)) {
             return undefined;
        }
        const hierarchicalRoles = this.model.roles.filter(role => role.type === RoleTypeEnum.HIERARCHICAL);
        if (hierarchicalRoles.length === 0) {
            return undefined;
        }
        // Assuming higher number means higher level
        return Math.max(...hierarchicalRoles.map(role => role.hierarchyLevel || 0));
    }

    hasAnyAuthority(authorities: string[]): boolean {
        // Check if authorities array is empty or model is invalid
        if (authorities.length === 0 && UtilFunctions.isValidObject(this.model)) {
            return true;
        }

        // If model or roles are not valid, user has no authorities to check against
        if (!UtilFunctions.isValidObject(this.model) || !Array.isArray(this.model.roles)) {
             return false;
        }

        // Check if the user has any of the provided authorities (role names)
        for (const authorityName of authorities) {
            if (this.userHasRole(authorityName)) { // Use the new helper method
                return true;
            }
        }

        return false;
    }

    signIn(credentials: UserModel): Observable<any>
    {

        return this._httpClient.post('/api/public/auth/login', credentials).pipe(
            switchMap((response: any) => {

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
        return this._httpClient.post('/api/public/auth/logoff', null).pipe(
            switchMap((response: any) => {

                // Remove the access token from the local storage
                this.luthierDatabase = null;
                this.dadosDatabase = null;
                this.user = null;
                this.rootService.user = null;

                // Return a new observable with the response
                return of(response);
            })
        );

    }

    saveConfig(config: UserConfigModel): Observable<UserModel>
    {
        return this._httpClient.post<UserModel>('/api/admin/portal/user/config', config).pipe(
            switchMap((response: UserModel) => {

                this.user = response;
                this.rootService.user = response;

                // Return a new observable with the response
                return of(response);
            })
        );

    }
}
