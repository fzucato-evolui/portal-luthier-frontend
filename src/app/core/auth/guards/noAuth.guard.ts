import {inject} from '@angular/core';
import {CanActivateChildFn, CanActivateFn, Router} from '@angular/router';
import {of, switchMap} from 'rxjs';
import {UserService} from '../../../shared/services/user/user.service';

export const NoAuthGuard: CanActivateFn | CanActivateChildFn = (route, state) =>
{
    const router: Router = inject(Router);

    // Check the authentication status
    return inject(UserService).user$.pipe(
        switchMap((user) =>
        {
            // If the user is authenticated...
            if ( user && user.id )
            {
                return of(router.parseUrl(''));
            }

            // Allow the access
            return of(true);
        }),
    );
};
