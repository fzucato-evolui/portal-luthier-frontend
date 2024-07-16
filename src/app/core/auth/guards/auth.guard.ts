import {inject} from '@angular/core';
import {CanActivateChildFn, CanActivateFn, Router} from '@angular/router';
import {of, switchMap} from 'rxjs';
import {UserService} from '../../../shared/services/user/user.service';
import {UtilFunctions} from '../../../shared/util/util-functions';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) =>
{
    const router: Router = inject(Router);
    const service = inject(UserService);
    // Check the authentication status
    //return inject(AuthService).check().pipe(
    return service.user$.pipe(
        switchMap((user) =>
        {
            // If the user is not authenticated...
            if ( !user || !user.id )
            {
                // Redirect to the sign-in page with a redirectUrl param
                const redirectURL = state.url === '/sign-out' ? '' : `redirectURL=${state.url}`;
                const urlTree = router.parseUrl(`login?${redirectURL}`);

                return of(urlTree);
            }
            if (route.data && UtilFunctions.isValidStringOrArray(route.data.authorities) === true) {
                if (service.hasAnyAuthority(route.data.authorities) === false) {
                    return of(false);
                }
            }
            // Allow the access
            return of(true);
        }),
    );
};
