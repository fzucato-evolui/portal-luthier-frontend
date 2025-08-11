import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {
    PortalStorageEntityIdentifierModel,
    PortalStorageEntityModel,
    PortalStorageFileModel,
    PortalStorageRootModel,
    PresignedUrlResponseModel,
    StorageEntitySummaryModel,
    StorageIdentifierSummaryModel,
    StorageNavigationStateModel,
    StorageRootSummaryModel
} from 'app/shared/models/portal-storage.model';
import {AsyncRequestModel} from 'app/shared/models/async_request.model';
import {UtilFunctions} from '../../../../shared/util/util-functions';
import {PortalStorageConfigModel} from '../../../../shared/models/portal-storage-config.model';

@Injectable({
    providedIn: 'root'
})
export class PortalStorageService {
    private readonly apiUrl = '/api/admin/portal/storage';
    private readonly apiConfigUrl = '/api/admin/portal/storage-config';

    // Navigation state
    private _navigationState = new BehaviorSubject<StorageNavigationStateModel>({
        currentPath: '',
        breadcrumbs: []
    });

    // Current data
    private _configs = new BehaviorSubject<PortalStorageConfigModel[]>([]);
    private _roots = new BehaviorSubject<StorageRootSummaryModel[]>([]);
    private _entities = new BehaviorSubject<StorageEntitySummaryModel[]>([]);
    private _identifiers = new BehaviorSubject<StorageIdentifierSummaryModel[]>([]);
    private _files = new BehaviorSubject<PortalStorageFileModel[]>([]);

    // Loading states
    private _isLoading = new BehaviorSubject<boolean>(false);

    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get navigationState$(): Observable<StorageNavigationStateModel> {
        return this._navigationState.asObservable();
    }

    get configs$(): Observable<PortalStorageConfigModel[]> {
        return this._configs.asObservable();
    }

    get roots$(): Observable<StorageRootSummaryModel[]> {
        return this._roots.asObservable();
    }

    get entities$(): Observable<StorageEntitySummaryModel[]> {
        return this._entities.asObservable();
    }

    get identifiers$(): Observable<StorageIdentifierSummaryModel[]> {
        return this._identifiers.asObservable();
    }

    get files$(): Observable<PortalStorageFileModel[]> {
        return this._files.asObservable();
    }

