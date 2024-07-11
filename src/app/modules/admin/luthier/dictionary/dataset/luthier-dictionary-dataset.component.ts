import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule, NgClass, NgForOf, NgIf, NgTemplateOutlet} from '@angular/common';
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTabChangeEvent, MatTabsModule} from '@angular/material/tabs';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {LuthierDictionaryComponent} from '../luthier-dictionary.component';
import {
    LuthierCustomizationModel,
    LuthierFieldCharcaseEnum,
    LuthierFieldCharcaseEnumParser,
    LuthierFieldEditorEnum,
    LuthierFieldEditorEnumParser,
    LuthierFieldLayoutEnum,
    LuthierFieldModifierEnum,
    LuthierFieldTypeEnum,
    LuthierGroupInfoModel,
    LuthierGroupInfoTypeEnum,
    LuthierReferenceStatusEnum,
    LuthierSearchFieldEditorEnum,
    LuthierSearchFieldOperatorEnum,
    LuthierSearchStatusEnum,
    LuthierSearchTypeEnum,
    LuthierTableModel,
    LuthierTableReferenceModel,
    LuthierVisionDatasetCustomFieldModel,
    LuthierVisionDatasetFieldModel,
    LuthierVisionDatasetFieldTypeEnum,
    LuthierVisionDatasetModel,
    LuthierVisionDatasetSearchModel,
    LuthierVisionGroupInfoModel
} from '../../../../../shared/models/luthier.model';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule, Sort} from '@angular/material/sort';
import {UtilFunctions} from '../../../../../shared/util/util-functions';
import {cloneDeep} from 'lodash-es';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import {SharedPipeModule} from '../../../../../shared/pipes/shared-pipe.module';
import {MatSelectChange, MatSelectModule} from '@angular/material/select';
import {LuthierFieldValidator} from '../../../../../shared/validators/luthier.validator';
import {MatDialog} from '@angular/material/dialog';
import {LuthierService} from '../../luthier.service';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {
    LuthierDictionaryDatasetFieldModalComponent
} from './modal/field/luthier-dictionary-dataset-field-modal.component';
import {
    LuthierDictionaryDatasetSearchModalComponent
} from './modal/search/luthier-dictionary-dataset-search-modal.component';

