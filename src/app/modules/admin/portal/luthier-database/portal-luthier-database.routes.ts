import {ActivatedRouteSnapshot, RouterStateSnapshot, Routes} from '@angular/router';
import {inject} from '@angular/core';
import {PortalLuthierDatabaseService} from './portal-luthier-database.service';
import {PortalLuthierDatabaseComponent} from './portal-luthier-database.component';
import {FuseNavigationService, FuseVerticalNavigationComponent} from '../../../../../@fuse/components/navigation';
import {of} from 'rxjs';

const portalLuthierDatabaseResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const service = inject(PortalLuthierDatabaseService);
    const navigationService = inject(FuseNavigationService);
    // Get the component -> navigation data -> item
    const navComponent = navigationService.getComponent<FuseVerticalNavigationComponent>('secondaryNavigation');

    // Return if the navigation component does not exist
    if ( navComponent )
    {
        navComponent.navigation = [];
        navComponent.refresh();
    }

    return of(null);
}
export default [

    // Simple
    {
        path     : '',
        component: PortalLuthierDatabaseComponent,
        resolve  : {
            data: portalLuthierDatabaseResolver,
        }
    },
] as Routes;