    get isLoading$(): Observable<boolean> {
        return this._isLoading.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods - Navigation
    // -----------------------------------------------------------------------------------------------------

    /**
     * Reset navigation to root level (roots list)
     */
    resetNavigation(): void {
        this._navigationState.next({
            currentPath: '',
            breadcrumbs: [{
                label: 'Administração de Armazenamento',
                path: '/portal/storage',
                clickable: false
            }]
        });
        this._entities.next([]);
        this._identifiers.next([]);
        this._files.next([]);
    }

    /**
     * Navigate to root's entities
     */
    navigateToRootEntities(rootId: number, rootIdentifier: string): void {
        console.log('🔍 NavigateToRootEntities Debug:', { rootId, rootIdentifier: rootIdentifier });

        this._navigationState.next({
            rootId,
            rootIdentifier: rootIdentifier,
            currentPath: `/portal/storage/roots/${rootId}`,
            breadcrumbs: [
                { label: 'Administração de Armazenamento', path: '/portal/storage', clickable: true },
                { label: rootIdentifier, path: `/portal/storage/roots/${rootId}/entities`, clickable: false }
            ]
        });
        this._identifiers.next([]);
        this._files.next([]);
    }

    /**
     * Navigate to entity identifiers
     */
    navigateToEntityIdentifiers(rootId: number, rootIdentifier: string, entityId: number, entityName: string): void {
        console.log('🔍 NavigateToEntityIdentifiers Debug:', { rootId, rootIdentifier, entityId, entityName });

        this._navigationState.next({
            rootId,
            rootIdentifier,
            entityId,
            entityName,
            currentPath: `/portal/storage/roots/${rootId}/entities/${entityId}`,
            breadcrumbs: [
                { label: 'Administração de Armazenamento', path: '/portal/storage', clickable: true },
                { label: rootIdentifier, path: `/portal/storage/roots/${rootId}/entities`, clickable: true },
                { label: entityName, path: `/portal/storage/roots/${rootId}/entities/${entityId}/identifiers`, clickable: false }
            ]
        });
        this._files.next([]);
    }

    /**
     * Navigate to file explorer
     */
    navigateToFileExplorer(
        rootId: number,
        rootIdentifier: string,
        entityId: number,
        entityName: string,
        identifierId: number,
        identifierName: string,
        directory?: PortalStorageFileModel,
    ): void {


        // Build breadcrumbs with correct paths for navigation using query parameters
        const breadcrumbs = [
            {
                label: 'Administração de Armazenamento',
                path: '/portal/storage',
                clickable: true
            },
            {
                label: rootIdentifier,
                path: `/portal/storage/roots/${rootId}/entities`,
                clickable: true
            },
            {
                label: entityName,
                path: `/portal/storage/roots/${rootId}/entities/${entityId}/identifiers`,
                clickable: true
            },
            {
                label: identifierName,
                path: `/portal/storage/roots/${rootId}/entities/${entityId}/identifiers/${identifierId}/files`,
                clickable: UtilFunctions.isValidObject(directory) === true
            }
        ];
        let keysAncestors = [];

        if (UtilFunctions.isValidObject(directory) === true) {
            keysAncestors = directory.ancestors || [];

            if (UtilFunctions.isValidStringOrArray(keysAncestors) === true && keysAncestors.length > 3) {
                keysAncestors.forEach((ancestorObj, index) => {
                    // 0 = root, 1 = entity, 2 = identifier, 3 = directory
                    if (index >= 3) {
                        const id = Number(Object.keys(ancestorObj)[0]);
                        const name = ancestorObj[id];

                        breadcrumbs.push({
                            label: name,
                            path: `/portal/storage/roots/${rootId}/entities/${entityId}/identifiers/${identifierId}/files/${id}`,
                            clickable: index < keysAncestors.length - 1 // só clicar se não for o último
                        });
                    }
                });
            }


        }
        const currentPath = breadcrumbs[breadcrumbs.length - 1].path;

        console.log('🔍 NavigateToFileExplorer Debug (Query Params):', {
            rootId,
            rootIdentifier: rootIdentifier,
            entityId,
            entityName,
            identifierId,
            identifierName,
            directory,
            breadcrumbs,
            currentPath,
        });

        this._navigationState.next({
            rootId,
            rootIdentifier: rootIdentifier,
            entityId,
            entityName,
            identifierId,
            identifierName,
            directory: directory,
            currentPath: currentPath,
            breadcrumbs
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods - API calls
    // -----------------------------------------------------------------------------------------------------

    getConfigs(): Observable<PortalStorageConfigModel[]> {
        this._isLoading.next(true);

        return this._httpClient.get<PortalStorageConfigModel[]>(`${this.apiConfigUrl}`)
            .pipe(
                tap(configs => {
                    this._configs.next(configs);
                    this._isLoading.next(false);
                })
            );
    }
    /**
     * Get roots with storage statistics
     */
    getRoots(): Observable<StorageRootSummaryModel[]> {
        this._isLoading.next(true);

        return this._httpClient.get<StorageRootSummaryModel[]>(`${this.apiUrl}/roots-summary`)
            .pipe(
                tap(roots => {
                    this._roots.next(roots);
                    this._isLoading.next(false);
                })
            );
    }
    /**
     * Get root by ID for navigation context
     */
    getRoot(rootId: number): Observable<StorageRootSummaryModel | null> {
        return this._httpClient.get<StorageRootSummaryModel>(`${this.apiUrl}/root-summary/${rootId}`);
    }

    createRoot(root: PortalStorageRootModel): Observable<PortalStorageRootModel> {
        return this._httpClient.post<PortalStorageRootModel>(`${this.apiUrl}/root`, root);
    }

    updateRoot(root: PortalStorageRootModel): Observable<PortalStorageRootModel> {
        return this._httpClient.put<PortalStorageRootModel>(`${this.apiUrl}/root`, root);
    }
    /**
     * Create a new storage entity
     */
    createEntity(entity: PortalStorageEntityModel): Observable<PortalStorageEntityModel> {
        return this._httpClient.post<PortalStorageEntityModel>(`${this.apiUrl}/entity`, entity);
    }
    /**
     * Update an existing storage entity
     */
    updateEntity(entity: PortalStorageEntityModel): Observable<PortalStorageEntityModel> {
        return this._httpClient.put<PortalStorageEntityModel>(`${this.apiUrl}/entity`, entity);
    }
    /**
     * Delete an existing storage entity
     */
    deleteEntity(entityId: number): Observable<{ [key: string]: any }> {
        return this._httpClient.delete<Observable<{ [key: string]: any }>>(`${this.apiUrl}/entity/${entityId}`);
    }
    /**
     * Delete root storage
     */
    deleteRootStorage(rootId: number): Observable<{ [key: string]: any }> {
        return this._httpClient.delete<{ [key: string]: any }>(`${this.apiUrl}/root/${rootId}`).pipe(
            tap((result) =>
            {
                const index = this._roots.getValue().findIndex(root => root.id === rootId);
                if (index !== -1) {
                    const updatedRoots = [...this._roots.getValue()];
                    updatedRoots.splice(index, 1);
                    this._roots.next(updatedRoots);
                }
                return result;
            }),
        );
    }
    /**
     * Get entities for a specific root
     */
    getRootEntities(rootId: number): Observable<StorageEntitySummaryModel[]> {
        this._isLoading.next(true);

        return this._httpClient.get<StorageEntitySummaryModel[]>(`${this.apiUrl}/root-entities/${rootId}`)
            .pipe(
                tap(entities => {
                    this._entities.next(entities);
                    this._isLoading.next(false);
                })
            );
    }

    /**
     * Get entity by ID for navigation context
     */
    getEntity(entityId: number): Observable<StorageEntitySummaryModel | null> {
        return this._httpClient.get<StorageEntitySummaryModel>(`${this.apiUrl}/entity-summary/${entityId}`);
    }

    /**
     * Get identifiers for a specific entity
     */
    getEntityIdentifiers(entityId: number): Observable<StorageIdentifierSummaryModel[]> {
        this._isLoading.next(true);

        return this._httpClient.get<StorageIdentifierSummaryModel[]>(`${this.apiUrl}/entity-identifiers/${entityId}`)
            .pipe(
                tap(identifiers => {
                    this._identifiers.next(identifiers);
                    this._isLoading.next(false);
                })
            );
    }
    /**
     * Create a new storage entity identifier
     */
    createIdentifier(model: PortalStorageEntityIdentifierModel): Observable<PortalStorageEntityIdentifierModel> {
        return this._httpClient.post<PortalStorageEntityIdentifierModel>(`${this.apiUrl}/identifier`, model);
    }
    /**
     * Update an existing storage entity identifier
     */
    updateIdentifier(model: PortalStorageEntityIdentifierModel): Observable<PortalStorageEntityIdentifierModel> {
        return this._httpClient.put<PortalStorageEntityIdentifierModel>(`${this.apiUrl}/identifier`, model);
    }
    /**
     * Delete an existing storage entity
     */
    deleteIdentifier(id: number): Observable<{ [key: string]: any }> {
        return this._httpClient.delete<Observable<{ [key: string]: any }>>(`${this.apiUrl}/identifier/${id}`);
    }
    /**
     * Get files for a specific identifier (root level)
     */
    getIdentifierRootFiles(identifierId: number): Observable<PortalStorageEntityIdentifierModel> {
        this._isLoading.next(true);

        return this._httpClient.get<PortalStorageEntityIdentifierModel>(`${this.apiUrl}/identifier-root-files/${identifierId}`)
            .pipe(
                tap(identifier => {
                    this._files.next(identifier.files);
                    this._isLoading.next(false);
                    return identifier;
                })
            );
    }
    /**
     * Get files in a specific directory
     */
    getIdentifierDirectoryContents(identifierId: number, directoryId: number): Observable<PortalStorageEntityIdentifierModel> {
        this._isLoading.next(true);

        return this._httpClient.get<PortalStorageEntityIdentifierModel>(`${this.apiUrl}/identifier-directory/${identifierId}/${directoryId}`)
            .pipe(
                tap(identifier => {
                    this._files.next(identifier.files);
                    this._isLoading.next(false);
                    return identifier;
                })
            );
    }
    /**
     * Update an existing storage file
     */
    updateFile(model: PortalStorageFileModel): Observable<PortalStorageFileModel> {
        return this._httpClient.put<PortalStorageFileModel>(`${this.apiUrl}/file`, model);
    }

    /**
     * Download all files of a root as ZIP asynchronously
     */
    downloadRootFilesAsync(
        id: number,
        callback: (msg: AsyncRequestModel<{ token: string, fileName: string }>) => void
    ): () => void {
        return this.processAsync<AsyncRequestModel<{ token: string, fileName: string }>>(
            null,
            `${this.apiUrl}/root-download-zip-async/${id}`,
            callback
        );
    }

    /**
     * Download all files of entities as ZIP asynchronously
     * Note: This endpoint needs to be implemented in the backend
     */
    downloadEntitiesFilesAsync(
        id: number,
        callback: (msg: AsyncRequestModel<{ token: string, fileName: string }>) => void
    ): () => void {
        return this.processAsync<AsyncRequestModel<{ token: string, fileName: string }>>(
            null,
            `${this.apiUrl}/entity-download-zip-async/${id}`,
            callback
        );
    }

    /**
     * Download all files of an identifier as ZIP asynchronously
     */
    downloadIdentifierFilesAsync(
        id: number,
        callback: (msg: AsyncRequestModel<{ token: string, fileName: string }>) => void
    ): () => void {
        return this.processAsync<AsyncRequestModel<{ token: string, fileName: string }>>(
            null,
            `${this.apiUrl}/identifier-download-zip-async/${id}`,
            callback
        );
    }

    /**
     * Download all files of a folder as ZIP asynchronously
     */
    downloadFolderFilesAsync(
        id: number,
        callback: (msg: AsyncRequestModel<{ token: string, fileName: string }>) => void
    ): () => void {
        return this.processAsync<AsyncRequestModel<{ token: string, fileName: string }>>(
            null,
            `${this.apiUrl}/folder-download-zip-async/${id}`,
            callback
        );
    }

    /**
     * Download file using token
     */
    downloadZipByToken(token: string): Observable<Blob> {
        return this._httpClient.get(`${this.apiUrl}/download-zip/${token}`, {
            responseType: 'blob'
        });
    }

    /**
     * Delete temporary ZIP file by token
     */
    deleteZipByToken(token: string): Observable<{ message: string }> {
        return this._httpClient.delete<{ message: string }>(`${this.apiUrl}/download-zip/${token}`);
    }

    /**
     * Generate presigned URL for file
     */
    generatePresignedUrl(fileId: number, expirationMinutes: number = 60): Observable<PresignedUrlResponseModel> {
        const params = new HttpParams().set('expirationMinutes', expirationMinutes.toString());

        return this._httpClient.post<PresignedUrlResponseModel>(`${this.apiUrl}/file-presigned-url/${fileId}`, null, { params });
    }

    /**
     * Generate presigned URLs for multiple files in identifier
     */
    generatePresignedUrlsForIdentifier(
        identifierId: number,
        folderId: number = null,
        expirationMinutes: number = 60
    ): Observable<PortalStorageFileModel[]> {
        let params = new HttpParams()
            .set('expirationMinutes', expirationMinutes.toString());
        if (UtilFunctions.isValidStringOrArray(folderId) === true && folderId > 0) {
            params = new HttpParams()
                .set('directoryId', folderId)
                .set('expirationMinutes', expirationMinutes.toString());
        }

        return this._httpClient.post<PortalStorageFileModel[]>(
            `${this.apiUrl}/identifier-presigned-url/${identifierId}`,
            null,
            { params }
        );
    }

    /**
     * Download file
     */
    downloadFile(fileId: number, download: boolean = true): Observable<Blob> {
        const params = new HttpParams().set('download', download.toString());

        return this._httpClient.get(`${this.apiUrl}/download-file/${fileId}`, {
            params,
            responseType: 'blob'
        });
    }

    /**
     * Delete file
     */
    deleteFile(fileId: number, recursive: boolean = false): Observable<void> {
        const params = new HttpParams().set('recursive', recursive.toString());

        return this._httpClient.delete<void>(`${this.apiUrl}/file/${fileId}`, { params });
    }

    createDirectory(model: PortalStorageFileModel): Observable<PortalStorageFileModel> {
        return this._httpClient.post<PortalStorageFileModel>(`${this.apiUrl}/create-directory`, model);
    }

    renameFile(model: PortalStorageFileModel): Observable<PortalStorageFileModel> {
        return this._httpClient.put<PortalStorageFileModel>(`${this.apiUrl}/rename-file`, model);
    }

    /**
     * Clean directory path to remove URL prefixes
     */
    private _cleanDirectoryPath(directoryPath: string): string {
        if (!directoryPath) return '';

        // Since the component now extracts the path correctly,
        // we just need to ensure it's clean of any leading/trailing slashes
        return directoryPath.replace(/^\/+|\/+$/g, '');
    }

    /**
     * Clear admin cache
     */
    clearCache(): Observable<{ message: string }> {
        return this._httpClient.post<{ message: string }>(`${this.apiUrl}/cache/clear`, null);
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Format file size for display
     */
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Get file icon based on file type or extension
     */
    getFileIcon(file: PortalStorageFileModel): string {
        if (file.isDirectory) {
            return 'heroicons_outline:folder';
        }

        const extension = file.originalName.split('.').pop()?.toLowerCase();

        const iconMap: { [key: string]: string } = {
            // Images
            'jpg': 'heroicons_outline:photo',
            'jpeg': 'heroicons_outline:photo',
            'png': 'heroicons_outline:photo',
            'gif': 'heroicons_outline:photo',
            'svg': 'heroicons_outline:photo',
            'webp': 'heroicons_outline:photo',

            // Documents
            'pdf': 'heroicons_outline:document-text',
            'doc': 'heroicons_outline:document-text',
            'docx': 'heroicons_outline:document-text',
            'txt': 'heroicons_outline:document-text',
            'rtf': 'heroicons_outline:document-text',

            // Spreadsheets
            'xls': 'heroicons_outline:table-cells',
            'xlsx': 'heroicons_outline:table-cells',
            'csv': 'heroicons_outline:table-cells',

            // Presentations
            'ppt': 'heroicons_outline:presentation-chart-bar',
            'pptx': 'heroicons_outline:presentation-chart-bar',

            // Archives
            'zip': 'heroicons_outline:archive-box',
            'rar': 'heroicons_outline:archive-box',
            '7z': 'heroicons_outline:archive-box',
            'tar': 'heroicons_outline:archive-box',
            'gz': 'heroicons_outline:archive-box',

            // Code
            'js': 'heroicons_outline:code-bracket',
            'ts': 'heroicons_outline:code-bracket',
            'html': 'heroicons_outline:code-bracket',
            'css': 'heroicons_outline:code-bracket',
            'java': 'heroicons_outline:code-bracket',
            'py': 'heroicons_outline:code-bracket',
            'cpp': 'heroicons_outline:code-bracket',
            'json': 'heroicons_outline:code-bracket',
            'xml': 'heroicons_outline:code-bracket',

            // Audio
            'mp3': 'heroicons_outline:musical-note',
            'wav': 'heroicons_outline:musical-note',
            'flac': 'heroicons_outline:musical-note',
            'aac': 'heroicons_outline:musical-note',

            // Video
            'mp4': 'heroicons_outline:film',
            'avi': 'heroicons_outline:film',
            'mkv': 'heroicons_outline:film',
            'mov': 'heroicons_outline:film',
            'wmv': 'heroicons_outline:film'
        };

        return iconMap[extension || ''] || 'heroicons_outline:document';
    }

    /**
     * Process async download requests with SSE
     */
    private processAsync<T>(
        body: any,
        url: string,
        onMessage: (msg: T) => void,
        params?: HttpParams
    ): () => void {
        const controller = new AbortController();

        // Build full URL with params if provided
        let fullUrl = url;
        if (params) {
            fullUrl += '?' + params.toString();
        }

        fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : null,
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
