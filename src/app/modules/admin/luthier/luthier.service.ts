import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, firstValueFrom, Observable, of, switchMap, tap} from 'rxjs';
import {
    LuthierChangesOfTableModel,
    LuthierCheckObjectsSummaryModel,
    LuthierDatabaseModel,
    LuthierProjectModel,
    LuthierResourceModel,
    LuthierSubsystemModel,
    LuthierTableModel,
    LuthierUserGroupEnum,
    LuthierUserModel,
    LuthierViewModel,
    LuthierVisionDatasetModel,
    LuthierVisionModel
} from '../../../shared/models/luthier.model';
import {UtilFunctions} from '../../../shared/util/util-functions';
import {cloneDeep} from 'lodash-es';

@Injectable({providedIn: 'root'})
export class LuthierService
{
    private baseUrl = `api/admin/luthier`;
    private baseDicUrl = `${this.baseUrl}/dictionary`;
    private baseCommonUrl = `${this.baseUrl}/common`;
    private _project: BehaviorSubject<LuthierProjectModel> = new BehaviorSubject(null);
    private _currentProject: LuthierProjectModel;
    private _databases: BehaviorSubject<LuthierDatabaseModel[]> = new BehaviorSubject(null);
    private _currentDatabases: LuthierDatabaseModel[];
    private _tables: BehaviorSubject<LuthierTableModel[]> = new BehaviorSubject(null);
    private _visions: BehaviorSubject<LuthierVisionModel[]> = new BehaviorSubject(null);
    private _currentTables: LuthierTableModel[];
    private _currentVisions: LuthierVisionModel[];
    private _user: BehaviorSubject<LuthierUserModel> = new BehaviorSubject(null);
    private _currentUser: LuthierUserModel;
    private _users: BehaviorSubject<LuthierUserModel[]> = new BehaviorSubject(null);
    private _currentUsers: LuthierUserModel[];

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get hasProject(): boolean {
        return this._currentProject && UtilFunctions.isValidStringOrArray(this._currentProject.name) === true;
    }
    set project(value: LuthierProjectModel)
    {
        this._currentProject = value;
        // Store the value
        this._project.next(value);
    }
    get project$(): Observable<LuthierProjectModel>
    {
        return this._project.asObservable();
    }
    set user(value: LuthierUserModel)
    {
        this._currentUser = value;
        // Store the value
        this._user.next(value);
    }
    get user$(): Observable<LuthierUserModel>
    {
        return this._user.asObservable();
    }
    set users(value: LuthierUserModel[])
    {
        this._currentUsers = value;
        // Store the value
        this._users.next(value);
    }
    get users$(): Observable<LuthierUserModel[]>
    {
        return this._users.asObservable();
    }

    set databases(value: Array<LuthierDatabaseModel>)
    {
        this._currentDatabases = value;
        // Store the value
        this._databases.next(value);
    }
    get databases$(): Observable<LuthierDatabaseModel[]>
    {
        return this._databases.asObservable();
    }
    get currentDatabases(): Array<LuthierDatabaseModel>
    {
        return this._currentDatabases;
    }

    set tables(value: Array<LuthierTableModel>)
    {
        this._currentTables = value;
        // Store the value
        this._tables.next(value);
    }
    get tables$(): Observable<LuthierTableModel[]>
    {
        return this._tables.asObservable();
    }

    set visions(value: Array<LuthierVisionModel>)
    {
        this._currentVisions = value;
        // Store the value
        this._visions.next(value);
    }
    get visions$(): Observable<LuthierVisionModel[]>
    {
        return this._visions.asObservable();
    }

