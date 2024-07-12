import {ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes, UrlSegment} from '@angular/router';
import {LuthierComponent} from './luthier.component';
import {inject} from '@angular/core';
import {forkJoin, of} from 'rxjs';
import {LuthierService} from './luthier.service';
import {UtilFunctions} from '../../../shared/util/util-functions';
import {UserService} from '../../../shared/services/user/user.service';

const luthierResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
{
    const userService = inject(UserService);
    const service = inject(LuthierService);
    const router = inject(Router);
    return forkJoin([
        UtilFunctions.isValidStringOrArray(userService.luthierDatabase) === true ? service.getProject() : of(null),
        UtilFunctions.isValidStringOrArray(userService.luthierDatabase) === true ? service.getTables() : of(null),
        UtilFunctions.isValidStringOrArray(userService.luthierDatabase) === true ? service.getVisions() : of(null)
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
        data: {authorities: ['ROLE_HYPER']},
        resolve  : {
            data: luthierResolver,
        }
    },
] as Routes;
