import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import {UtilFunctions} from '../../shared/util/util-functions';
import {UserService} from '../../shared/services/user/user.service';

/**
 * Intercept
 *
 * @param req
 * @param next
 */
export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> =>
{
    const authService = inject(UserService);

    let headers = req.headers;

    if ( authService.accessToken )
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
