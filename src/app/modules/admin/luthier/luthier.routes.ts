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
    let forks = [
        UtilFunctions.isValidStringOrArray(userService.luthierDatabase) === true ? service.getProject() : of(null)
    ]
    if (route.url[0].toString().includes('dictionary')) {
        forks.push(UtilFunctions.isValidStringOrArray(userService.luthierDatabase) === true ? service.getTables() : of(null));
        forks.push(UtilFunctions.isValidStringOrArray(userService.luthierDatabase) === true ? service.getVisions() : of(null));
    }
    else if (route.url[0].toString().includes('users')) {
        forks.push(UtilFunctions.isValidStringOrArray(userService.luthierDatabase) === true ? service.checkUser() : of(null));
        forks.push(UtilFunctions.isValidStringOrArray(userService.luthierDatabase) === true ? service.getUsers() : of(null));
    }
    return forkJoin(forks);
};

export function luthierMatcher(url: UrlSegment[]) {
    return url.length === 1 && (url[0].path == 'project' || url[0].path == 'connection' || url[0].path == 'dictionary'
        || url[0].path == 'manager' || url[0].path === 'users' )
        ? { consumed: url }
        : null;
}
export default [

    // Simple
    {
        matcher     : luthierMatcher,
        component: LuthierComponent,
        data: {authorities: ['ROLE_SUPER', 'ROLE_HYPER']},
        resolve  : {
            data: luthierResolver,
        }
    },
] as Routes;
