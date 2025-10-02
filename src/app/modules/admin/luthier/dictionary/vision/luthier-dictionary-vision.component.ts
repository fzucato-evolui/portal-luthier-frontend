import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {LuthierDictionaryComponent} from '../luthier-dictionary.component';
import {LuthierModuleModel, LuthierVisionModel} from '../../../../../shared/models/luthier.model';
import {cloneDeep} from 'lodash-es';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {LuthierService} from '../../luthier.service';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {MatMenuModule} from '@angular/material/menu';
import {UtilFunctions} from '../../../../../shared/util/util-functions';
import {Subject, takeUntil} from 'rxjs';
import {LuthierValidator} from '../../../../../shared/validators/luthier.validator';
import {MatSelectModule} from '@angular/material/select';
import {NgForOf} from '@angular/common';
import {TranslocoModule} from '@ngneat/transloco';

export type TableType = 'fields' | 'indexes' | 'references' | 'searches' | 'groupInfos' | 'customFields' | 'customizations' | 'views' | 'bonds' ;
@Component({
    selector     : 'luthier-dictionary-vision',
    templateUrl  : './luthier-dictionary-vision.component.html',
    styleUrls : ['/luthier-dictionary-vision.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone   : true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatTooltipModule,
        NgxMaskDirective,
        MatMenuModule,
        MatSelectModule,
        NgForOf,
        TranslocoModule
    ],
    providers: [
        provideNgxMask(),
    ],
})
export class LuthierDictionaryVisionComponent implements OnInit, OnDestroy, AfterViewInit
{
    protected hasChanged = false;
    private _model: LuthierVisionModel;
    protected modules: LuthierModuleModel[] = []
    private _cloneModel: LuthierVisionModel;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public customPatterns = { 'I': { pattern: new RegExp('\[a-zA-Z0-9_\]')}};
    @Input()
    set model(value: LuthierVisionModel) {
        this._model = value;
        this._cloneModel = cloneDeep(this._model);
    }
    get model(): LuthierVisionModel {
        return this._cloneModel;
    }
    get service(): LuthierService {
        return this._parent.service;
    }
    get messageService(): MessageDialogService {
        return this._parent.messageService;
    }
    formSave: FormGroup;
    constructor(private _changeDetectorRef: ChangeDetectorRef,
                public formBuilder: FormBuilder,
                private _parent: LuthierDictionaryComponent)
    {
    }

    ngOnInit(): void {
        this.service.modules$.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                this.modules = value;
            });

        this.refresh();
    }

    ngOnDestroy(): void {

    }

    ngAfterViewInit() {
        if (UtilFunctions.isValidStringOrArray(this.model.code)) {
            UtilFunctions.forceValidations(this.formSave);
        }
        this.hasChanged = !LuthierValidator.validateVision(this.model, this._model).isSame;
    }

    refresh() {
        this.formSave = this.formBuilder.group({
            code: [this.model.code],
            name: ['', [Validators.required]],
            description: ['', [Validators.required]],
            module: [null]
        });
        this.formSave.patchValue(this.model);
        this.hasChanged = false;
        this.formSave.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(value => {
                this._cloneModel = Object.assign({}, this.model, this.formSave.value) as LuthierVisionModel;
                const ret = LuthierValidator.validateVision(this.model, this._model);
                this.hasChanged = !ret.isSame;
            });
    }


    save() {
        this._cloneModel = Object.assign({}, this.model, this.formSave.value) as LuthierVisionModel;
        this.service.saveVision(this._cloneModel)
            .then(result => {
                result.id = this._cloneModel.id;
                this.model = result;
                this.refresh();
                const index = this._parent.tabsOpened.findIndex(x => x.id === this.model.id);
                this._parent.tabsOpened[index].name = this.model.name;
                //this._parent.selectedTab = this.model;
                this._changeDetectorRef.detectChanges();
                this.messageService.open(`Visão salva com sucesso`, 'SUCESSO', 'success')
            })
    }

    canSave(): boolean {
        if (this.formSave) {
            if (this.formSave.invalid || UtilFunctions.isValidObject(this.model.invalidFields)) {
                return false;
            }
        }
        return this.hasChanged === true;
    }

    revert() {
        this.model = this._model;
        this.refresh();
        this._changeDetectorRef.detectChanges();
    }

    async readVisionFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            const model = JSON.parse(text) as LuthierVisionModel;
            setTimeout(() => {
                this.importVision(model);
            })
        } catch (error) {
            this.messageService.open('Erro ao ler conteúdo da área de transferência '+ error, 'ERRO', 'error');
            console.error('Failed to read clipboard contents: ', error);
        }
    }

    readVisionFromFile(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            // You can further process the selected file here
            const reader = new FileReader();
            reader.onload = () => {
                const text = reader.result as string;
                const model = JSON.parse(text) as LuthierVisionModel;
                setTimeout(() => {
                    this.importVision(model);
                });

            };
            reader.onerror = (error) => {
                this.messageService.open('Erro ao ler arquivo '+ error, 'ERRO', 'error');
            };
            reader.readAsText(file);
        }
    }

    importVision(model: LuthierVisionModel) {
        if (model) {
            try {
                if (UtilFunctions.isValidStringOrArray(model.code) === false) {
                    this.messageService.open('Erro ao ler visão', 'ERRO', 'error');
                    return;
                }
                if (model.objectType != this.model.objectType) {
                    this.messageService.open('Erro ao ler visão', 'ERRO', 'error');
                    return;
                }
                if (UtilFunctions.isValidStringOrArray(this.model.code) === false) {
                    this.model.name = model.name;
                }
                model.name = this.model.name;
                model.previousName = this.model.previousName;
                model.code = this.model.code;
                model.id = this.model.id;
                if (model.module && UtilFunctions.isValidStringOrArray(model.module.code) === true) {
                    const moduleIndex = this.modules.findIndex(x => UtilFunctions.equalsIgnoreCase(model.module.name, x.name));
                    if (moduleIndex >= 0) {
                        model.module = this.modules[moduleIndex];
                    }
                    else {
                        model.module = null;
                    }
                }

                this._cloneModel = model;
                this.refresh();
                this._changeDetectorRef.detectChanges();
                this.messageService.open('Importação realizada com sucesso', 'SUCESSO', 'success');

            } catch (e) {
                this.messageService.open('Erro na importação : ' + e, 'ERRO', 'error');
            }
        }
    }

    showValidationsError(): string {
        if (UtilFunctions.isValidObject(this.model.invalidFields) === true) {
            return JSON.stringify(this.model.invalidFields, null, 2);
        }
        else if (this.hasChanged === false) {
            return 'Nenhuma alteração feita';
        }
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
}
