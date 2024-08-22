import {ActivatedRouteSnapshot, RouterStateSnapshot, Routes} from '@angular/router';
import {inject} from '@angular/core';
import {PortalLuthierHistoryComponent} from './portal-luthier-history.component';
import {FuseNavigationService, FuseVerticalNavigationComponent} from '../../../../../@fuse/components/navigation';
import {PortalLuthierHistoryService} from './portal-luthier-history.service';

const portalLuthierDatabaseResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const navigationService = inject(FuseNavigationService);
    // Get the component -> navigation data -> item
    const navComponent = navigationService.getComponent<FuseVerticalNavigationComponent>('secondaryNavigation');
    const service = inject(PortalLuthierHistoryService);
    // Return if the navigation component does not exist
    if ( navComponent )
    {
        navComponent.navigation = [];
        navComponent.refresh();
    }

    return service.getConfig();
}
export default [

    // Simple
    {
        path     : '',
        component: PortalLuthierHistoryComponent,
        resolve  : {
            data: portalLuthierDatabaseResolver,
        }
    },
] as Routes;
