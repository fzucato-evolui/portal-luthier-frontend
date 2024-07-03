import {ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes, UrlSegment} from '@angular/router';
import {LuthierComponent} from './luthier.component';
import {inject} from '@angular/core';
import {forkJoin, of} from 'rxjs';
import {LuthierService} from './luthier.service';
import {AuthService} from '../../../core/auth/auth.service';
import {UtilFunctions} from '../../../shared/util/util-functions';

const luthierResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
{
    const authService = inject(AuthService);
    const service = inject(LuthierService);
    const router = inject(Router);
    return forkJoin([
        UtilFunctions.isValidStringOrArray(authService.luthierDatabase) === true ? service.getTables() : of(null),
        UtilFunctions.isValidStringOrArray(authService.luthierDatabase) === true ? service.getVisions() : of(null)
    ])
};

export function luthierMatcher(url: UrlSegment[]) {
    return url.length === 1 && (url[0].path == 'project' || url[0].path == 'connection' || url[0].path == 'dictionary' || url[0].path == 'manager' )
        ? { consumed: url }
        : null;
}
export default [

    // Simple
    {
        matcher     : luthierMatcher,
        component: LuthierComponent,
        resolve  : {
            data: luthierResolver,
        }
    },
] as Routes;
