import {ActivatedRouteSnapshot, RouterStateSnapshot, Routes} from '@angular/router';
import {inject} from '@angular/core';
import {FuseNavigationService, FuseVerticalNavigationComponent} from '../../../../../@fuse/components/navigation';
import {PortalConfigService} from './portal-config.service';
import {PortalConfigComponent} from './portal-config.component';

const portaConfigResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const service = inject(PortalConfigService);
    const navigationService = inject(FuseNavigationService);
    // Get the component -> navigation data -> item
    const navComponent = navigationService.getComponent<FuseVerticalNavigationComponent>('secondaryNavigation');

    // Return if the navigation component does not exist
    if ( navComponent )
    {
        navComponent.navigation = [];
        navComponent.refresh();
    }

    return service.get();
}
export default [

    // Simple
    {
        path     : '',
        component: PortalConfigComponent,
        resolve  : {
            data: portaConfigResolver,
        }
    },
] as Routes;
