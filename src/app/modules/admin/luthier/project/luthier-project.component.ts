import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {Subject, takeUntil} from 'rxjs';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {JsonPipe, NgFor} from '@angular/common';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {SharedPipeModule} from '../../../../shared/pipes/shared-pipe.module';
import {LuthierProjectModel} from '../../../../shared/models/luthier.model';
import {LuthierComponent} from '../luthier.component';
import {DatabaseTypeEnum} from '../../../../shared/models/portal-luthier-database.model';

@Component({
    selector       : 'luthier-project',
    styleUrls      : ['/luthier-project.component.scss'],
    templateUrl    : './luthier-project.component.html',
    imports: [
        SharedPipeModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        NgFor,
        NgxMaskDirective,
        JsonPipe
    ],
    providers: [
        provideNgxMask(),
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class LuthierProjectComponent implements OnInit, OnDestroy
{
    formSave: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public model: LuthierProjectModel;
    DatabaseTypeEnum = DatabaseTypeEnum;

    public customPatterns = {
        'I': { pattern: new RegExp('\[a-zA-Z0-9_\]')},
        'V': { pattern: new RegExp('\[0-9\.\]')}
    };

    constructor(private _formBuilder: FormBuilder,
                private _parent: LuthierComponent,
                private _changeDetectorRef: ChangeDetectorRef)
    {
    }

    ngOnInit(): void {

        this.formSave = this._formBuilder.group({
            code: [null],
            version: ['', [Validators.required]],
            name: ['', [Validators.required]],
            ident: ['', [Validators.required]],
            protocol: [''],
            dbType: [DatabaseTypeEnum.MSSQL, [Validators.required]],
            server: ['', [Validators.required]],
            database: [''],
            user: ['', [Validators.required]],
            password: ['', [Validators.required]],
        });

        this._parent.service.project$
            .pipe(takeUntil(this._parent.unsubscribeAll))
            .subscribe((project: LuthierProjectModel) =>
            {
                this.model = project;
                this.formSave.patchValue(this.model);
            });
        this._parent.workDataBase$
            .pipe(takeUntil(this._parent.unsubscribeAll))
            .subscribe((workDataBase: number) =>
            {
                setTimeout(() => {
                    this._changeDetectorRef.detectChanges();
                }, 0);
            });

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    doSaving() {

        /*
        this.model = this.formSave.value as PortalLuthierDatabaseModel;
        this._service.save(this.model).then(value => {
            this._messageService.open("Metadados de versão salvo com sucesso!", "SUCESSO", "success")
            this.dialogRef.close();
        });

         */
    }

    canSave(): boolean {
        if (this.formSave) {
            return !this.formSave.invalid;
        }
        return false;
    }



}
