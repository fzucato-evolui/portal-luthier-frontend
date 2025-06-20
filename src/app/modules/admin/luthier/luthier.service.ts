import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, firstValueFrom, Observable, of, switchMap, tap} from 'rxjs';
import {
    LedImportModel,
    LpxImportModel,
    LupImportModel,
    LuthierChangesOfProcedureModel,
    LuthierChangesOfTableModel,
    LuthierCheckObjectsProcedureSummaryModel,
    LuthierCheckObjectsSummaryModel,
    LuthierCheckObjectsTableSummaryModel,
    LuthierDatabaseModel,
    LuthierGenerateLoadXMLModel,
    LuthierLayoutControlModel,
    LuthierMenuModel,
    LuthierMenuTreeModel,
    LuthierMessageTypeModel,
    LuthierModuleModel,
    LuthierParameterModel,
    LuthierProcedureModel,
    LuthierProjectModel,
    LuthierReportModel,
    LuthierResourceModel,
    LuthierScriptTableModel,
    LuthierSemaphoreModel,
    LuthierSubsystemModel,
    LuthierTableHelpModel,
    LuthierTableModel,
    LuthierUserGroupEnum,
    LuthierUserModel,
    LuthierViewModel,
    LuthierVisionDatasetModel,
    LuthierVisionModel
} from '../../../shared/models/luthier.model';
import {UtilFunctions} from '../../../shared/util/util-functions';
import {cloneDeep} from 'lodash-es';
import {PortalHistoryPersistTypeEnum} from '../../../shared/models/portal_luthier_history.model';
import {UserService} from '../../../shared/services/user/user.service';
import {AsyncRequestModel} from '../../../shared/models/async_request.model';
import {FilterModel, FilterRequestModel} from '../../../shared/models/filter.model';

