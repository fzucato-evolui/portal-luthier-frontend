import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { catchError, Observable, throwError } from 'rxjs';
import {UtilFunctions} from '../../shared/util/util-functions';

/**
 * Intercept
 *
 * @param req
 * @param next
 */
export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> =>
{
    const authService = inject(AuthService);

    let headers = req.headers;

    if ( authService.accessToken && !AuthUtils.isTokenExpired(authService.accessToken) )
    {
        headers = headers.set('Authorization', 'Bearer ' + authService.accessToken);
    }
    const luthierDatabase = authService.luthierDatabase;
    if ( UtilFunctions.isValidStringOrArray(luthierDatabase) === true)
    {
        headers = headers.set('X-LuthierDatabaseID', luthierDatabase);
    }

    const dadosDatabase = authService.dadosDatabase;
    if ( UtilFunctions.isValidStringOrArray(dadosDatabase) === true)
    {
        headers = headers.set('X-DadosDatabaseID', dadosDatabase);
    }

    let newReq = req.clone({headers});
    // Response
    return next(newReq).pipe(
        catchError((error) =>
        {
            // Catch "401 Unauthorized" responses
            if ( error instanceof HttpErrorResponse && error.status === 401 )
            {
                // Sign out
                authService.signOut();

                // Reload the app
                location.reload();
            }

            return throwError(error);
        }),
    );
};
