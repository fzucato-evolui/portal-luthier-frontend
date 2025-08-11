import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation} from "@angular/core";
import {Subject} from 'rxjs';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {PortalLuthierContextModel} from '../../../../../shared/models/portal-luthier-context.model';
import {PortalLuthierContextService} from '../portal-luthier-context.service';
import {PortalLuthierContextComponent} from '../portal-luthier-context.component';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectChange, MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {NgFor} from '@angular/common';
import {SharedPipeModule} from '../../../../../shared/pipes/shared-pipe.module';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {LuthierDatabaseModel} from '../../../../../shared/models/luthier.model';
import {PortalLuthierDatabaseModel} from '../../../../../shared/models/portal-luthier-database.model';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {UtilFunctions} from '../../../../../shared/util/util-functions';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCardModule} from '@angular/material/card';
import {PortalStorageRootModel} from '../../../../../shared/models/portal-storage.model';
import {PortalStorageConfigType} from '../../../../../shared/models/portal-storage-config.model';

@Component({
    selector       : 'portal-luthier-context-modal',
    styleUrls      : ['/portal-luthier-context-modal.component.scss'],
    templateUrl    : './portal-luthier-context-modal.component.html',
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
        MatSlideToggleModule,
        MatTabsModule,
        MatCardModule
    ],
    providers: [
        provideNgxMask(),
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class PortalLuthierContextModalComponent implements OnInit, OnDestroy
{
    formSave: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public model: PortalLuthierContextModel;
    public databases: Array<LuthierDatabaseModel>;
    public luthierDatabases: Array<PortalLuthierDatabaseModel>;
    public rootStorages: Array<PortalStorageRootModel>;
    title: string;
    private _service: PortalLuthierContextService;
    private _parent: PortalLuthierContextComponent;

    public customPatterns = { 'I': { pattern: new RegExp('\[a-zA-Z0-9_\]')}, 'J': { pattern: new RegExp('\[a-zA-Z0-9_\.\]')} };

    set parent(value: PortalLuthierContextComponent) {
        this._parent = value;
        this._service = this.parent.service;
    }

    get parent(): PortalLuthierContextComponent {
        return  this._parent;
    }
    constructor(private _formBuilder: FormBuilder,
                public dialogRef: MatDialogRef<PortalLuthierContextModalComponent>)
    {
    }

    ngOnInit(): void {

        // Create the form
        this.formSave = this._formBuilder.group({
            id: [this.model.id],
            context: ['', [Validators.required]],
            databaseMaxpool: [100, [Validators.required]],
            databaseMinpool: [1, [Validators.required]],
            metadataMaxpool: [100, [Validators.required]],
            metadataMinpool: [1, [Validators.required]],
            serverUrl: [''],
            description: [''],
            debugDataBase: [null, [Validators.required]],
            licenseServer: [''],
            extraConfiguration: [''],
            dbExtra: [''],
            disableLibs: [false],
            metadataFile: [''],
            luthierProviderService: [''],
            luthierDatabase: [null, [Validators.required]],
            serviceProvidersDataCollection: this._formBuilder.array([]),
            storageProvider: this._formBuilder.group({
                id: [null],
                storage: [null]
            })
        });
        if (UtilFunctions.isValidStringOrArray(this.model.serviceProvidersDataCollection) === true) {
            for (const x of this.model.serviceProvidersDataCollection) {
                this.addProvider();
            }
        }
        // Create the form
        this.formSave.patchValue(this.model);

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    doSaving() {

        this.model = this.formSave.value as PortalLuthierContextModel;
        this._service.save(this.model).then(value => {
            this.parent.messageService.open("Base Luthier salva com sucesso!", "SUCESSO", "success")
            this.dialogRef.close();
        });

    }

    canSave(): boolean {
        if (this.formSave) {
            return !this.formSave.invalid;
        }
        return false;
    }

    luthierDatabaseChange(event: MatSelectChange) {
        this.formSave.get('debugDataBase').setValue(null);
        this._service.getAllDatabases(event.value.id)
            .then(value => {
                this.databases = value;
            });
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

    getProviders(): FormArray {
        return this.formSave.get('serviceProvidersDataCollection') as FormArray;
    }

    addProvider() {
        const g = this._formBuilder.group({
            id: [null],
            name: ['', [Validators.required]],
            classname: ['', [Validators.required]]
        });
        this.getProviders().push(g);
    }

    deleteProvider(index) {
        this.getProviders().removeAt(index);
    }

    protected readonly configTypes = PortalStorageConfigType;
}
