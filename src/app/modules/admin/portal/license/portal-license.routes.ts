import {ActivatedRouteSnapshot, RouterStateSnapshot, Routes} from '@angular/router';
import {inject} from '@angular/core';
import {PortalLicenseService} from './portal-license.service';
import {PortalLicenseComponent} from './portal-license.component';
import {FuseNavigationService, FuseVerticalNavigationComponent} from '../../../../../@fuse/components/navigation';

const PortalLicenseResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const service = inject(PortalLicenseService);
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
        component: PortalLicenseComponent,
        resolve  : {
            data: PortalLicenseResolver,
        }
    },
] as Routes;