    getProject(): Observable<any>
    {
        this.tables = [];
        this.project = null;
        return this._httpClient.get<LuthierProjectModel>(`${this.baseCommonUrl}/project`).pipe(

            tap((response: LuthierProjectModel) =>
            {
                this.project = response;
            }),
            catchError(error => {
                // Handle the error and return a fallback value or rethrow the error
                this.project = null;
                return of('Fallback value');
            })
        );
    }
    saveProject(model: LuthierProjectModel): Promise<LuthierProjectModel> {
        return firstValueFrom(this._httpClient.post<LuthierProjectModel>(`${this.baseCommonUrl}/project`, model).pipe(
            switchMap((response: LuthierProjectModel) => {
                if (UtilFunctions.isValidStringOrArray(this._currentDatabases) === false) {
                    this._currentDatabases = new Array<LuthierDatabaseModel>();
                }
                const mainDatabase = cloneDeep(response);
                mainDatabase.code = -1;
                const index = this._currentDatabases.findIndex(x => x.code === -1);
                if (index < 0) {
                    this._currentDatabases.push(mainDatabase);
                } else {
                    this._currentDatabases[index] = mainDatabase;
                }
                this.databases = this._currentDatabases;
                this.project = response;
                // Return a new observable with the response
                return of(response);
            })));
    }
    getDatabases(): Observable<any>
    {
        this.databases = [];
        return this._httpClient.get<LuthierDatabaseModel[]>(`${this.baseCommonUrl}/all-databases`).pipe(

            tap((response: LuthierDatabaseModel[]) =>
            {
                this.databases = response;
            }),
            catchError(error => {
                // Handle the error and return a fallback value or rethrow the error
                this.databases = [];
                return of('Fallback value');
            })
        );
    }
    getUsers(): Observable<any>
    {
        return this._httpClient.get<LuthierUserModel[]>(`${this.baseCommonUrl}/all-users`).pipe(

            tap((response: LuthierUserModel[]) =>
            {
                this.users = response;
            }),
            catchError(error => {
                // Handle the error and return a fallback value or rethrow the error
                this.project = null;
                return of('Fallback value');
            })
        );
    }

    saveDatabase(model: LuthierDatabaseModel): Promise<LuthierDatabaseModel> {
        return firstValueFrom(this._httpClient.post<LuthierDatabaseModel>(`${this.baseCommonUrl}/database`, model).pipe(
            switchMap((response: LuthierDatabaseModel) => {
                if (UtilFunctions.isValidStringOrArray(this._currentDatabases) === false) {
                    this._currentDatabases = new Array<LuthierDatabaseModel>();
                }
                if (model.code && model.code > 0) {
                    const index = this._currentDatabases.findIndex(x => x.code === model.code);
                    if (index < 0) {
                        this._currentDatabases.push(response);
                    } else {
                        this._currentDatabases[index] = response;
                    }
                } else {
                    this._currentDatabases.push(response);
                }
                this.databases = this._currentDatabases;
                // Return a new observable with the response
                return of(response);
            })));
    }
    deleteDatabase(id: number): Promise<any>  {
        return firstValueFrom(this._httpClient.delete<any>(`${this.baseCommonUrl}/database/${id}`).pipe(
            switchMap((response) => {
                const index = this._currentDatabases.findIndex(x => x.code === id);
                if (index >= 0) {
                    this._currentDatabases.splice(index, 1);
                    this.databases = this._currentDatabases;
                }
                // Return a new observable with the response
                return of(response);
            })));
    }