@Injectable({providedIn: 'root'})
export class LuthierService
{
    private baseUrl = `api/admin/luthier`;
    private baseDicUrl = `${this.baseUrl}/dictionary`;
    private baseManagerUrl = `${this.baseUrl}/manager`;
    private baseCommonUrl = `${this.baseUrl}/common`;
    private _project: BehaviorSubject<LuthierProjectModel> = new BehaviorSubject(null);
    private _currentProject: LuthierProjectModel;
    private _databases: BehaviorSubject<LuthierDatabaseModel[]> = new BehaviorSubject(null);
    private _currentDatabases: LuthierDatabaseModel[];
    private _tables: BehaviorSubject<LuthierTableModel[]> = new BehaviorSubject(null);
    private _visions: BehaviorSubject<LuthierVisionModel[]> = new BehaviorSubject(null);
    private _procedures: BehaviorSubject<LuthierProcedureModel[]> = new BehaviorSubject(null);
    private _currentTables: LuthierTableModel[];
    private _currentVisions: LuthierVisionModel[];
    private _currentProcedures: LuthierProcedureModel[];
    private _user: BehaviorSubject<LuthierUserModel> = new BehaviorSubject(null);
    private _currentUser: LuthierUserModel;
    private _users: BehaviorSubject<LuthierUserModel[]> = new BehaviorSubject(null);
    private _currentUsers: LuthierUserModel[];
    private _resources: BehaviorSubject<LuthierResourceModel[]> = new BehaviorSubject(null);
    private _currentResources: LuthierResourceModel[];
    private _modules: BehaviorSubject<LuthierModuleModel[]> = new BehaviorSubject(null);
    private _currentModules: LuthierModuleModel[];
    private _subsystems: BehaviorSubject<LuthierSubsystemModel[]> = new BehaviorSubject(null);
    private _currentSubsystems: LuthierSubsystemModel[];
    private _parameters: BehaviorSubject<LuthierParameterModel[]> = new BehaviorSubject(null);
    private _currentParameters: LuthierParameterModel[];
    private _semaphores: BehaviorSubject<LuthierSemaphoreModel[]> = new BehaviorSubject(null);
    private _currentSemaphores: LuthierSemaphoreModel[];
    private _menus: BehaviorSubject<LuthierMenuModel[]> = new BehaviorSubject(null);
    private _currentMenus: LuthierMenuModel[];
    private _menuTree: BehaviorSubject<LuthierMenuTreeModel> = new BehaviorSubject(null);
    private _menuChanged: BehaviorSubject<{menu: LuthierMenuModel, persistType: PortalHistoryPersistTypeEnum}> = new BehaviorSubject(null);
    private _subsystemChanged: BehaviorSubject<{subsystem: LuthierSubsystemModel, persistType: PortalHistoryPersistTypeEnum}> = new BehaviorSubject(null);
    private _currentMenuTree: LuthierMenuTreeModel;
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private authService: UserService)
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
    set procedures(value: Array<LuthierProcedureModel>)
    {
        this._currentProcedures = value;
        // Store the value
        this._procedures.next(value);
    }
    get procedures$(): Observable<LuthierProcedureModel[]>
    {
        return this._procedures.asObservable();
    }
    set resources(value: LuthierResourceModel[])
    {
        this._currentResources = value;
        // Store the value
        this._resources.next(value);
    }
    get resources$(): Observable<LuthierResourceModel[]>
    {
        return this._resources.asObservable();
    }
    set modules(value: LuthierModuleModel[])
    {
        this._currentModules = value;
        // Store the value
        this._modules.next(value);
    }
    get modules$(): Observable<LuthierModuleModel[]>
    {
        return this._modules.asObservable();
    }
    set subsystems(value: LuthierSubsystemModel[])
    {
        this._currentSubsystems = value;
        // Store the value
        this._subsystems.next(value);
    }
    get subsystems$(): Observable<LuthierSubsystemModel[]>
    {
        return this._subsystems.asObservable();
    }
    set parameters(value: LuthierParameterModel[])
    {
        this._currentParameters = value;
        // Store the value
        this._parameters.next(value);
    }
    get parameters$(): Observable<LuthierParameterModel[]>
    {
        return this._parameters.asObservable();
    }
    set semaphores(value: LuthierSemaphoreModel[])
    {
        this._currentSemaphores = value;
        // Store the value
        this._semaphores.next(value);
    }
    get semaphores$(): Observable<LuthierSemaphoreModel[]>
    {
        return this._semaphores.asObservable();
    }
    set menus(value: LuthierMenuModel[])
    {
        this._currentMenus = value;
        // Store the value
        this._menus.next(value);
    }
    get menus$(): Observable<LuthierMenuModel[]>
    {
        return this._menus.asObservable();
    }
    set menuTree(value: LuthierMenuTreeModel)
    {
        this._currentMenuTree = value;
        // Store the value
        this._menuTree.next(value);
    }
    get menuTree$(): Observable<LuthierMenuTreeModel>
    {
        return this._menuTree.asObservable();
    }
    get subsystemChanged$(): Observable<{ subsystem: LuthierSubsystemModel; persistType: PortalHistoryPersistTypeEnum }> {
        return this._subsystemChanged.asObservable();
    }
    get menuChanged$(): Observable<{ menu: LuthierMenuModel; persistType: PortalHistoryPersistTypeEnum }> {
        return this._menuChanged.asObservable();
    }

    getProject(): Observable<any>
    {
        this.tables = [];
        this.procedures = [];
        this.visions = [];
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
        this.procedures = [];
        this.tables = [];
        this.visions = [];

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
                response.forEach(vision => {
                    this.sortVisionChildren(vision);
                })
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
    getProcedure(id: number): Promise<LuthierProcedureModel> {

        return firstValueFrom(this._httpClient.get<LuthierProcedureModel>(`${this.baseDicUrl}/procedure/${id}`));
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
                        response.children = this._currentVisions[index].children;
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
                response.children = model.children;
                if (UtilFunctions.isValidStringOrArray(this._currentVisions) === false) {
                    this._currentVisions = new Array<LuthierVisionModel>();
                }
                const indexVision = this._currentVisions.findIndex(x => x.code === response.vision.code);
                if (UtilFunctions.isValidStringOrArray(this._currentVisions[indexVision].children) === false) {
                    this._currentVisions[indexVision].children = new Array<LuthierVisionDatasetModel>();
                }
                let parent: {model: LuthierVisionDatasetModel, index: number} = null;
                let oldParent = this.getDatasetByCode(response.code, this._currentVisions[indexVision], true);
                if (response.parent && UtilFunctions.isValidStringOrArray(response.parent.code) === true) {
                    parent = this.getDatasetByCode(response.parent.code, this._currentVisions[indexVision]);
                    if (UtilFunctions.isValidStringOrArray(parent.model.children) === false) {
                        parent.model.children = new Array<LuthierVisionDatasetModel>();
                    }
                }
                if (model.code && model.code > 0) {
                    if (parent === null) {
                        //Tinha pai e agora nao tem mais, precisa remover do antigo
                        if (oldParent != null) {
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
                        if (oldParent != null) {
                            // Continua com o mesmo pai
                            if (oldParent.model.code === parent.model.code) {
                                const index = parent.model.children.findIndex(child => child.code === model.code);
                                parent.model.children[index] = response
                            }
                            // Mudou de pai. , precisa remover do antigo
                            else {
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

    getResources(images?: boolean): Observable<LuthierResourceModel[]> {

        this._resources.next([]);
        if (!images) {
            return this._httpClient.get<LuthierResourceModel[]>(`${this.baseCommonUrl}/all-resources`).pipe(
                tap((response: LuthierResourceModel[]) => {
                    this.resources = response;
                }),
            );
        }
        else {
            return this._httpClient.get<LuthierResourceModel[]>(`${this.baseCommonUrl}/get-images-resources`).pipe(
                tap((response: LuthierResourceModel[]) => {
                    this.resources = response;
                }),
            );
        }
    }
    getResource(id: number): Promise<any> {
        return firstValueFrom(this._httpClient.get(`${this.baseCommonUrl}/resource/${id}`));
    }
    deleteResource(id: number): Promise<any>  {
        return firstValueFrom(this._httpClient.delete<any>(`${this.baseCommonUrl}/resource/${id}`).pipe(
            switchMap((response) => {
                const index = this._currentResources.findIndex(x => x.code === id);
                if (index >= 0) {
                    this._currentResources.splice(index, 1);
                    this.resources = this._currentResources;
                }
                // Return a new observable with the response
                return of(response);
            })));
    }
    saveResource(model: LuthierResourceModel): Promise<LuthierResourceModel> {
        return firstValueFrom(this._httpClient.post<LuthierResourceModel>(`${this.baseCommonUrl}/resource`, model).pipe(
            switchMap((response: LuthierResourceModel) => {
                if (UtilFunctions.isValidStringOrArray(this._currentResources) === false) {
                    this._currentResources = new Array<LuthierResourceModel>();
                }
                if (model.code && model.code > 0) {
                    const index = this._currentResources.findIndex(x => x.code === model.code);
                    if (index < 0) {
                        this._currentResources.push(response);
                    } else {
                        this._currentResources[index] = response;
                    }
                } else {
                    this._currentResources.push(response);
                }
                this.resources = this._currentResources;
                // Return a new observable with the response
                return of(response);
            })));
    }

    getModules(): Observable<LuthierModuleModel[]> {

        this._modules.next([]);
        return this._httpClient.get<LuthierModuleModel[]>(`${this.baseCommonUrl}/all-modules`).pipe(
            tap((response: LuthierModuleModel[]) =>
            {
                this.modules = response;
            }),
        );
    }
    getModule(id: number): Promise<any> {
        return firstValueFrom(this._httpClient.get(`${this.baseCommonUrl}/module/${id}`));
    }
    deleteModule(id: number): Promise<any>  {
        return firstValueFrom(this._httpClient.delete<any>(`${this.baseCommonUrl}/module/${id}`).pipe(
            switchMap((response) => {
                const index = this._currentModules.findIndex(x => x.code === id);
                if (index >= 0) {
                    this._currentModules.splice(index, 1);
                    const children = this._currentModules.filter(x => x.parent?.code === id);
                    children.forEach(x => x.parent = null);
                    this.modules = this._currentModules;
                }
                // Return a new observable with the response
                return of(response);
            })));
    }
    saveModule(model: LuthierModuleModel): Promise<LuthierModuleModel> {
        return firstValueFrom(this._httpClient.post<LuthierModuleModel>(`${this.baseCommonUrl}/module`, model).pipe(
            switchMap((response: LuthierModuleModel) => {
                if (UtilFunctions.isValidStringOrArray(this._currentModules) === false) {
                    this._currentModules = new Array<LuthierModuleModel>();
                }
                if (model.code && model.code > 0) {
                    const index = this._currentModules.findIndex(x => x.code === model.code);
                    if (index < 0) {
                        this._currentModules.push(response);
                    } else {
                        this._currentModules[index] = response;
                    }
                } else {
                    this._currentModules.push(response);
                }
                this.modules = this._currentModules;
                // Return a new observable with the response
                return of(response);
            })));
    }

    getSubsystems(): Observable<LuthierSubsystemModel[]> {

        this._subsystems.next([]);
        return this._httpClient.get<LuthierSubsystemModel[]>(`${this.baseCommonUrl}/all-subsystems`).pipe(
            tap((response: LuthierSubsystemModel[]) =>
            {
                this.subsystems = response;
            }),
        );
    }
    getSubsystem(id: number): Promise<any> {
        return firstValueFrom(this._httpClient.get(`${this.baseCommonUrl}/subsystem/${id}`));
    }
    deleteSubsystem(id: number): Promise<any>  {
        return firstValueFrom(this._httpClient.delete<any>(`${this.baseCommonUrl}/subsystem/${id}`).pipe(
            switchMap((response) => {
                const index = this._currentSubsystems.findIndex(x => x.code === id);
                if (index >= 0) {
                    const model = this._currentSubsystems[index];
                    this._currentSubsystems.splice(index, 1);
                    this.subsystems = this._currentSubsystems;
                    this._subsystemChanged.next({subsystem: model, persistType: PortalHistoryPersistTypeEnum.DELETE});
                }
                // Return a new observable with the response
                return of(response);
            })));
    }
    saveSubsystem(model: LuthierSubsystemModel): Promise<LuthierSubsystemModel> {
        return firstValueFrom(this._httpClient.post<LuthierSubsystemModel>(`${this.baseCommonUrl}/subsystem`, model).pipe(
            switchMap((response: LuthierSubsystemModel) => {
                if (UtilFunctions.isValidStringOrArray(this._currentSubsystems) === false) {
                    this._currentSubsystems = new Array<LuthierSubsystemModel>();
                }
                if (model.code && model.code > 0) {
                    const index = this._currentSubsystems.findIndex(x => x.code === model.code);
                    if (index < 0) {
                        this._currentSubsystems.push(response);
                    } else {
                        this._currentSubsystems[index] = response;
                    }
                } else {
                    this._currentSubsystems.push(response);
                }
                this.subsystems = this._currentSubsystems;
                this._subsystemChanged.next({subsystem: response, persistType: PortalHistoryPersistTypeEnum.SAVE});
                // Return a new observable with the response
                return of(response);
            })));
    }

    getActiveSubsystems(): Promise<LuthierSubsystemModel[]> {

        return firstValueFrom(this._httpClient.get<LuthierSubsystemModel[]>(`${this.baseCommonUrl}/get-active-subsystems`));
    }

    syncSchemas(): Promise<any> {
        return firstValueFrom(this._httpClient.patch<any>(`${this.baseDicUrl}/sync-schemas`, null));
    }

    updateSequences(): Promise<any> {
        return firstValueFrom(this._httpClient.patch<any>(`${this.baseDicUrl}/update-sequences`, null));
    }

    checkObjects(): Promise<LuthierCheckObjectsSummaryModel> {
        return firstValueFrom(this._httpClient.patch<LuthierCheckObjectsSummaryModel>(`${this.baseDicUrl}/check-objects`, null));
    }

    checkObjectsTableChanges(id: String, tableName: String): Promise<LuthierChangesOfTableModel> {
        return firstValueFrom(this._httpClient.get<LuthierChangesOfTableModel>(`${this.baseDicUrl}/check-objects-changes-table/${id}/${tableName}`));
    }

    checkObjectsProcedureChanges(id: String, procedureName: String): Promise<LuthierChangesOfProcedureModel> {
        return firstValueFrom(this._httpClient.get<LuthierChangesOfProcedureModel>(`${this.baseDicUrl}/check-objects-changes-procedure/${id}/${procedureName}`));
    }

    checkObjectsAllChanges(id: String): Promise<LuthierCheckObjectsSummaryModel> {
        return firstValueFrom(this._httpClient.get<LuthierCheckObjectsSummaryModel>(`${this.baseDicUrl}/check-objects-changes/${id}`));
    }

    checkObjectsAllTableChanges(id: String): Promise<LuthierCheckObjectsTableSummaryModel> {
        return firstValueFrom(this._httpClient.get<LuthierCheckObjectsTableSummaryModel>(`${this.baseDicUrl}/check-objects-changes-tables/${id}`));
    }

    checkObjectsAllProcedureChanges(id: String): Promise<LuthierCheckObjectsProcedureSummaryModel> {
        return firstValueFrom(this._httpClient.get<LuthierCheckObjectsProcedureSummaryModel>(`${this.baseDicUrl}/check-objects-changes-procedures/${id}`));
    }

    checkObjectsDeleteChanges(id: String): Promise<any> {
        return firstValueFrom(this._httpClient.delete<LuthierChangesOfTableModel>(`${this.baseDicUrl}/check-objects-changes/${id}`));
    }

    patchTableHistory(id: number): Promise<any> {
        return firstValueFrom(this._httpClient.patch<any>(`${this.baseDicUrl}/history-table/${id}`, null));
    }

    patchVisionHistory(id: number): Promise<any> {
        return firstValueFrom(this._httpClient.patch<any>(`${this.baseDicUrl}/history-vision/${id}`, null));
    }

    patchDatasetHistory(id: number): Promise<any> {
        return firstValueFrom(this._httpClient.patch<any>(`${this.baseDicUrl}/history-dataset/${id}`, null));
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

    sortVisionChildren(parent: LuthierVisionDatasetModel | LuthierVisionModel) {
        if (UtilFunctions.isValidStringOrArray(parent.children) === true) {
            parent.children.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
            for (let child of parent.children) {
                const dataset = this.sortVisionChildren(child);
                if (dataset != null) {
                    return dataset;
                }
            }
        }
        else {
            return;
        }
    }

    getParameters(): Observable<LuthierParameterModel[]> {

        this._parameters.next([]);
        return this._httpClient.get<LuthierParameterModel[]>(`${this.baseManagerUrl}/all-parameters`).pipe(
            tap((response: LuthierParameterModel[]) =>
            {
                this.parameters = response;
            }),
        );
    }
    getParameter(name: string): Promise<any> {
        return firstValueFrom(this._httpClient.get(`${this.baseManagerUrl}/parameter/${name}`));
    }
    deleteParameter(name: string): Promise<any>  {
        return firstValueFrom(this._httpClient.delete<any>(`${this.baseManagerUrl}/parameter/${name}`).pipe(
            switchMap((response) => {
                const index = this._currentParameters.findIndex(x => x.name === name);
                if (index >= 0) {
                    this._currentParameters.splice(index, 1);
                    this.parameters = this._currentParameters;
                }
                // Return a new observable with the response
                return of(response);
            })));
    }
    saveParameter(model: LuthierParameterModel): Promise<LuthierParameterModel> {
        return firstValueFrom(this._httpClient.post<LuthierParameterModel>(`${this.baseManagerUrl}/parameter`, model).pipe(
            switchMap((response: LuthierParameterModel) => {
                if (UtilFunctions.isValidStringOrArray(this._currentParameters) === false) {
                    this._currentParameters = new Array<LuthierParameterModel>();
                }
                if (UtilFunctions.isValidStringOrArray(model.previousName) === true) {
                    const index = this._currentParameters.findIndex(x => x.name === model.previousName);
                    if (index < 0) {
                        this._currentParameters.push(response);
                    } else {
                        this._currentParameters[index] = response;
                    }
                }
                else {
                    this._currentParameters.push(response);
                }
                this.parameters = this._currentParameters;
                // Return a new observable with the response
                return of(response);
            })));
    }

    syncParameters(): Promise<any> {
        return firstValueFrom(this._httpClient.patch<any>(`${this.baseManagerUrl}/sync-parameters`, null));
    }

    getSemaphores(): Observable<LuthierSemaphoreModel[]> {

        this._semaphores.next([]);
        return this._httpClient.get<LuthierSemaphoreModel[]>(`${this.baseManagerUrl}/all-semaphores`).pipe(
            tap((response: LuthierSemaphoreModel[]) =>
            {
                this.semaphores = response;
            }),
        );
    }
    getSemaphore(code: number): Promise<any> {
        return firstValueFrom(this._httpClient.get(`${this.baseManagerUrl}/semaphore/${code}`));
    }
    deleteSemaphore(code: number): Promise<any>  {
        return firstValueFrom(this._httpClient.delete<any>(`${this.baseManagerUrl}/semaphore/${code}`).pipe(
            switchMap((response) => {
                const index = this._currentSemaphores.findIndex(x => x.code === code);
                if (index >= 0) {
                    this._currentSemaphores.splice(index, 1);
                    this.semaphores = this._currentSemaphores;
                }
                // Return a new observable with the response
                return of(response);
            })));
    }
    saveSemaphore(model: LuthierSemaphoreModel): Promise<LuthierSemaphoreModel> {
        return firstValueFrom(this._httpClient.post<LuthierSemaphoreModel>(`${this.baseManagerUrl}/semaphore`, model).pipe(
            switchMap((response: LuthierSemaphoreModel) => {
                if (UtilFunctions.isValidStringOrArray(this._currentSemaphores) === false) {
                    this._currentSemaphores = new Array<LuthierSemaphoreModel>();
                }
                if (UtilFunctions.isValidStringOrArray(model.code) === true) {
                    const index = this._currentSemaphores.findIndex(x => x.code === model.code);
                    if (index < 0) {
                        this._currentSemaphores.push(response);
                    } else {
                        this._currentSemaphores[index] = response;
                    }
                }
                else {
                    this._currentSemaphores.push(response);
                }
                this.semaphores = this._currentSemaphores;
                // Return a new observable with the response
                return of(response);
            })));
    }

    syncSemaphores(): Promise<any> {
        return firstValueFrom(this._httpClient.patch<any>(`${this.baseManagerUrl}/sync-semaphores`, null));
    }

    getMenus(): Observable<LuthierMenuModel[]> {

        this._menus.next([]);
        return this._httpClient.get<LuthierMenuModel[]>(`${this.baseManagerUrl}/all-menus`).pipe(
            tap((response: LuthierMenuModel[]) =>
            {
                this.menus = response;
            }),
        );
    }
    getMenu(code: number): Promise<any> {
        return firstValueFrom(this._httpClient.get(`${this.baseManagerUrl}/menu/${code}`));
    }
    deleteMenu(code: number): Promise<any>  {
        return firstValueFrom(this._httpClient.delete<any>(`${this.baseManagerUrl}/menu/${code}`).pipe(
            switchMap((response) => {
                const index = this._currentMenus.findIndex(x => x.code === code);
                if (index >= 0) {
                    const model = this._currentMenus[index];
                    this._currentMenus.splice(index, 1);
                    this.menus = this._currentMenus;
                    this._menuChanged.next({menu: model, persistType: PortalHistoryPersistTypeEnum.DELETE});
                }

                // Return a new observable with the response
                return of(response);
            })));
    }
    saveMenu(model: LuthierMenuModel): Promise<LuthierMenuModel> {
        return firstValueFrom(this._httpClient.post<LuthierMenuModel>(`${this.baseManagerUrl}/menu`, model).pipe(
            switchMap((response: LuthierMenuModel) => {
                if (UtilFunctions.isValidStringOrArray(this._currentMenus) === false) {
                    this._currentMenus = new Array<LuthierMenuModel>();
                }
                if (UtilFunctions.isValidStringOrArray(model.code) === true) {
                    const index = this._currentMenus.findIndex(x => x.code === model.code);
                    if (index < 0) {
                        this._currentMenus.push(response);
                    } else {
                        this._currentMenus[index] = response;
                    }
                }
                else {
                    this._currentMenus.push(response);
                }
                this.menus = this._currentMenus;
                this._menuChanged.next({menu: response, persistType: PortalHistoryPersistTypeEnum.SAVE});
                // Return a new observable with the response
                return of(response);
            })));
    }

    getMenuTree(): Observable<LuthierMenuTreeModel> {

        this._menuTree.next(null);
        return this._httpClient.get<LuthierMenuTreeModel>(`${this.baseManagerUrl}/all-menu-tree`).pipe(
            tap((response: LuthierMenuTreeModel) =>
            {
                this.menuTree = response;
            }),
        );
    }

    saveMenuTree(model: LuthierMenuTreeModel): Promise<LuthierMenuTreeModel> {
        return firstValueFrom(this._httpClient.post<LuthierMenuTreeModel>(`${this.baseManagerUrl}/menu-tree`, model).pipe(
            switchMap((response: LuthierMenuTreeModel) => {
                this.menuTree = response;
                // Return a new observable with the response
                return of(response);
            })));
    }

    generateXMLLoad(model: LuthierGenerateLoadXMLModel): Promise<{xml: string, fileName: string}> {
        return firstValueFrom(this._httpClient.patch<{xml: string, fileName: string}>(`${this.baseDicUrl}/xml-load`, model));
    }

    saveProcedure(model: LuthierProcedureModel): Promise<LuthierProcedureModel> {
        return firstValueFrom(this._httpClient.post<LuthierProcedureModel>(`${this.baseDicUrl}/procedure`, model).pipe(
            switchMap((response: LuthierProcedureModel) => {
                if (UtilFunctions.isValidStringOrArray(this._currentProcedures) === false) {
                    this._currentProcedures = new Array<LuthierTableModel>();
                }
                if (model.code && model.code > 0) {
                    const index = this._currentProcedures.findIndex(x => x.code === model.code);
                    if (index < 0) {
                        this._currentProcedures.push(response);
                    } else {
                        this._currentProcedures[index] = response;
                    }
                } else {
                    this._currentProcedures.push(response);
                    this._currentProcedures.sort((a, b) => {
                        return a.name.localeCompare(b.name);
                    });
                }
                this.procedures = this._currentProcedures;
                // Return a new observable with the response
                return of(response);
            })));
    }

    deleteProcedure(id: number): Promise<any>  {
        return firstValueFrom(this._httpClient.delete<any>(`${this.baseDicUrl}/procedure/${id}`).pipe(
            switchMap((response: any) => {
                const index = this._currentProcedures.findIndex(x => x.code === id);
                if (index >= 0) {
                    this._currentProcedures.splice(index, 1);
                    this.procedures = this._currentProcedures;
                }
                // Return a new observable with the response
                return of(response);
            })));
    }

    getProcedures(): Observable<any>
    {
        this._procedures.next([]);
        return this._httpClient.get<LuthierVisionModel[]>(`${this.baseDicUrl}/all-procedures`).pipe(
            tap((response: LuthierProcedureModel[]) =>
            {
                this.procedures = response;
            }),
        );
    }

    getExportedTables(): Promise<Array<LuthierTableModel>> {
        return firstValueFrom(this._httpClient.get<LuthierVisionModel[]>(`${this.baseManagerUrl}/all-exported-tables`));
    }

    getScripts(): Promise<Array<LuthierScriptTableModel>> {
        return firstValueFrom(this._httpClient.get<Array<LuthierScriptTableModel>>(`${this.baseManagerUrl}/all-scripts`));
    }

    filterScripts(filter: FilterRequestModel): Promise<Array<LuthierScriptTableModel>> {
        return firstValueFrom(this._httpClient.post<Array<LuthierScriptTableModel>>(`${this.baseManagerUrl}/filter-scripts`, filter));
    }

    getReports(): Promise<Array<LuthierReportModel>> {
        return firstValueFrom(this._httpClient.get<Array<LuthierReportModel>>(`${this.baseManagerUrl}/all-reports`));
    }

    filterReports(filter: FilterRequestModel): Promise<Array<LuthierReportModel>> {
        return firstValueFrom(this._httpClient.post<Array<LuthierReportModel>>(`${this.baseManagerUrl}/filter-reports`, filter));
    }

    getLayoutControls(): Promise<Array<LuthierLayoutControlModel>> {
        return firstValueFrom(this._httpClient.get<Array<LuthierLayoutControlModel>>(`${this.baseManagerUrl}/all-layout-controls`));
    }

    filterLayoutControls(filter: FilterRequestModel): Promise<Array<LuthierLayoutControlModel>> {
        return firstValueFrom(this._httpClient.post<Array<LuthierLayoutControlModel>>(`${this.baseManagerUrl}/filter-layout-controls`, filter));
    }

    getTableHelps(): Promise<Array<LuthierTableHelpModel>> {
        return firstValueFrom(this._httpClient.get<Array<LuthierTableHelpModel>>(`${this.baseManagerUrl}/all-table-helps`));
    }

    filterTableHelps(filter: FilterRequestModel): Promise<Array<LuthierTableHelpModel>> {
        return firstValueFrom(this._httpClient.post<Array<LuthierTableHelpModel>>(`${this.baseManagerUrl}/filter-table-helps`, filter));
    }

    getMessageTypes(): Promise<Array<LuthierMessageTypeModel>> {
        return firstValueFrom(this._httpClient.get<Array<LuthierMessageTypeModel>>(`${this.baseManagerUrl}/all-message-types`));
    }

    filterMessageTypes(filter: FilterRequestModel): Promise<Array<LuthierMessageTypeModel>> {
        return firstValueFrom(this._httpClient.post<Array<LuthierMessageTypeModel>>(`${this.baseManagerUrl}/filter-message-types`, filter));
    }

    filterSubsystems(filter: FilterRequestModel): Promise<Array<LuthierSubsystemModel>> {
        return firstValueFrom(this._httpClient.post<Array<LuthierSubsystemModel>>(`${this.baseCommonUrl}/filter-subsystems`, filter));
    }

    filterParameters(filter: FilterRequestModel): Promise<Array<LuthierParameterModel>> {
        return firstValueFrom(this._httpClient.post<Array<LuthierParameterModel>>(`${this.baseManagerUrl}/filter-parameters`, filter));
    }

    filterResources(filter: FilterRequestModel): Promise<Array<LuthierResourceModel>> {
        return firstValueFrom(this._httpClient.post<Array<LuthierResourceModel>>(`${this.baseCommonUrl}/filter-resources`, filter));
    }

    filterProjects(filter: FilterRequestModel): Promise<Array<LuthierProjectModel>> {
        return firstValueFrom(this._httpClient.post<Array<LuthierProjectModel>>(`${this.baseCommonUrl}/filter-projects`, filter));
    }

    filterTables(filter: FilterRequestModel): Promise<Array<LuthierTableModel>> {
        return firstValueFrom(this._httpClient.post<Array<LuthierTableModel>>(`${this.baseDicUrl}/filter-tables`, filter));
    }

    filterProcedures(filter: FilterRequestModel): Promise<Array<LuthierProcedureModel>> {
        return firstValueFrom(this._httpClient.post<Array<LuthierProcedureModel>>(`${this.baseDicUrl}/filter-procedures`, filter));
    }

    filterVisions(filter: FilterRequestModel): Promise<Array<LuthierVisionModel>> {
        return firstValueFrom(this._httpClient.post<Array<LuthierVisionModel>>(`${this.baseDicUrl}/filter-visions`, filter));
    }

    filterExportedTables(filter: FilterRequestModel): Promise<Array<LuthierTableModel>> {
        if (UtilFunctions.isValidStringOrArray(filter) === false) {
            filter = new FilterRequestModel();
        }
        if (UtilFunctions.isValidStringOrArray(filter.filters) === false) {
            filter.filters = new Array<FilterModel>();
        }
        const index = filter.filters.findIndex(x => x.column === 'export');
        if (index >= 0) {
            filter.filters[index].value = 1;

        }
        else {
            const filterModel: FilterModel = {
                column: 'export',
                label: 'Exportado',
                value: 1,
                operator: 'EQUALS',
                type: 'NUMBER',
                required: false
            }
            filter.filters.push(filterModel);
        }

        return firstValueFrom(this._httpClient.post<Array<LuthierTableModel>>(`${this.baseDicUrl}/filter-tables`, filter));
    }


    generateLed(filter: Array<number>): Promise<{link: string, fileName: string}> {
        return firstValueFrom(this._httpClient.patch<any>(`${this.baseManagerUrl}/generate-led`, filter))
    }

    generateLpx(filter: {[key: string]: Array<number>}): Promise<{link: string, fileName: string}> {
        return firstValueFrom(this._httpClient.patch<any>(`${this.baseManagerUrl}/generate-lpx`, filter))
    }

    generateLup(filter: {[key: string]: Array<number>}): Promise<{link: string, fileName: string}> {
        return firstValueFrom(this._httpClient.patch<any>(`${this.baseManagerUrl}/generate-lup`, filter))
    }

    download(link: string): Promise<Blob> {
        return firstValueFrom(
            this._httpClient.get(link, { responseType: 'blob' })
        );
    }

    uploadLed(formData: FormData): Promise<LedImportModel> {
        return firstValueFrom(this._httpClient.post<LedImportModel>(`${this.baseManagerUrl}/upload-led`, formData));
    }

    processLedOld(model: LedImportModel): Promise<LedImportModel> {
        return firstValueFrom(this._httpClient.post<LedImportModel>(`${this.baseManagerUrl}/process-led`, model));
    }

    processLed(
        body: LedImportModel,
        callback: (msg: AsyncRequestModel<LedImportModel>) => void
    ): () => void {
        return this.processAsync<AsyncRequestModel<LedImportModel>>(
            body,
            `${this.baseManagerUrl}/process-led`,
            callback
        );
    }

    uploadLpx(formData: FormData): Promise<LpxImportModel> {
        return firstValueFrom(this._httpClient.post<LpxImportModel>(`${this.baseManagerUrl}/upload-lpx`, formData));
    }

    processLpxOld(model: LpxImportModel): Promise<LpxImportModel> {
        return firstValueFrom(this._httpClient.post<LpxImportModel>(`${this.baseManagerUrl}/process-lpx`, model));
    }

    generateLpxAsync(
        body: {[key: string]: Array<number>},
        callback: (msg: AsyncRequestModel<{link: string, fileName: string}>) => void
    ): () => void {
        return this.processAsync<AsyncRequestModel<{link: string, fileName: string}>>(
            body,
            `${this.baseManagerUrl}/generate-lpx-async`,
            callback
        );
    }

    generateLedAsync(
        body: Array<number>,
        callback: (msg: AsyncRequestModel<{link: string, fileName: string}>) => void
    ): () => void {
        return this.processAsync<AsyncRequestModel<{link: string, fileName: string}>>(
            body,
            `${this.baseManagerUrl}/generate-led-async`,
            callback
        );
    }

    generateLupAsync(
        body: {[key: string]: Array<number>},
        callback: (msg: AsyncRequestModel<{link: string, fileName: string}>) => void
    ): () => void {
        return this.processAsync<AsyncRequestModel<{link: string, fileName: string}>>(
            body,
            `${this.baseManagerUrl}/generate-lup-async`,
            callback
        );
    }

    processLpx(
        body: LpxImportModel,
        callback: (msg: AsyncRequestModel<LpxImportModel>) => void
    ): () => void {
        return this.processAsync<AsyncRequestModel<LpxImportModel>>(
            body,
            `${this.baseManagerUrl}/process-lpx`,
            callback
        );
    }

    uploadLup(formData: FormData): Promise<LupImportModel> {
        return firstValueFrom(this._httpClient.post<LupImportModel>(`${this.baseManagerUrl}/upload-lup`, formData));
    }

    processLup(
        body: LupImportModel,
        callback: (msg: AsyncRequestModel<LupImportModel>) => void
    ): () => void {
        return this.processAsync<AsyncRequestModel<LupImportModel>>(
            body,
            `${this.baseManagerUrl}/process-lup`,
            callback
        );
    }

    processAsync<T>(
        body: any,
        url: string,
        onMessage: (msg: T) => void
    ): () => void {
        const controller = new AbortController();
        const luthierDatabase = this.authService.luthierDatabase;
        const dadosDatabase = this.authService.dadosDatabase;

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-LuthierDatabaseID': luthierDatabase,
                'X-DadosDatabaseID': dadosDatabase
            },
            body: JSON.stringify(body),
            signal: controller.signal,
        })
            .then(response => {
                const reader = response.body?.getReader();
                const decoder = new TextDecoder('utf-8');
                let buffer = '';

                const read = () => {
                    reader?.read().then(({ done, value }) => {
                        if (done) return;

                        buffer += decoder.decode(value, { stream: true });

                        // separa blocos por linhas vazias (\n\n)
                        const parts = buffer.split(/\r?\n\r?\n/);
                        buffer = parts.pop() || ''; // última parte pode estar incompleta

                        for (const part of parts) {
                            const lines = part.split(/\r?\n/);
                            for (const line of lines) {
                                if (line.startsWith('data:')) {
                                    const json = line.slice(5).trim();
                                    try {
                                        const parsed = JSON.parse(json);
                                        onMessage(parsed);
                                    } catch (err) {
                                        console.warn('Erro ao parsear JSON:', json, err);
                                    }
                                }
                            }
                        }

                        read(); // continuar lendo
                    }).catch(err => {
                        console.error('Erro ao ler stream:', err);
                    });
                };

                read();
            })
            .catch(err => {
                console.error('Erro no fetch:', err);
            });

        return () => controller.abort();
    }


}
