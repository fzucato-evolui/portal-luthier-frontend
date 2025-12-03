import {BooleanInput} from '@angular/cdk/coercion';
import {NgIf} from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {Router} from '@angular/router';
import {firstValueFrom, Subject, takeUntil} from 'rxjs';
import {UserModel} from '../../../shared/models/user.model';
import {UserService} from '../../../shared/services/user/user.service';
import {
    PortalUsersProfileModalComponent
} from '../../../modules/admin/portal/users/modal/portal-users-profile-modal.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
    selector       : 'user',
    templateUrl    : './user.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'user',
    standalone     : true,
    imports: [MatButtonModule, MatMenuModule, NgIf, MatIconModule, MatDividerModule],
})
export class UserComponent implements OnInit, OnDestroy
{
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_showAvatar: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    @Input() showAvatar: boolean = true;
    user: UserModel;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _matDialog: MatDialog,
        private _userService: UserService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to user changes
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: UserModel) =>
            {
                this.user = user;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    /**
     * Sign out
     */
    signOut(): void
    {
        firstValueFrom(this._userService.signOut())
            .then(result => {
                this._router.navigate(['/sign-out']);
                this.user = null;
            });

    }

    openProfileModal(): void {
        const modal = this._matDialog.open(PortalUsersProfileModalComponent, {
            disableClose: true,
            panelClass: 'portal-users-profile-modal-container'
        });
        modal.componentInstance.title = 'Perfil de Usuário';
        modal.componentInstance.model = this.user;
        modal.componentInstance.availableRoles = this.user.roles;
    }

    onAvatarError(event: Event) {
        (event.target as HTMLImageElement).src = 'assets/images/noPicture.png';
    }
}