export type TableType = 'fields' | 'indexes' | 'references' | 'searchs' | 'groupInfos' | 'customFields' | 'customizations' | 'views' | 'bonds' ;
@Component({
    selector     : 'luthier-dictionary-dataset',
    templateUrl  : './luthier-dictionary-dataset.component.html',
    styleUrls : ['/luthier-dictionary-dataset.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone   : true,
    imports: [
        NgClass,
        MatIconModule,
        MatButtonModule,
        NgForOf,
        FormsModule,
        CommonModule,
        MatInputModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatTooltipModule,
        NgIf,
        MatExpansionModule,
        MatTabsModule,
        MatSlideToggleModule,
        MatTableModule,
        MatSortModule,
        NgxMaskDirective,
        MatButtonToggleModule,
        MatCheckboxModule,
        SharedPipeModule,
        MatSelectModule,
        NgTemplateOutlet
    ],
    providers: [
        provideNgxMask(),
    ],
})
export class LuthierDictionaryDatasetComponent implements OnInit, OnDestroy, AfterViewInit
{
    private _model: LuthierVisionDatasetModel;
    public fieldsDataSource = new MatTableDataSource<LuthierVisionDatasetFieldModel>();
    @ViewChildren('sortFields') sortFields: QueryList<MatSort>;
    public searchsDataSource = new MatTableDataSource<LuthierVisionDatasetSearchModel>();
    @ViewChild('sortSearchs') sortSearchs: MatSort;
    public customFieldsDataSource = new MatTableDataSource<LuthierVisionDatasetCustomFieldModel>();
    public customizationsDataSource = new MatTableDataSource<LuthierVisionDatasetFieldModel>();
    public groupsInfoDataSource = new MatTableDataSource<LuthierVisionGroupInfoModel>();
    currentTab: TableType = 'fields';
    fieldRowEditing: { [key: string]: string } = {}
    private _cloneModel: LuthierVisionDatasetModel;
    tables: LuthierTableModel[];
    @Input()
    set model(value: LuthierVisionDatasetModel) {
        this._model = value;
        this._cloneModel = cloneDeep(this._model);
        this.tables = cloneDeep(this.parent.tables);
        this.setParentRelation();
    }
    get model(): LuthierVisionDatasetModel {
        return this._cloneModel;
    }
    get parent(): LuthierDictionaryComponent {
        return this._parent;
    }
    get service(): LuthierService {
        return this._parent.service;
    }
    get messageService(): MessageDialogService {
        return this._parent.messageService;
    }
    formSave: FormGroup;
    displayedFieldColumns = ['buttons', 'order', 'code', 'fieldType', 'tableField.key', 'tableField.name', 'label', 'customLabel', 'mask', 'groupInfo.description',
        'tableField.fieldType', 'tableField.size',  'readOnly', 'visible', 'notNull', 'search', 'tableField.defaultValue', 'tableField.precision',
        'tableField.maxValue', 'tableField.minValue', 'charCase', 'editor', 'lookupFilter', 'reference.name', 'technicalDescription', 'userDescription',
        'uiConfiguration', 'layoutSize'];
    displayedFieldColumns2 = ['buttons', 'code'];
    displayedIndexColumns = ['buttons', 'code', 'sortType', 'name',
        'creationOrder', 'unique', 'validationMessage'];
    displayedReferenceColumns = ['buttons', 'code', 'status', 'name', 'tablePK.name', 'onUpdate',
        'onDelete', 'attributeName', 'updateMessage', 'deleteMessage'];
    displayedGroupInfoColumns = ['buttons', 'code', 'order', 'description', 'groupInfoType',
        'parent.description'];
    displayedCustomFieldColumns = ['buttons', 'order', 'code', 'fieldType', 'tableField.key', 'tableField.name', 'label', 'mask', 'groupInfo',
        'tableField.fieldType', 'tableField.size',  'readOnly', 'visible', 'notNull', 'search', 'tableField.defaultValue', 'tableField.precision',
        'tableField.maxValue', 'tableField.minValue', 'charCase', 'editor', 'lookupFilter', 'reference', 'technicalDescription', 'userDescription',
        'uiConfiguration', 'layoutSize'];
    displayedCustomizationsColumns = ['buttons', 'code', 'tableField.name', 'customMask', 'customReadOnly',
        'customVisible', 'customNotNull', 'customCharCase', 'customEditor', 'customLookupFilter', 'customUiConfiguration'];
    displayedBondColumns = [ 'code', 'name', 'description'];
    displayedSearchColumns = [ 'buttons', 'code', 'name', 'customName', 'order', 'status', 'type'];
    LuthierVisionDatasetFieldTypeEnum = LuthierVisionDatasetFieldTypeEnum;
    LuthierFieldTypeEnum = LuthierFieldTypeEnum;
    LuthierFieldModifierEnum = LuthierFieldModifierEnum;
    LuthierFieldLayoutEnum = LuthierFieldLayoutEnum;
    LuthierFieldEditorEnum = LuthierFieldEditorEnum;
    LuthierFieldCharcaseEnum = LuthierFieldCharcaseEnum;
    LuthierGroupInfoTypeEnum = LuthierGroupInfoTypeEnum
    parentRelation: LuthierTableReferenceModel;
    // @ts-ignore
    @HostListener('document:keydown', ['$event'])
    onKeydownHandler(event: KeyboardEvent) {
        if (event.code === 'F8' || event.code === 'Escape') {
            if (UtilFunctions.isValidStringOrArray(this.fieldRowEditing[this.currentTab]) === true) {
                event.preventDefault();
                const field = this.model[this.currentTab][this.fieldRowEditing[this.currentTab]];
                const fg = this.getFieldGroup(field.id, this.currentTab);
                fg.patchValue(field);
                this.fieldRowEditing[this.currentTab] = null;
                this._changeDetectorRef.detectChanges();
            }
        }
    }
    constructor(private _changeDetectorRef: ChangeDetectorRef,
                public formBuilder: FormBuilder,
                private _matDialog: MatDialog,
                private _parent: LuthierDictionaryComponent)
    {
    }

    ngOnInit(): void {
        this.refresh();
    }

    ngOnDestroy(): void {

    }

    ngAfterViewInit() {
        UtilFunctions.setSortingDataAccessor(this.fieldsDataSource);
        this.fieldsDataSource.sort = this.sortFields.get(0);
        UtilFunctions.setSortingDataAccessor(this.searchsDataSource);
        this.searchsDataSource.sort = this.sortSearchs;
        UtilFunctions.setSortingDataAccessor(this.groupsInfoDataSource);
        this.groupsInfoDataSource.sort = this.sortFields.get(1);
        UtilFunctions.setSortingDataAccessor(this.customFieldsDataSource);
        this.customFieldsDataSource.sort = this.sortFields.get(2);
        UtilFunctions.setSortingDataAccessor(this.customizationsDataSource);
        this.customizationsDataSource.sort = this.sortFields.get(3);

    }

    refresh() {
        this.formSave = this.formBuilder.group({
            code: [this.model.code],
            name: ['', [Validators.required]],
            description: [''],
            customDescription: this.addCustomizationField(),
            filter: [''],
            customFilter: this.addCustomizationField(),
            uiConfiguration: ['', []],
            parent: this.formBuilder.group({
                code: [this.model.code],
                name: ['', [Validators.required]],
                description: ['']
            }),
            table: this.formBuilder.group({
                code: [this.model.code],
                name: ['', [Validators.required]],
                description: ['']
            }),
            vision: this.formBuilder.group({
                code: [this.model.code],
                name: ['', [Validators.required]],
                description: ['']
            }),
            objectType: [''],
            groupInfos: this.formBuilder.array([]),
        });
        this.addFields('fields');
        this.addFields('customFields');
        this.addGroupInfos();
        this.setCustomizations();
        this.formSave.patchValue(this.model);
        this.fieldsDataSource.data = this.model.fields;
        this.searchsDataSource.data = this.model.searchs;
        this.customFieldsDataSource.data = this.model.customFields;
        this.customizationsDataSource.data = this.model.fields;
        this.groupsInfoDataSource.data = this.model.groupInfos;
    }

    setCustomizations() {
        if (UtilFunctions.isValidStringOrArray(this.model.customizations)) {
            this.model.customizations.forEach(x => {
                if ( x.type === 'FIELD_VISION') {
                    const index = this.model.fields.findIndex(y => y.name?.toUpperCase() === x.name3?.toUpperCase());
                    if (index >= 0) {
                        this.model.fields[index].customLabel = x;
                    }
                }
                else if ( x.type === 'SEARCH_VISION') {
                    const index = this.model.searchs.findIndex(y => y.name?.toUpperCase() === x.name3?.toUpperCase());
                    if (index >= 0) {
                        this.model.searchs[index].customName = x;
                    }
                }
                else if ( x.type === 'SEARCH_FIELD_VISION') {
                    let index = this.model.searchs.findIndex(y => y.name?.toUpperCase() === x.name3?.toUpperCase());
                    if (index >= 0) {
                        const search = this.model.searchs[index];
                        index = search.searchFields.findIndex(y => y.field.name?.toUpperCase() === x.name4?.toUpperCase());
                        if (index >= 0) {
                            search.searchFields[index].customLabel = x;
                        }
                    }
                }
                else if ( x.type === 'VISION_FIELD_MASK') {
                    let index = this.model.fields.findIndex(y => y.tableField?.name?.toUpperCase() === x.name3?.toUpperCase());
                    if (index >= 0) {
                        this.model.fields[index].customMask = x;
                    }
                }
                else if ( x.type === 'VISION_FIELD_READONLY') {
                    let index = this.model.fields.findIndex(y => y.tableField?.name?.toUpperCase() === x.name3?.toUpperCase());
                    if (index >= 0) {
                        x.value = UtilFunctions.parseBoolean(x.value);
                        this.model.fields[index].customReadOnly = x;
                    }
                }
                else if ( x.type === 'VISION_FIELD_VISIBLE') {
                    let index = this.model.fields.findIndex(y => y.tableField?.name?.toUpperCase() === x.name3?.toUpperCase());
                    if (index >= 0) {
                        x.value = UtilFunctions.parseBoolean(x.value);
                        this.model.fields[index].customVisible = x;
                    }
                }
                else if ( x.type === 'VISION_FIELD_REQUIRED') {
                    let index = this.model.fields.findIndex(y => y.tableField?.name?.toUpperCase() === x.name3.toUpperCase());
                    if (index >= 0) {
                        x.value = UtilFunctions.parseBoolean(x.value);
                        this.model.fields[index].customNotNull = x;
                    }
                }

                else if ( x.type === 'VISION_FIELD_CHARCASE') {
                    let index = this.model.fields.findIndex(y => y.tableField?.name?.toUpperCase() === x.name3?.toUpperCase());
                    if (index >= 0) {
                        x.value = LuthierFieldCharcaseEnumParser.toValue(x.value);
                        this.model.fields[index].customCharCase = x;
                    }
                }
                else if ( x.type === 'VISION_FIELD_EDITORTYPE') {
                    let index = this.model.fields.findIndex(y => y.tableField?.name?.toUpperCase() === x.name3?.toUpperCase());
                    if (index >= 0) {
                        x.value = LuthierFieldEditorEnumParser.toValue(x.value);
                        this.model.fields[index].customEditor = x;
                    }
                }
                else if ( x.type === 'VISION_FIELD_LOOKUPFILTER') {
                    let index = this.model.fields.findIndex(y => y.tableField?.name?.toUpperCase() === x.name3?.toUpperCase());
                    if (index >= 0) {
                        this.model.fields[index].customLookupFilter = x;
                    }
                }
                else if ( x.type === 'VISION_DATASET_DESCRIPTION') {
                    this.model.customDescription = x;
                }
                else if ( x.type === 'VISION_DATASET_FILTER') {
                    this.model.customFilter = x;
                }
                else if ( x.type === 'VISION_FIELD_UICONFIGURATION') {
                    let index = this.model.fields.findIndex(y => y.tableField?.name?.toUpperCase() === x.name3?.toUpperCase());
                    if (index >= 0) {
                        this.model.fields[index].customUiConfiguration = x;
                    }
                }
            });
        }
    }

    add(type: TableType) {
        if (type === 'groupInfos') {
            this.newGroupInfo();
        }
        else {
            const modal = this._matDialog.open(LuthierDictionaryDatasetFieldModalComponent, { disableClose: true, panelClass: 'luthier-dictionary-dataset-field-modal-container' });
            modal.componentInstance.title = 'Adição de Campos' + (type === 'customFields' ? ' Customizados ' : ' ') + 'do Dataset ' + this.model.name;
            modal.componentInstance.parent = this;
            modal.componentInstance.fieldType = type;
            modal.afterClosed().subscribe((result) =>
            {
                if ( result === 'ok' ) {
                    modal.componentInstance.model.fields.selected.forEach(x => {
                        let dsField: LuthierVisionDatasetFieldModel | LuthierVisionDatasetCustomFieldModel;
                        if (type === 'customFields') {
                            dsField = x as LuthierVisionDatasetCustomFieldModel;
                        }
                        else {
                            dsField = x as LuthierVisionDatasetFieldModel;
                        }
                        x.groupInfo = null;
                        dsField.tableField = x;
                        dsField.id = crypto.randomUUID();
                        dsField.fieldType = modal.componentInstance.model.fieldType;
                        if (dsField.fieldType === LuthierVisionDatasetFieldTypeEnum.LOOKUP) {
                            if (type === 'fields') {
                                dsField.reference = modal.componentInstance.model.reference;
                            }
                            else {
                                dsField.reference = modal.componentInstance.model.reference.name;
                            }
                        }
                        const c = this.addField(type);
                        c.patchValue(dsField);
                        const fields = this.getFields(type);
                        fields.push(c);
                        if (type === 'customFields') {
                            this.customFieldsDataSource.data.push(dsField as LuthierVisionDatasetCustomFieldModel);
                            this.customFieldsDataSource._updateChangeSubscription();
                        }
                        else {
                            this.fieldsDataSource.data.push(dsField as LuthierVisionDatasetFieldModel);
                            this.fieldsDataSource._updateChangeSubscription();
                        }

                    })
                    this._changeDetectorRef.detectChanges();
                }

            });
        }
    }

    delete(id: string, index: number,type: TableType) {
        const fieldIndex = this.getFields(type).controls.findIndex(x => x.get("id").value === id);
        this.getFields(type).removeAt(fieldIndex);
        if (type === 'groupInfos') {
            this.deleteGroupInfo(id, index);
        }
        else {
            const dataSource = type === 'fields' ? this.fieldsDataSource : this.customFieldsDataSource;
            const code = dataSource.data[index].code;
            dataSource.data.splice(index, 1);
            dataSource._updateChangeSubscription();
            if (type === 'fields') {
                this.customizationsDataSource._updateChangeSubscription();
                let deleted = false;
                this.searchsDataSource.data.forEach(search => {
                    if (UtilFunctions.isValidStringOrArray(search.searchFields) === true) {
                        for (let index = 0; index < search.searchFields.length;) {
                            if (search.searchFields[index].field &&
                                (search.searchFields[index].field.id === id || search.searchFields[index].field.code === code)) {
                                search.searchFields.splice(index, 1);
                                deleted = true;
                                continue;
                            }
                            index++;
                        }
                    }
                });
                this._changeDetectorRef.detectChanges();
            }
        }
    }

    announceSortChange(event: Sort) {

    }

    save() {
        this.model = Object.assign({}, this.model, this.formSave.value) as LuthierVisionDatasetModel;
        this.saveCustomizations();
        console.log(this.model, this.formSave.value, this.model.customizations);
    }

    saveCustomizations() {
        const customizations: LuthierCustomizationModel[] = [];
        if (this.model.customDescription
            && UtilFunctions.isValidStringOrArray(this.model.customDescription.value) === true
            && this.model.customDescription.value !== this.model.description
        ) {
            this.model.customDescription.type = 'VISION_DATASET_DESCRIPTION';
            this.model.customDescription.name1 = this.model.vision.name;
            this.model.customDescription.name2 = this.model.name;
            customizations.push(this.model.customDescription);
        }

        if (this.model.customFilter
            && UtilFunctions.isValidStringOrArray(this.model.customFilter.value) === true
            && this.model.customFilter.value !== this.model.filter
        ) {
            this.model.customDescription.type = 'VISION_DATASET_FILTER';
            this.model.customDescription.name1 = this.model.vision.name;
            this.model.customDescription.name2 = this.model.name;
            customizations.push(this.model.customFilter);
        }
        this.model.fields.forEach(model => {
            if (model.customLabel
                && UtilFunctions.isValidStringOrArray(model.customLabel.value) === true
                && model.customLabel.value !== model.label
            ) {
                model.customLabel.type = 'FIELD_VISION';
                model.customLabel.name1 = this.model.vision.name;
                model.customLabel.name2 = this.model.name;
                model.customLabel.name3 = model.name;
                customizations.push(model.customLabel);
            }
            if (model.customMask
                && UtilFunctions.isValidStringOrArray(model.customMask.value) === true
                && model.customMask.value !== model.mask
            ) {
                model.customMask.type = 'VISION_FIELD_MASK';
                model.customMask.name1 = this.model.vision.name;
                model.customMask.name2 = this.model.name;
                model.customMask.name3 = model.name;
                customizations.push(model.customMask);
            }
            if (model.customReadOnly
                && UtilFunctions.isValidStringOrArray(model.customReadOnly.value) === true
                && model.customReadOnly.value !== model.readOnly
            ) {
                model.customReadOnly.type = 'VISION_FIELD_READONLY';
                model.customReadOnly.name1 = this.model.vision.name;
                model.customReadOnly.name2 = this.model.name;
                model.customReadOnly.name3 = model.name;
                model.customReadOnly.value = UtilFunctions.parseBoolean(model.customReadOnly.value) ? '1' : '0';
                customizations.push(model.customReadOnly);
            }
            if (model.customVisible
                && UtilFunctions.isValidStringOrArray(model.customVisible.value) === true
                && model.customVisible.value !== model.visible
            ) {
                model.customVisible.type = 'VISION_FIELD_VISIBLE';
                model.customVisible.name1 = this.model.vision.name;
                model.customVisible.name2 = this.model.name;
                model.customVisible.name3 = model.name;
                model.customVisible.value = UtilFunctions.parseBoolean(model.customVisible.value) ? '1' : '0';
                customizations.push(model.customVisible);
            }
            if (model.customNotNull
                && UtilFunctions.isValidStringOrArray(model.customNotNull.value) === true
                && model.customNotNull.value !== model.notNull
            ) {
                model.customNotNull.type = 'VISION_FIELD_REQUIRED';
                model.customNotNull.name1 = this.model.vision.name;
                model.customNotNull.name2 = this.model.name;
                model.customNotNull.name3 = model.name;
                model.customNotNull.value = UtilFunctions.parseBoolean(model.customNotNull.value) ? '1' : '0';
                customizations.push(model.customNotNull);
            }
            if (model.customCharCase
                && UtilFunctions.isValidStringOrArray(model.customCharCase.value) === true
                && model.customCharCase.value !== model.charCase
            ) {
                model.customCharCase.type = 'VISION_FIELD_CHARCASE';
                model.customCharCase.name1 = this.model.vision.name;
                model.customCharCase.name2 = this.model.name;
                model.customCharCase.value = LuthierFieldCharcaseEnumParser.fromValue(model.customCharCase.value);
                customizations.push(model.customCharCase);
            }
            if (model.customEditor
                && UtilFunctions.isValidStringOrArray(model.customEditor.value) === true
                && model.customEditor.value !== model.editor
            ) {
                model.customEditor.type = 'VISION_FIELD_EDITORTYPE';
                model.customEditor.name1 = this.model.vision.name;
                model.customEditor.name2 = this.model.name;
                model.customEditor.name3 = model.name;
                model.customEditor.value = LuthierFieldEditorEnumParser.fromValue(model.customEditor.value);
                customizations.push(model.customEditor);
            }
            if (model.customLookupFilter
                && UtilFunctions.isValidStringOrArray(model.customLookupFilter.value) === true
                && model.customLookupFilter.value !== model.lookupFilter
            ) {
                model.customLookupFilter.type = 'VISION_FIELD_LOOKUPFILTER';
                model.customLookupFilter.name1 = this.model.vision.name;
                model.customLookupFilter.name2 = this.model.name;
                model.customLookupFilter.name3 = model.name;
                customizations.push(model.customLookupFilter);
            }
            if (model.customUiConfiguration
                && UtilFunctions.isValidStringOrArray(model.customUiConfiguration.value) === true
                && model.customUiConfiguration.value !== model.uiConfiguration
            ) {
                model.customUiConfiguration.type = 'VISION_FIELD_UICONFIGURATION';
                model.customUiConfiguration.name1 = this.model.vision.name;
                model.customUiConfiguration.name2 = this.model.name;
                model.customUiConfiguration.name3 = model.name;
                customizations.push(model.customUiConfiguration);
            }
        });

        this.model.searchs.forEach(model => {
            if (model.customName
                && UtilFunctions.isValidStringOrArray(model.customName.value) === true
                && model.customName.value !== model.name
            ) {
                model.customName.type = 'SEARCH_VISION';
                model.customName.name1 = this.model.vision.name;
                model.customName.name2 = this.model.name;
                model.customName.name3 = model.name;
                customizations.push(model.customName);
            }
            model.searchFields.forEach(searchFieldModel => {
                if (searchFieldModel.customLabel
                    && UtilFunctions.isValidStringOrArray(searchFieldModel.customLabel) === true
                    && searchFieldModel.customLabel.value !== searchFieldModel.label
                ) {
                    const fieldIndex = this.model.fields.findIndex(x => x.id === searchFieldModel.field.id);
                    if (fieldIndex >= 0) {
                        searchFieldModel.customLabel.type = 'SEARCH_FIELD_VISION';
                        searchFieldModel.customLabel.name1 = this.model.vision.name;
                        searchFieldModel.customLabel.name2 = this.model.name;
                        searchFieldModel.customLabel.name3 = model.name;
                        searchFieldModel.customLabel.name4 = this.model.fields[fieldIndex].name;
                        customizations.push(searchFieldModel.customLabel);
                    }
                }
            });
        });

    }


    revert() {
        this.model = this._model;
        this.refresh();
        this._changeDetectorRef.detectChanges();
    }

    getFields(type: TableType): FormArray {
        return this.formSave.get(type === 'customizations' ? 'fields' : type) as FormArray;
    }
    getFieldGroup(id: string, type: TableType): FormGroup {
        const index =(this.formSave.get(type === 'customizations' ? 'fields' : type) as FormArray).controls.findIndex(x => x.get("id").value === id);
        const fg = (this.formSave.get(type === 'customizations' ? 'fields' : type) as FormArray).at(index) as FormGroup;
        return fg;
    }
    addFields(type: TableType) {
        let fields = this.getFields(type);
        if (!fields) {
            fields =  this.formBuilder.array([]);
            this.formSave.addControl(type, fields);
        }
        const modelFields = type === 'fields' ? this.model.fields : this.model.customFields;
        if (UtilFunctions.isValidStringOrArray(modelFields) === true) {
            modelFields.forEach(x => {
                x.id = crypto.randomUUID();
                /*
                if (UtilFunctions.isValidStringOrArray(this.model.customizations) === true) {
                    const index = this.model.customizations.findIndex(y =>
                        y.type === 'FIELD_TABLE' && y.name2 && y.name2.toUpperCase() === x.name.toUpperCase());
                    if (index >= 0) {
                        x['customLabel']= this.model.customizations[index].value;
                        return;
                    }
                }
                 */
                const c = this.addField(type);
                fields.push(c);
            })
        }
    }
    addGroupInfos() {
        const fa = (this.formSave.get('groupInfos') as FormArray);
        fa.clear();
        if (UtilFunctions.isValidStringOrArray(this.model.groupInfos) === true) {
            this.model.groupInfos.forEach(x => {
                x.id = crypto.randomUUID();
                fa.push(this.addGroupInfoField())
            })
        }
    }
    addField(type: TableType): FormGroup {
        const c = this.formBuilder.group({
                id: [crypto.randomUUID()],
                code: [null],
                name: [null],
                fieldType: [null, [Validators.required]],
                search: [false, [Validators.required]],
                label: [null, [Validators.required]],
                notNull: [false],
                precision: [null],
                mask: [null],
                charCase: [LuthierFieldCharcaseEnum.NORMAL],
                order: [
                    UtilFunctions.isValidStringOrArray(this.model.fields) ? this.model.fields.reduce((max, field) => field.order > max ? field.order : max, this.model.fields[0].order) + 1 : 1,
                    [Validators.required]
                ],
                size: [null],
                editor: [LuthierFieldEditorEnum.AUTO],
                technicalDescription: [null],
                userDescription: [null],
                layoutSize: [LuthierFieldLayoutEnum.NAO_DEFINIDO],
                uiConfiguration: [null],
                script: [null],
                dataType: [null],
                readOnly: [false],
                visible: [false],
                tableName: [null],
                lookupFilter: [null],
                tableField: this.formBuilder.group({
                    id: [null],
                    code: [null],
                    name: ['', [Validators.required]],
                    size: [null],
                    fieldType: [null]
                })
            },
            {
                validators: LuthierFieldValidator.validate(this.getFields(type)),
            },
        );
        if (type === 'fields') {
            const allFields = this.formBuilder.group ({
                ...c.controls,
                groupInfo: this.formBuilder.group({
                    id: [crypto.randomUUID()],
                    code: [null],
                    description: [null],
                    }),
                reference: this.addReferenceField(),
                customMask: this.addCustomizationField(),
                customReadOnly: this.addCustomizationField(),
                customVisible: this.addCustomizationField(),
                customNotNull: this.addCustomizationField(),
                customCharCase: this.addCustomizationField(),
                customEditor: this.addCustomizationField(),
                customLookupFilter: this.addCustomizationField(),
                customUiConfiguration: this.addCustomizationField()
            });
            return allFields;
        }
        else {
            const allFields = this.formBuilder.group ({
                ...c.controls,
                groupInfo: [null],
                reference: [null]
            });
            return allFields;
        }

    }

    addCustomizationField(): any {
        const c = this.formBuilder.group({
            code: [null],
            type: [null],
            value: [null],
            name1: [null],
            name2: [null],
            name3: [null]
        });
        return c;
    }
    addGroupInfoField(): any {
        const c = this.formBuilder.group({
            id: [crypto.randomUUID()],
            code: [null],
            description: [null, [Validators.required]],
            groupInfoType: [null, [Validators.required]],
            order: [null, [Validators.required]],
            parent: this.formBuilder.group({
                id: [null],
                code: [null],
                description: [null]
            })
        });
        return c;
    }
    addReferenceField(): FormGroup {
        const c = this.formBuilder.group({
            code: [null],
            status: [LuthierReferenceStatusEnum.ACTIVE],
            fieldPK: this.formBuilder.group(
                {
                    id: [null],
                    code: [null],
                    name: [null]
                }
            ),
            fieldFK: this.formBuilder.group(
                {
                    id: [null],
                    code: [null],
                    name: [null]
                }
            )
        });
        return c;
    }
    addSearch(): FormGroup {
        const c = this.formBuilder.group({
                code: [null],
                name: [null, [Validators.required]],
                customName: this.addCustomizationField(),
                status: [LuthierSearchStatusEnum.ACTIVE, [Validators.required]],
                type: [LuthierSearchTypeEnum.SIMPLE_MULTIPLE, [Validators.required]],
                order: [1, [Validators.required]],
                searchFields: this.formBuilder.array([], [Validators.required]),
                subsystems: this.formBuilder.array([], [Validators.required])
            }
        );
        return c;
    }
    addSearchField(): FormGroup {
        const c = this.formBuilder.group({
            code: [null],
            label: [null, [Validators.required]],
            customLabel: this.addCustomizationField(),
            operator: [LuthierSearchFieldOperatorEnum.EQUAL, [Validators.required]],
            order: [null, [Validators.required]],
            editor: [LuthierSearchFieldEditorEnum.DEFAULT, [Validators.required]],
            field: this.addSearchFieldField(),
            dataset: this.formBuilder.group(
                {
                    id: [''],
                    code: [null],
                    name: ['', [Validators.required]],
                }
            ),
        });
        return c;
    }
    addSearchFieldField() {
        const c = this.formBuilder.group(
            {
                id: [null],
                code: [null],
                name: [''],
                tableField: this.formBuilder.group({
                    id: [null],
                    code: [null],
                    name: ['', [Validators.required]],
                    size: [null],
                    fieldType: [null]
                })
            }, { validators: [Validators.required]}
        );
        return c;
    }
    addSearchSubsystem(): FormGroup {
        const c = this.formBuilder.group({
            subsystem: this.formBuilder.group({
                code: [null, [Validators.required]],
                description: [null, [Validators.required]]
            })
        });
        return c;
    }
    editRow(index: number, type: TableType) {
        this.fieldRowEditing[type] = index.toString();
    }

    saveRow(id: string, index: number, type: TableType) {
        const fg = this.getFieldGroup(id, type);
        if (fg.invalid) {
            this.messageService.open("Existem campo inválidos!", "Error de Validação", "warning");
            fg.updateValueAndValidity();
            this._changeDetectorRef.detectChanges();
            return;
        }
        if (type === 'fields') {
            this.fieldsDataSource.data[index] = fg.value;
            this.fieldsDataSource._updateChangeSubscription();
            this.customizationsDataSource._updateChangeSubscription();
        }
        else if (type === 'customizations') {
            this.customizationsDataSource.data[index] = fg.value;
            this.customizationsDataSource._updateChangeSubscription();
        }
        else if (type === 'groupInfos') {
            this.editGroupInfo(id, index, fg.value as LuthierGroupInfoModel);
        }
        else {
            this.customFieldsDataSource.data[index] = fg.value;
            this.customFieldsDataSource._updateChangeSubscription();
        }
        this.fieldRowEditing[type] = null;
        this._changeDetectorRef.detectChanges();
    }

    onRowClick(index: number) {

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
    newSearch() {
        this.editSearch(new LuthierVisionDatasetSearchModel(), -1);
    }
    deleteSearch(index: number) {
        this.searchsDataSource.data.splice(index, 1);
        this.searchsDataSource._updateChangeSubscription();
        this._changeDetectorRef.detectChanges();
    }
    editSearch(model: LuthierVisionDatasetSearchModel, index: number) {
        this._parent.service.getActiveSubsystems().then(subsystems => {
            const fields = this.model.fields.filter(x => UtilFunctions.isValidStringOrArray(x['pending']) === false || x['pending']=== false);
            const modal = this._matDialog.open(LuthierDictionaryDatasetSearchModalComponent, { disableClose: true, panelClass: 'luthier-dictionary-dataset-search-modal-container' });
            modal.componentInstance.title = "Pesquisa do Dataset " + this.model.name;
            modal.componentInstance.parent = this;
            modal.componentInstance.searchModel = model;
            modal.componentInstance.subsystems = subsystems;
            modal.componentInstance.index = index;
            modal.afterClosed().subscribe((result) =>
            {
                if ( result === 'ok' ) {
                    if (index >= 0) {
                        this.searchsDataSource.data[index] = modal.componentInstance.formSave.value;
                    }
                    else {
                        this.searchsDataSource.data.push(modal.componentInstance.formSave.value);
                    }
                    this.searchsDataSource._updateChangeSubscription();
                    this._changeDetectorRef.detectChanges();
                }

            });
        });


    }

    newGroupInfo() {
        const fg = this.addGroupInfoField();
        this.getFields('groupInfos').push(fg);
        const newField = fg.value as LuthierGroupInfoModel;
        newField['pending'] = true;
        this.groupsInfoDataSource.data.push(newField);
        this.groupsInfoDataSource._updateChangeSubscription();
        this._changeDetectorRef.detectChanges();
    }
    deleteGroupInfo(id: string, index: number) {
        const groupInfo =  this.groupsInfoDataSource.data[index];
        const groupInfoWithGroupInfo = this.groupsInfoDataSource.data
            .filter(x => x.parent &&  (x.parent.id === groupInfo.id || x.parent.code === groupInfo.code))
            .map(x => this.groupsInfoDataSource.data.findIndex(y => y.id === x.id));
        console.log('groupInfoWithGroupInfo', groupInfoWithGroupInfo, groupInfo);
        if (UtilFunctions.isValidStringOrArray(groupInfoWithGroupInfo)) {
            groupInfoWithGroupInfo.forEach(x => {
                this.groupsInfoDataSource.data[x].parent = null;
            });
        }
        this.groupsInfoDataSource.data.splice(index, 1);
        this.groupsInfoDataSource._updateChangeSubscription();

        const fieldsWithGroupInfo = this.fieldsDataSource.data
            .filter(x => x.groupInfo &&  (x.groupInfo.id === groupInfo.id || x.groupInfo.code === groupInfo.code))
            .map(x => this.fieldsDataSource.data.findIndex(y => y.id === x.id));
        if (UtilFunctions.isValidStringOrArray(fieldsWithGroupInfo)) {
            fieldsWithGroupInfo.forEach(x => {
                this.fieldsDataSource.data[x].groupInfo = null;
                this.getFieldGroup(this.fieldsDataSource.data[x].id, 'fields').get('groupInfo').patchValue(new LuthierGroupInfoModel());
            });
            this.fieldsDataSource._updateChangeSubscription();
        }
        const customFieldsWithGroupInfo = this.customFieldsDataSource.data
            .filter(x => x.groupInfo === groupInfo.description)
            .map(x => this.customFieldsDataSource.data.findIndex(y => y.id === x.id));
        if (UtilFunctions.isValidStringOrArray(customFieldsWithGroupInfo)) {
            customFieldsWithGroupInfo.forEach(x => {
                this.customFieldsDataSource.data[x].groupInfo = null;
                this.getFieldGroup(this.customFieldsDataSource.data[x].id, 'customFields').get('groupInfo').setValue(null);
            });
            this.customFieldsDataSource._updateChangeSubscription();
        }
        this._changeDetectorRef.detectChanges();
    }
    editGroupInfo(id: string, index: number, value: LuthierGroupInfoModel) {
        const groupInfo =  this.groupsInfoDataSource.data[index];
        const groupInfoWithGroupInfo = this.groupsInfoDataSource.data
            .filter(x => x.parent &&  (x.parent.id === groupInfo.id || x.parent.code === groupInfo.code))
            .map(x => this.groupsInfoDataSource.data.findIndex(y => y.id === x.id));
        if (UtilFunctions.isValidStringOrArray(groupInfoWithGroupInfo)) {
            groupInfoWithGroupInfo.forEach(x => {
                this.groupsInfoDataSource.data[x].parent.description = value.description;
            });
        }

        const fieldsWithGroupInfo = this.fieldsDataSource.data
            .filter(x => x.groupInfo &&  (x.groupInfo.id === groupInfo.id || x.groupInfo.code === groupInfo.code))
            .map(x => this.fieldsDataSource.data.findIndex(y => y.id === x.id));
        if (UtilFunctions.isValidStringOrArray(fieldsWithGroupInfo)) {
            fieldsWithGroupInfo.forEach(x => {
                this.fieldsDataSource.data[x].groupInfo.description = value.description;
            });
            this.fieldsDataSource._updateChangeSubscription();
        }
        const customFieldsWithGroupInfo = this.customFieldsDataSource.data
            .filter(x => x.groupInfo === groupInfo.description)
            .map(x => this.customFieldsDataSource.data.findIndex(y => y.id === x.id));
        if (UtilFunctions.isValidStringOrArray(customFieldsWithGroupInfo)) {
            customFieldsWithGroupInfo.forEach(x => {
                this.customFieldsDataSource.data[x].groupInfo = value.description;
                this.getFieldGroup(this.customFieldsDataSource.data[x].id, 'customFields').get('groupInfo').setValue(value.description);
            });
            this.customFieldsDataSource._updateChangeSubscription();
        }
        this.groupsInfoDataSource.data[index] = value;
        this.groupsInfoDataSource._updateChangeSubscription();
    }
    filterFields(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.fieldsDataSource.filter = filterValue.trim().toLowerCase();
    }
    filterSearchs(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.searchsDataSource.filter = filterValue.trim().toLowerCase();
    }
    filterCustomFields(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.customFieldsDataSource.filter = filterValue.trim().toLowerCase();
    }
    filterCustomizations(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.customizationsDataSource.filter = filterValue.trim().toLowerCase();
    }
    filterGroupsInfo(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.groupsInfoDataSource.filter = filterValue.trim().toLowerCase();
    }

    checkIndeterminate(event: MatCheckboxChange, c: FormControl) {
        if (!event.source.indeterminate) {
            if (UtilFunctions.parseBoolean(c.value) === false) {
                c.setValue(null);
            }
            else {
                c.setValue(true);
            }
        }
        else {
            c.setValue(false);
        }
        this._changeDetectorRef.detectChanges();

    }

    changeTab(event: MatTabChangeEvent) {
        this.currentTab = event.tab.ariaLabel as TableType;
    }

    isGroupInfoAllowed(field: LuthierGroupInfoModel, option: LuthierGroupInfoModel): boolean {
        if (field.id && field.id === option.id) {
            return false;
        }
        if (!option.parent) {
            return true;
        }
        if (UtilFunctions.isValidStringOrArray(option.parent.id) === true) {
            return option.parent.id !== field.id;
        }
        if (UtilFunctions.isValidStringOrArray(option.parent.code) === true) {
            return option.parent.code !== field.code;
        }
        return true;

    }

    isMyDescendant(t: LuthierVisionDatasetModel, parent?: LuthierVisionDatasetModel ): boolean {
        if (!parent) {
            parent = this.model;
        }
        if (UtilFunctions.isValidStringOrArray(parent.children) === true) {
            let yes = parent.children.findIndex(x => x.code === t.code) >= 0;
            if (yes === false) {
                for (let child of parent.children) {
                    yes = this.isMyDescendant(t, child);
                    if (yes) {
                        return true;
                    }
                }
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    }

    setParentRelation() {
        this.parentRelation = null;
        if (this.model.parent) {
            let index = this.model.relatives.findIndex(x => x.code === this.model.parent.code);
            if (index >= 0) {
                index = this.model.table?.references?.findIndex(x => x.tablePK.code === this.model.relatives[index].table.code);
                if (index >= 0) {
                    this.parentRelation = this.model.table.references[index];
                }
            }
        }
    }

    parentChanged(event: MatSelectChange) {
        this.model.parent = event.value;
        this.setParentRelation();
        this._changeDetectorRef;
    }

    hasParentProblem(): boolean {
        return this.model.table && this.model.parent && this.model.parent.code >= 0 && !this.parentRelation;
    }

    importSearchTable() {
        this.service.getTable(this.model.table.code)
            .then(table => {
                if (UtilFunctions.isValidStringOrArray(table.searchs) === true) {
                    const newSearch = cloneDeep(table.searchs);
                    UtilFunctions.nullCodeAndSetID(newSearch);
                    newSearch.forEach((x, searchIndex) => {
                        const index = this.model.searchs.findIndex(y => y.name === x.name);
                        if (index >= 0) {
                            x.name = x.name + crypto.randomUUID();
                        }
                        for (let i = 0; i < x.searchFields.length;) {
                            const searchField = x.searchFields[i];
                            const fieldIndex = this.model.fields.findIndex(k => k.tableField.name === searchField.tableField.name);
                            if (fieldIndex < 0) {
                                x.searchFields.splice(i, 1);
                                continue;
                            }
                            searchField['dataset'] = this.model;
                            searchField['field'] = this.model.fields[fieldIndex];
                            i++;
                        }
                        // Tem que voltar pois apagou o campo code
                        x.subsystems = table.searchs[searchIndex].subsystems;
                        this.searchsDataSource.data.push(x as LuthierVisionDatasetSearchModel);
                    });
                    this.searchsDataSource._updateChangeSubscription();
                    this._changeDetectorRef.detectChanges();
                }
            })

    }

    changeTable(event: MatSelectChange) {
        this.fieldsDataSource.data.splice(0, this.fieldsDataSource.data.length);
        this.getFields('fields').clear();
        this.fieldsDataSource._updateChangeSubscription();

        this.searchsDataSource.data.splice(0, this.searchsDataSource.data.length);
        this.searchsDataSource._updateChangeSubscription();

        this.customizationsDataSource.data.splice(0, this.customizationsDataSource.data.length);
        this.customizationsDataSource._updateChangeSubscription();

        this.customFieldsDataSource.data.splice(0, this.customFieldsDataSource.data.length);
        this.getFields('customFields').clear();
        this.customFieldsDataSource._updateChangeSubscription();

        this._changeDetectorRef.detectChanges();
        const table = event.value as LuthierTableModel;
        const index = this.tables.findIndex(x => x.code === table.code);
        if (UtilFunctions.isValidStringOrArray(this.tables[index].id) === false) {
            this.service.getTable(table.code)
                .then(result => {
                    result.id = crypto.randomUUID();
                    this.tables[index] = result;
                    this.model.table = result;
                    this.formSave.get('table').patchValue(result);
                    this.setParentRelation();
                    this._changeDetectorRef.detectChanges();
                })
        }
        else {
            this.model.table = table;
            this.formSave.get('table').patchValue(table);
            this.setParentRelation();
            this._changeDetectorRef.detectChanges();
        }
    }

    changeName(name: string) {
        this.model.name = name;
    }
}
