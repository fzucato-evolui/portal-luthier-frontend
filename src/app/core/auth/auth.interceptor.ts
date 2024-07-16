import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import {UtilFunctions} from '../../shared/util/util-functions';
import {UserService} from '../../shared/services/user/user.service';
import {DialogConfirmationConfig, MessageDialogService} from '../../shared/services/message/message-dialog-service';
import {FuseSplashScreenService} from '../../../@fuse/services/splash-screen';

/**
 * Intercept
 *
 * @param req
 * @param next
 */
export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> =>
{
    const authService = inject(UserService);
    const _messageService = inject(MessageDialogService);
    const splashService = inject(FuseSplashScreenService)

    const showWarning = (error) => {
        const config: DialogConfirmationConfig = {
            title      : 'ALERTA',
            message    : (UtilFunctions.getHttpErrorMessage(error) as string).replace(new RegExp('\r?\n','g'), '<br />'),
            icon       : {
                show : true,
                name : 'fa-exclamation-circle',
                color: 'warn'
            },
            actions    : {
                confirm: {
                    show : true,
                    color: 'warn',
                    label: 'OK'
                },
                cancel : {
                    show : false,
                }
            },
            dismissible: false
        };

        const dialogRef = _messageService.open(
            (UtilFunctions.getHttpErrorMessage(error) as string).replace(new RegExp('\r?\n','g'), '<br />'),
            "ALERTA",
            'error');
    }

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
                return;
            }
            splashService.hide();
            showWarning(error);
            return throwError(error);
        }),
    );

};