    saveUser(model: LuthierUserModel): Promise<LuthierUserModel> {
        return firstValueFrom(this._httpClient.post<LuthierUserModel>(`${this.baseCommonUrl}/user`, model).pipe(
            switchMap((response: LuthierUserModel) => {
                if (UtilFunctions.isValidStringOrArray(this._users) === false) {
                    this._currentUsers = new Array<LuthierUserModel>();
                }
                if (model.code && model.code > 0) {
                    const index = this._currentUsers.findIndex(x => x.code === model.code);
                    if (index < 0) {
                        this._currentUsers.push(response);
                    } else {
                        this._currentUsers[index] = response;
                    }
                } else {
                    this._currentUsers.push(response);
                }
                if (response.group === LuthierUserGroupEnum.USER) {
                    this._currentUsers.forEach((user,index) => {
                        if (user.group === LuthierUserGroupEnum.GROUP) {
                            const indexUser = UtilFunctions.isValidStringOrArray(user.users) === true ? user.users.findIndex(x => x.user.code === response.code) : -1;
                            if (indexUser >= 0) {
                                if (UtilFunctions.isValidStringOrArray(response.groups) === false) {
                                    this._currentUsers[index].users.splice(indexUser, 1);
                                }
                                else {
                                    response.groups.forEach(x => {
                                        if (this._currentUsers[index].code === x.group.code) {
                                            this._currentUsers[index].users.push({user: response});
                                        }
                                    })
                                }
                            }
                            else {
                                if (UtilFunctions.isValidStringOrArray(response.groups) === true) {
                                    response.groups.forEach(x => {
                                        if (this._currentUsers[index].code === x.group.code) {
                                            this._currentUsers[index].users.push({user: response});
                                        }
                                    })
                                }

                            }
                        }
                    })
                }
                else if (response.group === LuthierUserGroupEnum.GROUP) {
                    this._currentUsers.forEach((user,index) => {
                        if (user.group === LuthierUserGroupEnum.USER) {
                            const indexGroup = UtilFunctions.isValidStringOrArray(user.groups) === true ? user.groups.findIndex(x => x.group.code === response.code) : -1;
                            if (indexGroup >= 0) {
                                if (UtilFunctions.isValidStringOrArray(response.users) === false) {
                                    this._currentUsers[index].groups.splice(indexGroup, 1);
                                }
                                else {
                                    response.users.forEach(x => {
                                        if (this._currentUsers[index].code === x.user.code) {
                                            this._currentUsers[index].groups.push({group: response});
                                        }
                                    })
                                }
                            }
                            else {
                                if (UtilFunctions.isValidStringOrArray(response.users) === true) {
                                    response.users.forEach(x => {
                                        if (this._currentUsers[index].code === x.user.code) {
                                            this._currentUsers[index].groups.push({group: response});
                                        }
                                    })
                                }

                            }
                        }
                    })
                }
                this.users = this._currentUsers;
                // Return a new observable with the response
                return of(response);
            })));
    }
    deleteUser(id: number): Promise<any>  {
        return firstValueFrom(this._httpClient.delete<any>(`${this.baseCommonUrl}/user/${id}`).pipe(
            switchMap((response) => {
                const index = this._currentUsers.findIndex(x => x.code === id);
                if (index >= 0) {
                    response = this._currentUsers[index];
                    if (response.group === LuthierUserGroupEnum.USER) {
                        this._currentUsers.forEach((user,index) => {
                            if (user.group === LuthierUserGroupEnum.GROUP) {
                                const indexUser = UtilFunctions.isValidStringOrArray(user.users) === true ? user.users.findIndex(x => x.user.code === response.code) : -1;
                                if (indexUser >= 0) {
                                    this._currentUsers[index].users.splice(indexUser, 1);
                                }
                            }
                        })
                    }
                    else if (response.group === LuthierUserGroupEnum.GROUP) {
                        this._currentUsers.forEach((user,index) => {
                            if (user.group === LuthierUserGroupEnum.USER) {
                                const indexGroup = UtilFunctions.isValidStringOrArray(user.groups) === true ? user.groups.findIndex(x => x.group.code === response.code) : -1;
                                if (indexGroup >= 0) {
                                    this._currentUsers[index].groups.splice(indexGroup, 1);
                                }
                            }
                        })
                    }

                    this._currentUsers.splice(index, 1);
                    this.users = this._currentUsers;
                }
                // Return a new observable with the response
                return of(response);
            })));
    }

    getTables(): Observable<any>
    {
        this._tables.next([]);
        return this._httpClient.get<LuthierTableModel[]>(`${this.baseDicUrl}/all-tables`).pipe(
            tap((response: LuthierTableModel[]) =>
            {
                this.tables = response;
            }),
        );
    }

    getVisions(): Observable<any>
    {
        this._visions.next([]);
        return this._httpClient.get<LuthierVisionModel[]>(`${this.baseDicUrl}/all-visions`).pipe(
            tap((response: LuthierVisionModel[]) =>
            {
                this.visions = response;
            }),
        );
    }

    getTable(id: number): Promise<LuthierTableModel> {

        return firstValueFrom(this._httpClient.get<LuthierTableModel>(`${this.baseDicUrl}/table/${id}`));
    }

    getVision(id: number): Promise<LuthierVisionModel> {
        return firstValueFrom(this._httpClient.get<LuthierVisionModel>(`${this.baseDicUrl}/vision/${id}`));
    }
    getUser(id: number): Promise<LuthierUserModel> {
        return firstValueFrom(this._httpClient.get<LuthierUserModel>(`${this.baseCommonUrl}/user/${id}`));
    }
    getVisionChildreen(id: number): Promise<LuthierVisionDatasetModel[]> {
        return firstValueFrom(this._httpClient.get<LuthierVisionDatasetModel[]>(`${this.baseDicUrl}/vision-childreen/${id}`));
    }
    checkUser(): Observable<LuthierUserModel> {
        return this._httpClient.put<LuthierUserModel>(`${this.baseCommonUrl}/check-user`, null).pipe(
            tap((response: LuthierUserModel) =>
            {
                this.user = response;
            }),
        );
    }
    getDataset(id: number): Promise<LuthierVisionDatasetModel> {

        return firstValueFrom(this._httpClient.get<LuthierVisionDatasetModel>(`${this.baseDicUrl}/dataset/${id}`));
    }
    parseView(name: string, model: LuthierViewModel): Promise<LuthierTableModel> {
        return firstValueFrom(this._httpClient.post<LuthierTableModel>(`${this.baseDicUrl}/parse-view/${name}`, model));
    }

