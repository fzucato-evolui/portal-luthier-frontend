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
import {MatIconModule} from '@angular/material/icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {LuthierDictionaryComponent} from '../luthier-dictionary.component';
import {LuthierVisionModel} from '../../../../../shared/models/luthier.model';
import {cloneDeep} from 'lodash-es';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {LuthierService} from '../../luthier.service';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';

export type TableType = 'fields' | 'indexes' | 'references' | 'searchs' | 'groupInfos' | 'customFields' | 'customizations' | 'views' | 'bonds' ;
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
        NgxMaskDirective
    ],
    providers: [
        provideNgxMask(),
    ],
})
export class LuthierDictionaryVisionComponent implements OnInit, OnDestroy
{
    private _model: LuthierVisionModel;
    private _cloneModel: LuthierVisionModel;
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
        this.refresh();
    }

    ngOnDestroy(): void {

    }

    refresh() {
        this.formSave = this.formBuilder.group({
            code: [this.model.code],
            name: ['', [Validators.required]],
            description: ['', [Validators.required]]
        });
        this.formSave.patchValue(this.model);
    }


    save() {
        this.model = Object.assign({}, this.model, this.formSave.value) as LuthierVisionModel;
        console.log(this.model, this.formSave.value);
    }

    revert() {
        this.model = this._model;
        this.refresh();
        this._changeDetectorRef.detectChanges();
    }
}
