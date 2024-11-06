import {ActivatedRouteSnapshot, RouterStateSnapshot, Routes} from '@angular/router';
import {inject} from '@angular/core';
import {PortalLuthierContextService} from './portal-luthier-context.service';
import {PortalLuthierContextComponent} from './portal-luthier-context.component';
import {FuseNavigationService, FuseVerticalNavigationComponent} from '../../../../../@fuse/components/navigation';

const portalLuthierContextResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const service = inject(PortalLuthierContextService);
    const navigationService = inject(FuseNavigationService);
    // Get the component -> navigation data -> item
    const navComponent = navigationService.getComponent<FuseVerticalNavigationComponent>('secondaryNavigation');

    // Return if the navigation component does not exist
    if ( navComponent )
    {
        navComponent.navigation = [];
        navComponent.refresh();
    }

    return service.getAll();
}
export default [

    // Simple
    {
        path     : '',
        component: PortalLuthierContextComponent,
        resolve  : {
            data: portalLuthierContextResolver,
        }
    },
] as Routes;