    saveTable(model: LuthierTableModel): Promise<LuthierTableModel> {
        return firstValueFrom(this._httpClient.post<LuthierTableModel>(`${this.baseDicUrl}/table`, model).pipe(
            switchMap((response: LuthierTableModel) => {
                if (UtilFunctions.isValidStringOrArray(this._currentTables) === false) {
                    this._currentTables = new Array<LuthierTableModel>();
                }
                if (model.code && model.code > 0) {
                    const index = this._currentTables.findIndex(x => x.code === model.code);
                    if (index < 0) {
                        this._currentTables.push(response);
                    } else {
                        this._currentTables[index] = response;
                    }
                } else {
                    this._currentTables.push(response);
                    this._currentTables.sort((a, b) => {
                        return a.name.localeCompare(b.name);
                    });
                }
                this.tables = this._currentTables;
                // Return a new observable with the response
                return of(response);
            })));
    }

    deleteTable(id: number): Promise<any>  {
        return firstValueFrom(this._httpClient.delete<LuthierTableModel>(`${this.baseDicUrl}/table/${id}`).pipe(
            switchMap((response: LuthierTableModel) => {
                const index = this._currentTables.findIndex(x => x.code === id);
                if (index >= 0) {
                    this._currentTables.splice(index, 1);
                    this.tables = this._currentTables;
                }
                // Return a new observable with the response
                return of(response);
            })));
    }

    saveVision(model: LuthierVisionModel): Promise<LuthierVisionModel> {
        return firstValueFrom(this._httpClient.post<LuthierVisionModel>(`${this.baseDicUrl}/vision`, model).pipe(
            switchMap((response: LuthierVisionModel) => {
                if (UtilFunctions.isValidStringOrArray(this._currentVisions) === false) {
                    this._currentVisions = new Array<LuthierVisionModel>();
                }
                if (model.code && model.code > 0) {
                    const index = this._currentVisions.findIndex(x => x.code === model.code);
                    if (index < 0) {
                        this._currentVisions.push(response);
                    } else {
                        this._currentVisions[index] = response;
                    }
                } else {
                    this._currentVisions.push(response);
                    this._currentVisions.sort((a, b) => {
                        return a.name.localeCompare(b.name);
                    });

                }
                this.visions = this._currentVisions;
                return of(response);
            })));
    }

    deleteVision(id: number): Promise<any>  {
        return firstValueFrom(this._httpClient.delete<any>(`${this.baseDicUrl}/vision/${id}`).pipe(
            switchMap((response: any) => {
                const index = this._currentVisions.findIndex(x => x.code === id);
                if (index >= 0) {
                    this._currentVisions.splice(index, 1);
                    this.visions = this._currentVisions;
                }
                // Return a new observable with the response
                return of(response);
            })));
    }

    saveDataset(model: LuthierVisionDatasetModel): Promise<LuthierVisionDatasetModel> {
        return firstValueFrom(this._httpClient.post<LuthierVisionDatasetModel>(`${this.baseDicUrl}/dataset`, model).pipe(
            switchMap((response: LuthierVisionDatasetModel) => {
                if (UtilFunctions.isValidStringOrArray(this._currentVisions) === false) {
                    this._currentVisions = new Array<LuthierVisionModel>();
                }
                const indexVision = this._currentVisions.findIndex(x => x.code === response.vision.code);
                if (UtilFunctions.isValidStringOrArray(this._currentVisions[indexVision].children) === false) {
                    this._currentVisions[indexVision].children = new Array<LuthierVisionDatasetModel>();
                }
                let parent: {model: LuthierVisionDatasetModel, index: number} = null;
                if (response.parent && UtilFunctions.isValidStringOrArray(response.parent.code) === true) {
                    parent = this.getDatasetByCode(response.parent.code, this._currentVisions[indexVision]);
                    if (UtilFunctions.isValidStringOrArray(parent.model.children) === false) {
                        parent.model.children = new Array<LuthierVisionDatasetModel>();
                    }
                }
                if (model.code && model.code > 0) {
                    if (parent === null) {
                        //Tinha pai e agora nao tem mais, precisa remover do antigo
                        if (model.parent && UtilFunctions.isValidStringOrArray(model.parent.code)) {
                            const oldParent = this.getDatasetByCode(model.parent.code, this._currentVisions[indexVision]);
                            oldParent.model.children.splice(oldParent.index, 1);
                            this._currentVisions[indexVision].children.push(response);
                        }
                        // Continua sendo filho da visao
                        else {
                            const indexDataset = this._currentVisions[indexVision].children.findIndex(x => x.code === model.code);
                            this._currentVisions[indexVision].children[indexDataset] = response;
                        }
                        this._currentVisions[indexVision].children.sort((a, b) => {
                            return a.name.localeCompare(b.name);
                        });

                    } else {
                        //Tinha pai e permanece tendo
                        if (model.parent && UtilFunctions.isValidStringOrArray(model.parent.code)) {
                            // Continua com o mesmo pai
                            if (model.parent.code === parent.model.code) {
                                parent.model.children[parent.index] = response
                            }
                            // Mudou de pai. , precisa remover do antigo
                            else {
                                const oldParent = this.getDatasetByCode(model.parent.code, this._currentVisions[indexVision]);
                                oldParent.model.children.splice(oldParent.index, 1);
                                parent.model.children.push(response);
                            }
                        }
                        // Não tinha pai, mas agora tem. Precisa apagar da visão
                        else {
                            const indexDataset = this._currentVisions[indexVision].children.findIndex(x => x.code === model.code);
                            this._currentVisions[indexVision].children.splice(indexDataset, 1);
                            parent.model.children.push(response);
                        }
                        parent.model.children.sort((a, b) => {
                            return a.name.localeCompare(b.name);
                        });
                    }
                }
                else {
                    if (parent === null) {
                        this._currentVisions[indexVision].children.push(response);
                        this._currentVisions[indexVision].children.sort((a, b) => {
                            return a.name.localeCompare(b.name);
                        });
                    } else {
                        parent.model.children.push(response);
                        parent.model.children.sort((a, b) => {
                            return a.name.localeCompare(b.name);
                        });
                    }
                }
                this.visions = this._currentVisions;
                return of(response);
            })));
    }

