import {DatePipe, NgIf} from '@angular/common';
import {AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators
} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ActivatedRoute, Router} from '@angular/router';
import {fuseAnimations} from '@fuse/animations';
import {FuseAlertComponent, FuseAlertType} from '@fuse/components/alert';
import {UserService} from '../../../shared/services/user/user.service';
import {Subject, takeUntil} from 'rxjs';
import {UtilFunctions} from '../../../shared/util/util-functions';
import {TipoUsuarioEnum, UserModel} from '../../../shared/models/user.model';
import jwt_decode from "jwt-decode";
import {environment} from '../../../../environments/environment';
import {GoogleConfigModel, SystemConfigModelEnum} from '../../../shared/models/system-config.model';
import {AppPropertiesModel} from '../../../shared/models/root.model';

@Component({
    selector     : 'login',
    templateUrl  : './login.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    standalone   : true,
    imports: [FuseAlertComponent, NgIf, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule, DatePipe],
})
export class LoginComponent implements OnInit, AfterViewInit
{
    @ViewChild('signInNgForm') signInNgForm: NgForm;
    @ViewChild('gbutton') gbutton: ElementRef = new ElementRef({});
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: '',
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;
    enableSocialMedia = false;
    clientID: string;
    appProperties: AppPropertiesModel;
    frontendEnvironment = environment;
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _userService: UserService,
        private _ngZone: NgZone
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
        this._userService.rootService.model$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(value => {
                const index = value.configs.findIndex(x => x.configType.toString() === SystemConfigModelEnum.GOOGLE.toString());
                if (index >= 0) {
                    const c: GoogleConfigModel = value.configs[index].config as GoogleConfigModel;
                    this.enableSocialMedia = c && UtilFunctions.isValidStringOrArray(c.clientID);
                    this.clientID = c?.clientID;
                }
                this.appProperties = value.appProperties;
            })
        // Create the form
        this.signInForm = this._formBuilder.group({
            login     : ['', [Validators.required]],
            password  : ['', Validators.required]
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void
    {
        // Return if the form is invalid
        if ( this.signInForm.invalid )
        {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        const user = new UserModel();
        user.login = this.signInForm.value['login'];
        user.password = this.signInForm.value['password'];
        user.userType = TipoUsuarioEnum.CUSTOM;
        this.doLogin(user);
    }
    doLogin(user: UserModel) {

        this._userService.signIn(user)
            .subscribe(
                () =>
                {
                    const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL');

                    // Navigate to the redirect url
                    if (UtilFunctions.isValidStringOrArray(redirectURL) === true) {
                        this._router.navigateByUrl(redirectURL);
                    } else {
                        this._router.navigate(['']);
                    }
                    this.signInForm.enable();

                },
                (response) =>
                {
                    // Re-enable the form
                    this.signInForm.enable();

                    // Reset the form
                    this.signInNgForm.resetForm();

                    // Set the alert
                    this.alert = {
                        type   : 'error',
                        message: 'Wrong email or password',
                    };

                    // Show the alert
                    this.showAlert = true;
                },
            );

    }

    ngAfterViewInit(): void {
        if (this.enableSocialMedia === true) {

            // @ts-ignore
            window.google.accounts.id.initialize({
                client_id: this.clientID,
                itp_support: true,
                callback: this.handleCallback.bind(this),
            });
            // @ts-ignore
            window.google.accounts.id.renderButton(this.gbutton.nativeElement, {
                type: 'standard',
                theme: 'outline',
                size: 'medium',
                width: 50,
                shape: 'pill',
            });
            // @ts-ignore
            google.accounts.id.prompt();
        }
    }
    // @ts-ignore
    handleCallback(response: google.accounts.id.CredentialResponse) {
        const responsePayload = jwt_decode(response.credential);
        const user = new UserModel();
        user.login = responsePayload['sub'];
        user.password = response.credential;
        user.email = responsePayload['email'];
        user.image = responsePayload['picture'];
        user.name = responsePayload['name'];
        user.userType = TipoUsuarioEnum.GOOGLE;
        const me = this;
        setTimeout(function () {
            me._ngZone.run(()=> {
                me.doLogin(user);
            });
        }, 100);
    }
}
