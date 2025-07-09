import {Routes} from '@angular/router';
import {PortalStorageComponent} from './portal-storage.component';

export default [
    {
        path: '',
        component: PortalStorageComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./list/portal-storage-users-list.component').then(m => m.PortalStorageUsersListComponent)
            },
            {
                path: 'users/:userId/entities',
                loadComponent: () => import('./entities/portal-storage-entities-list.component').then(m => m.PortalStorageEntitiesListComponent)
            },
            {
                path: 'users/:userId/entities/:entityId/identifiers',
                loadComponent: () => import('./identifiers/portal-storage-identifiers-list.component').then(m => m.PortalStorageIdentifiersListComponent)
            },
            {
                path: 'users/:userId/entities/:entityId/identifiers/:identifierId/files',
                loadComponent: () => {
                    return import('./explorer/portal-storage-file-explorer.component').then(m => m.PortalStorageFileExplorerComponent);
                }
            },
            {
                // SIMPLIFIED: Single route using query parameters for directory path
                path: 'users/:userId/entities/:entityId/identifiers/:identifierId/files/:directoryId',
                loadComponent: () => {
                    return import('./explorer/portal-storage-file-explorer.component').then(m => m.PortalStorageFileExplorerComponent);
                }
            }
        ]
    }
] as Routes;