    deleteDataset(model: LuthierVisionDatasetModel, vision: LuthierVisionModel): Promise<any>  {
        return firstValueFrom(this._httpClient.delete<any>(`${this.baseDicUrl}/dataset/${model.code}`).pipe(
            switchMap((response: any) => {
                const indexVision = this._currentVisions.findIndex(x => x.code === vision.code);
                let parent = this.getDatasetByCode(model.code, this._currentVisions[indexVision], true);
                parent.model.children.splice(parent.index, 1);
                this.visions = this._currentVisions;
                // Return a new observable with the response
                return of(response);
            })));
    }

    getImagesResources(): Promise<LuthierResourceModel[]> {

        return firstValueFrom(this._httpClient.get<LuthierResourceModel[]>(`${this.baseCommonUrl}/get-images-resources`));
    }

    getActiveSubsystems(): Promise<LuthierSubsystemModel[]> {

        return firstValueFrom(this._httpClient.get<LuthierSubsystemModel[]>(`${this.baseCommonUrl}/get-active-subsystems`));
    }

    syncSchemas(): Promise<any> {
        return firstValueFrom(this._httpClient.patch<any>(`${this.baseDicUrl}/sync-schemas`, null));
    }

    checkObjects(): Promise<LuthierCheckObjectsSummaryModel> {
        return firstValueFrom(this._httpClient.patch<LuthierCheckObjectsSummaryModel>(`${this.baseDicUrl}/check-objects`, null));
    }

    checkObjectsTableChanges(id: String, tableName: String): Promise<LuthierChangesOfTableModel> {
        return firstValueFrom(this._httpClient.get<LuthierChangesOfTableModel>(`${this.baseDicUrl}/check-objects-changes/${id}/${tableName}`));
    }

    checkObjectsAllChanges(id: String): Promise<LuthierCheckObjectsSummaryModel> {
        return firstValueFrom(this._httpClient.get<LuthierCheckObjectsSummaryModel>(`${this.baseDicUrl}/check-objects-changes/${id}`));
    }

    checkObjectsDeleteChanges(id: String): Promise<any> {
        return firstValueFrom(this._httpClient.delete<LuthierChangesOfTableModel>(`${this.baseDicUrl}/check-objects-changes/${id}`));
    }

    getJSON(jsonName: string): Promise<any> {
        return firstValueFrom(this._httpClient.get<any>(`assets/json/${jsonName}`));
    }

    getDatasetByCode(code: number, parent: LuthierVisionDatasetModel | LuthierVisionModel, returnParent?: boolean ): {model :LuthierVisionDatasetModel, index: number} {
        if (UtilFunctions.isValidStringOrArray(parent.children) === true) {
            let index = parent.children.findIndex(x => x.code === code);
            if (index < 0) {
                for (let child of parent.children) {
                    const dataset = this.getDatasetByCode(code, child, returnParent);
                    if (dataset != null) {
                        return dataset;
                    }
                }
            }
            else {
                if (!returnParent) {
                    return {model: parent.children[index], index: index};
                }
                else {
                    return {model: parent, index: index};
                }
            }
        }
        else {
            return null;
        }
    }

}
