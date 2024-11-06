import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {Subject} from 'rxjs';
import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    Validators
} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {
    PortalAllowedAccessModel,
    PortalLicenseModel,
    PortalLicenseStatusEnum,
    PortalLicenseTypeEnum
} from '../../../../../shared/models/portal-license.model';
import {PortalLicenseService} from '../portal-license.service';
import {PortalLicenseComponent} from '../portal-license.component';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {DatePipe, JsonPipe, NgFor} from '@angular/common';
import {SharedPipeModule} from '../../../../../shared/pipes/shared-pipe.module';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {UtilFunctions} from '../../../../../shared/util/util-functions';
import {UserModel} from '../../../../../shared/models/user.model';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatCardModule} from '@angular/material/card';
import {cloneDeep} from 'lodash-es';

export function ipValidator(component: PortalLicenseModalComponent) {
    return (control: AbstractControl): ValidationErrors | null => {
        const errors = [];
        const fa = control as FormArray;
        if (fa && UtilFunctions.isValidStringOrArray(fa.controls)) {
            for (const fg of fa.controls) {
                const fc = fg.get('key');
                const ip = fc.value;
                if (component.isValidIP(ip) === false) {
                    fc.setErrors({
                        'invalidIP': true
                    });
                    errors.push({ invalidIP: true });
                }
                else if (fc.hasError('invalidIP') === true) {
                    delete fc.errors.invalidIP;
                    fc.updateValueAndValidity();
                }

                const totalSameIP = fa.controls.filter(x =>
                    UtilFunctions.isValidStringOrArray(x.get('key').value) &&
                    (x.get('key').value.toString().toUpperCase() === fc.value.toString().toUpperCase())).length;
                if (totalSameIP > 1 && fc.hasError('sameIP') === false) {
                    fc.setErrors({
                        'sameIP': true
                    });
                    errors.push({ sameIP: true });
                }
                else if (fc.hasError('sameIP') === true) {
                    delete fc.errors.sameName;
                    fc.updateValueAndValidity();
                }

            }


        }
        if (UtilFunctions.isValidStringOrArray(errors) === true) {
            return errors;
        }
        return null;
    };
}
export function macValidator(component: PortalLicenseModalComponent) {
    return (control: AbstractControl): ValidationErrors | null => {
        const errors = [];
        const fa = control as FormArray;
        if (fa && UtilFunctions.isValidStringOrArray(fa.controls)) {
            for (const fg of fa.controls) {
                const fc = fg.get('key');
                const mac = fc.value;
                if (component.isValidMAC(mac) === false) {
                    fc.setErrors({
                        'invalidMAC': true
                    });
                    errors.push({ invalidMAC: true });
                }
                else if (fc.hasError('invalidMAC') === true) {
                    delete fc.errors.invalidMAC;
                    fc.updateValueAndValidity();
                }

                const totalSameMAC = fa.controls.filter(x =>
                    UtilFunctions.isValidStringOrArray(x.get('key').value) &&
                    (x.get('key').value.toString().toUpperCase() === fc.value.toString().toUpperCase())).length;
                if (totalSameMAC > 1 && fc.hasError('sameMAC') === false) {
                    fc.setErrors({
                        'sameMAC': true
                    });
                    errors.push({ sameMAC: true });
                }
                else if (fc.hasError('sameMAC') === true) {
                    delete fc.errors.sameName;
                    fc.updateValueAndValidity();
                }

            }


        }
        if (UtilFunctions.isValidStringOrArray(errors) === true) {
            return errors;
        }
        return null;
    };
}
@Component({
    selector       : 'portal-license-modal',
    styleUrls      : ['/portal-license-modal.component.scss'],
    templateUrl    : './portal-license-modal.component.html',
    imports: [
        SharedPipeModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        NgFor,
        MatDialogModule,
        NgxMaskDirective,
        JsonPipe,
        MatSlideToggleModule,
        MatDatepickerModule,
        DatePipe,
        MatCardModule
    ],
    providers: [
        provideNgxMask(),
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class PortalLicenseModalComponent implements OnInit, OnDestroy
{
    formSave: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public model: PortalLicenseModel;
    public users: Array<UserModel>;
    title: string;
    private _service: PortalLicenseService;
    private _parent: PortalLicenseComponent;
    PortalLicenseTypeEnum = PortalLicenseTypeEnum;
    PortalLicenseStatusEnum = PortalLicenseStatusEnum;
    public customPatterns = { 'I': { pattern: new RegExp('\[a-zA-Z0-9_\]')} };
    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    set parent(value: PortalLicenseComponent) {
        this._parent = value;
        this._service = this.parent.service;
    }

    get parent(): PortalLicenseComponent {
        return  this._parent;
    }
    constructor(private _formBuilder: FormBuilder,
                private _changeDetectorRef: ChangeDetectorRef,
                public dialogRef: MatDialogRef<PortalLicenseModalComponent>)
    {
    }

    ngOnInit(): void {

        // Create the form
        this.formSave = this._formBuilder.group({
            id: [this.model.id],
            since: [null],
            until: [null],
            licenseType: [null, [Validators.required]],
            status: [null, [Validators.required]],
            allowedAccess: this._formBuilder.group({
                allowedIPs: this._formBuilder.array([], ipValidator(this)),
                allowedMacs: this._formBuilder.array([], macValidator(this))
            }),
            user: [null, [Validators.required]]
        });

        const clone = cloneDeep(this.model);
        clone.allowedAccess = null;
        // Create the form
        this.formSave.patchValue(clone);
        if (this.model.allowedAccess && UtilFunctions.isValidObject(this.model.allowedAccess.allowedIPs)) {
            Object.keys(this.model.allowedAccess.allowedIPs).forEach(key => {
                const fg = this.addAllowedIP();
                fg.get('key').setValue(key);
                fg.get('value').setValue(this.model.allowedAccess.allowedIPs[key]);
            });
        }
        if (this.model.allowedAccess && UtilFunctions.isValidObject(this.model.allowedAccess.allowedMacs)) {
            Object.keys(this.model.allowedAccess.allowedMacs).forEach(key => {
                const fg = this.addAllowedMac();
                fg.get('key').setValue(key);
                fg.get('value').setValue(this.model.allowedAccess.allowedMacs[key]);
            });
        }
        if (UtilFunctions.isValidStringOrArray(this.model.until) === true) {
            this.formSave.get('until').setValue(new Date(this.model.until));
        }

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    doSaving() {

        this.model = cloneDeep(this.formSave.value) as PortalLicenseModel;
        this.model.allowedAccess = new PortalAllowedAccessModel();
        if (UtilFunctions.isValidStringOrArray(this.getAllowedIPs().controls) === true) {
            this.model.allowedAccess.allowedIPs = {};
            for (const fg of this.getAllowedIPs().controls) {
                const ip = fg.get('key').value;
                const desc = fg.get('value').value;
                this.model.allowedAccess.allowedIPs[ip] = desc;
            }
        }
        if (UtilFunctions.isValidStringOrArray(this.getAllowedMacs().controls) === true) {
            this.model.allowedAccess.allowedMacs = {};
            for (const fg of this.getAllowedMacs().controls) {
                const mac = fg.get('key').value?.toString().toUpperCase();
                const desc = fg.get('value').value;
                this.model.allowedAccess.allowedMacs[mac] = desc;
            }
        }
        this._service.save(this.model).then(value => {
            this.parent.messageService.open("Licença salva com sucesso!", "SUCESSO", "success")
            this.dialogRef.close();
        });

    }

    canSave(): boolean {
        if (this.formSave) {
            return !this.formSave.invalid;
        }
        return false;
    }

    compareCode(v1: any , v2: any): boolean {
        if (v1 && v2) {
            if (UtilFunctions.isValidStringOrArray(v1.code) === true) {
                return v1.code === v2.code || v1.code === v2;
            }
            else {
                return v1.id === v2.id || v1.id === v2;
            }
        }
        else {
            return v1 === v2;
        }
    }

    getAllowedIPs() {
        return this.formSave.get('allowedAccess').get('allowedIPs') as FormArray;
    }

    addAllowedIP(): FormGroup {
        const item = this._formBuilder.group({
            key: '',
            value: ''
        });
        this.getAllowedIPs().push(item);
        return item;
    }

    deleteAllowedIP(index) {
        this.getAllowedIPs().removeAt(index);
        this._changeDetectorRef.detectChanges();
    }

    getAllowedMacs() {
        return this.formSave.get('allowedAccess').get('allowedMacs') as FormArray;
    }

    addAllowedMac(): FormGroup {
        const item = this._formBuilder.group({
            key: '',
            value: ''
        });
        this.getAllowedMacs().push(item);
        return item;
    }

    deleteAllowedMac(index) {
        this.getAllowedMacs().removeAt(index);
        this._changeDetectorRef.detectChanges();
    }

    isValidIP(value: string): boolean {
        const ipCidrPattern = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\/(3[0-2]|[12]?[0-9])$/;
        const valid = ipCidrPattern.test(value);
        return valid;
    }

    isValidMAC(value: string): boolean {
        const macPattern = /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/;
        const valid = macPattern.test(value);
        return valid;
    }
}
