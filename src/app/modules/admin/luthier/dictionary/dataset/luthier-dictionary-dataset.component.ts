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
    LuthierBasicModel,
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
    LuthierSubsystemModel,
    LuthierTableModel,
    LuthierTableReferenceModel,
    LuthierVisionDatasetCustomFieldModel,
    LuthierVisionDatasetFieldModel,
    LuthierVisionDatasetFieldTypeEnum,
    LuthierVisionDatasetModel,
    LuthierVisionDatasetSearchModel,
    LuthierVisionGroupInfoModel,
    LuthierVisionModel
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
import {LuthierValidator} from '../../../../../shared/validators/luthier.validator';
import {MatDialog} from '@angular/material/dialog';
import {LuthierService} from '../../luthier.service';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {
    LuthierDictionaryDatasetFieldModalComponent
} from './modal/field/luthier-dictionary-dataset-field-modal.component';
import {
    LuthierDictionaryDatasetSearchModalComponent
} from './modal/search/luthier-dictionary-dataset-search-modal.component';
import {FilterPredicateUtil} from '../../../../../shared/util/util-classes';
import {MatMenuModule} from '@angular/material/menu';
import {Subject, takeUntil} from 'rxjs';

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
        NgTemplateOutlet,
        MatMenuModule
    ],
    providers: [
        provideNgxMask(),
    ],
})
export class LuthierDictionaryDatasetComponent implements OnInit, OnDestroy, AfterViewInit
{
    private _model: LuthierVisionDatasetModel;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public fieldsDataSource = new MatTableDataSource<LuthierVisionDatasetFieldModel>();
    @ViewChildren('sortFields') sortFields: QueryList<MatSort>;
    public searchsDataSource = new MatTableDataSource<LuthierVisionDatasetSearchModel>();
    @ViewChild('sortSearchs') sortSearchs: MatSort;
    public customFieldsDataSource = new MatTableDataSource<LuthierVisionDatasetCustomFieldModel>();
    public customizationsDataSource = new MatTableDataSource<LuthierVisionDatasetFieldModel>();
    public groupsInfoDataSource = new MatTableDataSource<LuthierVisionGroupInfoModel>();
    currentTab: TableType = 'fields';
    private _cloneModel: LuthierVisionDatasetModel;
    tables: LuthierTableModel[];
    @Input()
    set model(value: LuthierVisionDatasetModel) {
        this._model = value;
        this._cloneModel = cloneDeep(this._model);
        this.tables = cloneDeep(this.parent.tables);
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
    displayedGroupInfoColumns = ['buttons', 'code', 'order', 'description', 'groupInfoType',
        'parent.description'];
    displayedCustomFieldColumns = ['buttons', 'order', 'code', 'fieldType', 'tableField.key', 'tableField.name', 'label', 'mask', 'groupInfo',
        'tableField.fieldType', 'tableField.size',  'readOnly', 'visible', 'notNull', 'search', 'tableField.defaultValue', 'tableField.precision',
        'tableField.maxValue', 'tableField.minValue', 'charCase', 'editor', 'lookupFilter', 'reference', 'technicalDescription', 'userDescription',
        'uiConfiguration', 'layoutSize'];
    displayedCustomizationsColumns = ['buttons', 'code', 'tableField.name', 'customMask', 'customReadOnly',
        'customVisible', 'customNotNull', 'customCharCase', 'customEditor', 'customLookupFilter', 'customUiConfiguration'];
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
            const rows = this.getRowEditing(this.currentTab);
            if (UtilFunctions.isValidStringOrArray(rows)) {
                rows.rows.forEach(row =>  {
                    event.preventDefault();
                    const fg = this.getFieldGroup(row, this.currentTab);
                    fg.patchValue(row);
                    row.editing = false;
                    row.pending = false;
                });
                rows.datasource._updateChangeSubscription();
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
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit() {
        UtilFunctions.setSortingDataAccessor(this.fieldsDataSource);
        const filterPredicateFields = FilterPredicateUtil.withColumns(this.displayedFieldColumns);
        this.fieldsDataSource.filterPredicate = filterPredicateFields.instance.bind(filterPredicateFields);
        this.fieldsDataSource.sort = this.sortFields.get(0);

        UtilFunctions.setSortingDataAccessor(this.searchsDataSource);
        const filterPredicateSearchs = FilterPredicateUtil.withColumns(this.displayedSearchColumns);
        this.searchsDataSource.filterPredicate = filterPredicateSearchs.instance.bind(filterPredicateSearchs);
        this.searchsDataSource.sort = this.sortSearchs;

        UtilFunctions.setSortingDataAccessor(this.groupsInfoDataSource);
        const filterPredicateGroupsInfo = FilterPredicateUtil.withColumns(this.displayedGroupInfoColumns);
        this.groupsInfoDataSource.filterPredicate = filterPredicateGroupsInfo.instance.bind(filterPredicateGroupsInfo);
        this.groupsInfoDataSource.sort = this.sortFields.get(1);

        UtilFunctions.setSortingDataAccessor(this.customFieldsDataSource);
        const filterPredicateCustomFields = FilterPredicateUtil.withColumns(this.displayedCustomFieldColumns);
        this.customFieldsDataSource.filterPredicate = filterPredicateCustomFields.instance.bind(filterPredicateCustomFields);
        this.customFieldsDataSource.sort = this.sortFields.get(2);

        UtilFunctions.setSortingDataAccessor(this.customizationsDataSource);
        const filterPredicateCustomizations = FilterPredicateUtil.withColumns(this.displayedCustomizationsColumns);
        this.customizationsDataSource.filterPredicate = filterPredicateCustomizations.instance.bind(filterPredicateCustomizations);
        this.customizationsDataSource.sort = this.sortFields.get(3);
        if (UtilFunctions.isValidStringOrArray(this.model.code)) {
            UtilFunctions.forceValidations(this.formSave);
        }

        LuthierValidator.validateDataset(this.model)

        this.fieldsDataSource.connect()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(data => {
                if (LuthierValidator.validateDataset(this.model)) {
                    this.fieldsDataSource._updateChangeSubscription();
                }

            });
        this.customFieldsDataSource.connect()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(data => {
                if (LuthierValidator.validateDataset(this.model)) {
                    this.customFieldsDataSource._updateChangeSubscription();
                }

            });
        this.searchsDataSource.connect()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(data => {
                if (LuthierValidator.validateDataset(this.model)) {
                    this.searchsDataSource._updateChangeSubscription();
                }

            });
        this.groupsInfoDataSource.connect()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(data => {
                if (LuthierValidator.validateDataset(this.model)) {
                    this.groupsInfoDataSource._updateChangeSubscription();
                }

            });
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
                code: [null],
                name: [null],
                description: ['']
            }),
            table: this.formBuilder.group({
                code: [null],
                name: ['', [Validators.required]],
                description: ['']
            }, {validators: Validators.required}),
            vision: this.formBuilder.group({
                code: [null],
                name: ['', [Validators.required]],
                description: ['']
            }),
            objectType: [null],
            groupInfos: this.formBuilder.array([]),
        });
        this.addFields('fields');
        this.addFields('customFields');
        this.addGroupInfos();
        this.setCustomizations();
        this.formSave.patchValue(this.model);
        //Essa ordem é importante para ordenação do @ViewChildren('sortFields') sortFields: QueryList<MatSort>;
        this.fieldsDataSource.data = this.model.fields;
        this.groupsInfoDataSource.data = this.model.groupInfos;
        this.customFieldsDataSource.data = this.model.customFields;
        this.customizationsDataSource.data = this.model.fields;
        this.searchsDataSource.data = this.model.searchs;

        this.setParentRelation();
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
                        x.groupInfo = null;
                        if (type === 'customFields') {
                            dsField = cloneDeep(x) as LuthierVisionDatasetCustomFieldModel;
                        }
                        else {
                            dsField = cloneDeep(x) as LuthierVisionDatasetFieldModel;
                        }
                        dsField.groupInfo = null;
                        dsField.code = null;
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

    delete(model: LuthierBasicModel, type: TableType) {
        const index = this.getRealIndex(model, type).index;
        const fieldIndex = this.getFields(type).controls.findIndex(x => this.compareCode(x.value, model));
        this.getFields(type).removeAt(fieldIndex);
        if (type === 'groupInfos') {
            this.deleteGroupInfo(model);
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
                            if (search.searchFields[index].field && this.compareCode(search.searchFields[index].field, model)) {
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
        const basicInfo = this.formSave.value as LuthierVisionDatasetModel;
        this._cloneModel.code = basicInfo.code;
        this._cloneModel.name = basicInfo.name;
        this._cloneModel.description = basicInfo.description;
        this._cloneModel.customDescription = basicInfo.customDescription;
        this._cloneModel.filter = basicInfo.filter;
        this._cloneModel.uiConfiguration = basicInfo.uiConfiguration;

        this.saveCustomizations();
        this.service.saveDataset(this._cloneModel)
            .then(result => {
                result.id = this._cloneModel.id;
                result.relatives = this._cloneModel.relatives;
                this.model = result;
                this.refresh();
                const index = this.parent.tabsOpened.findIndex(x => x.id === this.model.id);
                this._parent.tabsOpened[index].name = this.model.name;
                //this.parent.selectedTab = this.model;
                this.parent.updateDatasetNode(this.model);
                this._changeDetectorRef.detectChanges();
                this.messageService.open(`Dataset salvo com sucesso`, 'SUCESSO', 'success');
            })
    }

    canSave(): boolean {
        if (this.formSave) {
            if (this.formSave.invalid || UtilFunctions.isValidObject(this.model.invalidFields)) {
                return false;
            }
        }
        return true;
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
                model.customLabel.name3 = model.tableField.name;
                customizations.push(model.customLabel);
            }
            if (model.customMask
                && UtilFunctions.isValidStringOrArray(model.customMask.value) === true
                && model.customMask.value !== model.mask
            ) {
                model.customMask.type = 'VISION_FIELD_MASK';
                model.customMask.name1 = this.model.vision.name;
                model.customMask.name2 = this.model.name;
                model.customMask.name3 = model.tableField.name;
                customizations.push(model.customMask);
            }
            if (model.customReadOnly
                && UtilFunctions.isValidStringOrArray(model.customReadOnly.value) === true
                && model.customReadOnly.value !== model.readOnly
            ) {
                model.customReadOnly.type = 'VISION_FIELD_READONLY';
                model.customReadOnly.name1 = this.model.vision.name;
                model.customReadOnly.name2 = this.model.name;
                model.customReadOnly.name3 = model.tableField.name;
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
                model.customVisible.name3 = model.tableField.name;
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
                model.customNotNull.name3 = model.tableField.name;
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
                model.customCharCase.name3 = model.tableField.name;
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
                model.customEditor.name3 = model.tableField.name;
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
                model.customLookupFilter.name3 = model.tableField.name;
                customizations.push(model.customLookupFilter);
            }
            if (model.customUiConfiguration
                && UtilFunctions.isValidStringOrArray(model.customUiConfiguration.value) === true
                && model.customUiConfiguration.value !== model.uiConfiguration
            ) {
                model.customUiConfiguration.type = 'VISION_FIELD_UICONFIGURATION';
                model.customUiConfiguration.name1 = this.model.vision.name;
                model.customUiConfiguration.name2 = this.model.name;
                model.customUiConfiguration.name3 = model.tableField.name;
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
                    && UtilFunctions.isValidStringOrArray(searchFieldModel.customLabel.value) === true
                    && searchFieldModel.customLabel.value !== searchFieldModel.label
                ) {
                    const fieldIndex = this.model.fields.findIndex(x => this.compareCode(x, searchFieldModel.field));
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
        this.model.customizations = customizations;
    }


    revert() {
        //console.log(UtilFunctions.getInvalidFields(this.formSave));
        this.model = this._model;
        this.refresh();
        this._changeDetectorRef.detectChanges();
    }

    getFields(type: TableType): FormArray {
        return this.formSave.get(type === 'customizations' ? 'fields' : type) as FormArray;
    }
    getFieldGroup(model: LuthierBasicModel, type: TableType): FormGroup {
        const index =(this.formSave.get(type === 'customizations' ? 'fields' : type) as FormArray).controls.findIndex(x => this.compareCode(x.value, model));
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
                if (UtilFunctions.isValidStringOrArray(x.id) === false) {
                    x.id = crypto.randomUUID();
                }
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
            }
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
                customLabel: this.addCustomizationField(),
                customMask: this.addCustomizationField(),
                customReadOnly: this.addCustomizationField(),
                customVisible: this.addCustomizationField(),
                customNotNull: this.addCustomizationField(),
                customCharCase: this.addCustomizationField(),
                customEditor: this.addCustomizationField(),
                customLookupFilter: this.addCustomizationField(),
                customUiConfiguration: this.addCustomizationField()
            });
            allFields.setValidators(LuthierValidator.validate(this.getFields(type)));
            return allFields;
        }
        else {
            const allFields = this.formBuilder.group ({
                ...c.controls,
                groupInfo: [null],
                reference: [null]
            });
            allFields.setValidators(LuthierValidator.validate(this.getFields(type)));
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
                    fieldType: [null],
                    label: [null]
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
    getRealIndex(model: LuthierBasicModel, type: TableType): {index: number, dataSource: MatTableDataSource<any>} {
        const dataSource = this.getDatasourceFromType(type);
        if (!model || (UtilFunctions.isValidStringOrArray(model.code) === false && UtilFunctions.isValidStringOrArray(model.id) === false)) {
            return {index: -1, dataSource: dataSource};
        }
        return {index: dataSource.data.indexOf(model), dataSource: dataSource};
    }

    getDatasourceFromType(type: TableType): MatTableDataSource<any> {

        if (type === 'fields') {
            return this.fieldsDataSource;
        }
        else if (type === 'customFields') {
            return this.customFieldsDataSource;
        }
        else if (type === 'customizations') {
            return this.customizationsDataSource;
        }
        else if (type === 'groupInfos') {
            return this.groupsInfoDataSource;
        }
        else if (type === 'searchs') {
            return this.searchsDataSource;
        }
    }

    getRowEditing(type: TableType): {datasource:MatTableDataSource<any>, rows: LuthierBasicModel[]} {
        const dataSource = this.getDatasourceFromType(type);
        return {datasource: dataSource, rows: dataSource.data.filter(x => x['editing'] === true)};
    }

    editRow(model: LuthierBasicModel, type: TableType) {
        const editing = this.getRealIndex(model, type);
        editing.dataSource.data[editing.index]['editing'] = true;
    }

    saveRow(model: LuthierBasicModel, type: TableType) {
        const fg = this.getFieldGroup(model, type);
        UtilFunctions.forceValidations(fg);
        const saved = fg.value as LuthierBasicModel;
        saved.pending = false;
        const editing = this.getRealIndex(model, type);
        const index = editing.index;
        if (fg.invalid) {
            this.messageService.open("Existem campo inválidos!", "Error de Validação", "warning");
            fg.updateValueAndValidity();
            this._changeDetectorRef.detectChanges();
            //return;
        }
        if (type === 'fields') {
            this.fieldsDataSource.data[index] = Object.assign({}, this.fieldsDataSource.data[index], saved);
            this.fieldsDataSource._updateChangeSubscription();
            this.customizationsDataSource._updateChangeSubscription();
        }
        else if (type === 'customizations') {
            this.customizationsDataSource.data[index] = Object.assign({}, this.customizationsDataSource.data[index], saved);
            this.customizationsDataSource._updateChangeSubscription();
        }
        else if (type === 'groupInfos') {
            this.editGroupInfo(saved as LuthierGroupInfoModel);
        }
        else {
            this.customFieldsDataSource.data[index] = Object.assign({}, this.customFieldsDataSource.data[index], saved);
            this.customFieldsDataSource._updateChangeSubscription();
        }
        editing.dataSource.data[editing.index]['editing'] = false;
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
        this.editSearch(new LuthierVisionDatasetSearchModel());
    }
    deleteSearch(model: LuthierBasicModel) {
        const index = this.getRealIndex(model, 'searchs').index;
        this.searchsDataSource.data.splice(index, 1);
        this.searchsDataSource._updateChangeSubscription();
        this._changeDetectorRef.detectChanges();
    }
    editSearch(model: LuthierVisionDatasetSearchModel) {
        const index = this.getRealIndex(model, 'searchs').index;
        this._parent.service.getActiveSubsystems().then(subsystems => {
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
        newField['editing'] = true;
        this.groupsInfoDataSource.data.push(newField);
        this.groupsInfoDataSource._updateChangeSubscription();
        this._changeDetectorRef.detectChanges();
    }
    deleteGroupInfo(model: LuthierBasicModel) {
        const index = this.getRealIndex(model, 'groupInfos').index;
        const groupInfo =  this.groupsInfoDataSource.data[index];
        const groupInfoWithGroupInfo = this.groupsInfoDataSource.data
            .filter(x => x.parent &&  (this.compareCode(x.parent, groupInfo)))
            .map(x => this.groupsInfoDataSource.data.findIndex(y => this.compareCode(x, y)));
        console.log('groupInfoWithGroupInfo', groupInfoWithGroupInfo, groupInfo);
        if (UtilFunctions.isValidStringOrArray(groupInfoWithGroupInfo)) {
            groupInfoWithGroupInfo.forEach(x => {
                this.groupsInfoDataSource.data[x].parent = null;
                const fg = this.getFieldGroup(this.groupsInfoDataSource.data[x], 'groupInfos');
                fg.get('parent').setValue(null);
            });
        }
        this.groupsInfoDataSource.data.splice(index, 1);
        this.groupsInfoDataSource._updateChangeSubscription();

        const fieldsWithGroupInfo = this.fieldsDataSource.data
            .filter(x => x.groupInfo &&  this.compareCode(x.groupInfo, groupInfo))
            .map(x => this.fieldsDataSource.data.findIndex(y => this.compareCode(x, y)));
        if (UtilFunctions.isValidStringOrArray(fieldsWithGroupInfo)) {
            fieldsWithGroupInfo.forEach(x => {
                this.fieldsDataSource.data[x].groupInfo = null;
                this.getFieldGroup(this.fieldsDataSource.data[x], 'fields').get('groupInfo').patchValue(new LuthierGroupInfoModel());
            });
            this.fieldsDataSource._updateChangeSubscription();
        }
        const customFieldsWithGroupInfo = this.customFieldsDataSource.data
            .filter(x => x.groupInfo === groupInfo.description)
            .map(x => this.customFieldsDataSource.data.findIndex(y => this.compareCode(x, y)));
        if (UtilFunctions.isValidStringOrArray(customFieldsWithGroupInfo)) {
            customFieldsWithGroupInfo.forEach(x => {
                this.customFieldsDataSource.data[x].groupInfo = null;
                this.getFieldGroup(this.customFieldsDataSource.data[x] as LuthierBasicModel, 'customFields').get('groupInfo').setValue(null);
            });
            this.customFieldsDataSource._updateChangeSubscription();
        }
        this._changeDetectorRef.detectChanges();
    }
    editGroupInfo(value: LuthierGroupInfoModel) {
        const index = this.getRealIndex(value, 'groupInfos').index;
        const groupInfo =  this.groupsInfoDataSource.data[index];
        const groupInfoWithGroupInfo = this.groupsInfoDataSource.data
            .filter(x => x.parent &&  this.compareCode(x.parent, groupInfo))
            .map(x => this.groupsInfoDataSource.data.findIndex(y => this.compareCode(x, y)));
        if (UtilFunctions.isValidStringOrArray(groupInfoWithGroupInfo)) {
            groupInfoWithGroupInfo.forEach(x => {
                this.groupsInfoDataSource.data[x].parent.description = value.description;
            });
        }

        const fieldsWithGroupInfo = this.fieldsDataSource.data
            .filter(x => x.groupInfo &&  this.compareCode(x.groupInfo, groupInfo))
            .map(x => this.fieldsDataSource.data.findIndex(y => this.compareCode(x, y)));
        if (UtilFunctions.isValidStringOrArray(fieldsWithGroupInfo)) {
            fieldsWithGroupInfo.forEach(x => {
                this.fieldsDataSource.data[x].groupInfo.description = value.description;
            });
            this.fieldsDataSource._updateChangeSubscription();
        }
        const customFieldsWithGroupInfo = this.customFieldsDataSource.data
            .filter(x => x.groupInfo === groupInfo.description)
            .map(x => this.customFieldsDataSource.data.findIndex(y => this.compareCode(x, y)));
        if (UtilFunctions.isValidStringOrArray(customFieldsWithGroupInfo)) {
            customFieldsWithGroupInfo.forEach(x => {
                this.customFieldsDataSource.data[x].groupInfo = value.description;
                this.getFieldGroup(this.customFieldsDataSource.data[x] as LuthierBasicModel, 'customFields').get('groupInfo').setValue(value.description);
            });
            this.customFieldsDataSource._updateChangeSubscription();
        }
        this.groupsInfoDataSource.data[index] = Object.assign({}, this.groupsInfoDataSource.data[index], value);
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
        if (this.compareCode(field, option) === true) {
            return false;
        }
        if (!option.parent) {
            return true;
        }
        return !this.compareCode(field, option.parent);

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

    getDatasetByName(name: string, parent: LuthierVisionDatasetModel | LuthierVisionModel ): LuthierVisionDatasetModel {
        if (UtilFunctions.isValidStringOrArray(parent.children) === true) {
            let index = parent.children.findIndex(x => x.name === name);
            if (index < 0) {
                for (let child of parent.children) {
                    const dataset = this.getDatasetByName(name, child);
                    if (dataset != null) {
                        return dataset;
                    }
                }
            }
            else {
                return parent.children[index];
            }
        }
        else {
            return null;
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
        return this.model.table && this.model.parent && UtilFunctions.isValidStringOrArray(this.model.parent.code) &&
            parseInt(this.model.parent.code.toString()) >= 0 && !this.parentRelation;
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
                            searchField['dataset'] = cloneDeep(this.model);
                            searchField['field'] = cloneDeep(this.model.fields[fieldIndex]);
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

    async readDatasetFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            const model = JSON.parse(text) as LuthierVisionDatasetModel;
            setTimeout(() => {
                this.importTable(model);
            })
        } catch (error) {
            this.messageService.open('Erro ao ler conteúdo do clipboard '+ error, 'ERRO', 'error');
            console.error('Failed to read clipboard contents: ', error);
        }
    }

    readDatasetFromFile(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            // You can further process the selected file here
            const reader = new FileReader();
            reader.onload = () => {
                const text = reader.result as string;
                const model = JSON.parse(text) as LuthierVisionDatasetModel;
                setTimeout(() => {
                    this.importTable(model);
                });

            };
            reader.onerror = (error) => {
                this.messageService.open('Erro ao ler arquivo '+ error, 'ERRO', 'error');
            };
            reader.readAsText(file);
        }
    }

    importTable(model: LuthierVisionDatasetModel) {
        if (model) {
            try {
                if (UtilFunctions.isValidStringOrArray(model.code) === false) {
                    throw new Error('Erro ao ler dataset');
                }
                if (model.objectType != this.model.objectType) {
                    throw new Error('Erro ao ler dataset');
                }
                model.vision = this.model.vision;
                model.children = [];

                const indexTable = this.parent.tables.findIndex(x => x.name === model.table.name);
                if (indexTable < 0) {
                    throw new Error(`Erro ao ler dataset. A tabela ${model.table.name} precisa ser adicionada antes da importação do dataset`);
                }
                if (model.parent && UtilFunctions.isValidStringOrArray(model.parent.code) === true) {
                    const indexParent = this.model.relatives.findIndex(x => x.name === model.parent.name);
                    if (indexParent >= 0) {
                        model.parent = this.model.relatives[indexParent];
                    }
                    else {
                        model.parent = this.model.parent;
                    }

                }
                Promise.all(
                    [
                        this._parent.service.getActiveSubsystems(),
                        this.service.getTable(this.parent.tables[indexTable].code)]
                )
                .then(async value => {
                    try {
                        const subsystems = value[0] as LuthierSubsystemModel[];
                        const table = value[1] as LuthierTableModel;
                        if (UtilFunctions.isValidStringOrArray(this.model.code) === false) {
                            this.model.name = model.name;
                        }
                        const importedCode = model.code;
                        model.table = table;
                        model.name = this.model.name;
                        model.code = this.model.code;
                        model.id = this.model.id;
                        model.relatives = this.model.relatives;

                        //groupInfos
                        if (UtilFunctions.isValidStringOrArray(model.groupInfos) === false) {
                            model.groupInfos = [];
                        }
                        if (UtilFunctions.isValidStringOrArray(this.model.groupInfos) === false) {
                            this.model.groupInfos = [];
                        }

                        for (let i = 0; i < this.model.groupInfos.length; i++) {
                            let groupInfo = this.model.groupInfos[i];
                            let index = model.groupInfos.findIndex(x => x.description.toUpperCase() === groupInfo.description.toUpperCase());
                            if (index >= 0) {
                                model.groupInfos[index].code = groupInfo.code;
                                model.groupInfos[index].id = groupInfo.id;

                                const [item] = model.groupInfos.splice(index, 1);
                                model.groupInfos.splice(i, 0, item);
                            } else {
                                model.groupInfos.splice(i, 0, groupInfo);
                            }
                        }
                        for (let i = this.model.groupInfos.length; i < model.groupInfos.length; i++) {
                            let groupInfo = model.groupInfos[i];
                            groupInfo.code = null;
                            groupInfo.id = crypto.randomUUID();
                        }
                        for (let i = 0; i < model.groupInfos.length; i++) {
                            let groupInfo = model.groupInfos[i];
                            if (groupInfo.parent) {
                                const index = model.groupInfos.findIndex(x => x.description === groupInfo.parent.description);
                                groupInfo.parent = model.groupInfos[index];
                            }
                        }
                        //end groupInfos
                        const tablesSearched = new Array<LuthierTableModel>;
                        tablesSearched.push(table);
                        // field
                        if (UtilFunctions.isValidStringOrArray(model.fields) === false) {
                            model.fields = [];
                        }
                        if (UtilFunctions.isValidStringOrArray(this.model.fields) === false) {
                            this.model.fields = [];
                        }
                        for (let i = 0; i < this.model.fields.length; i++) {
                            let datasetField = this.model.fields[i];
                            let field = datasetField.tableField;
                            let index = model.fields.findIndex(x =>
                                x.tableField.name.toUpperCase() === field.name.toUpperCase() &&
                                x.fieldType === datasetField.fieldType &&
                                x.tableField.table.name === field.table.name &&
                                x.reference?.name === datasetField.reference?.name
                            );
                            if (index >= 0) {
                                model.fields[index].code = field.code;
                                model.fields[index].id = field.id;
                                const [item] = model.fields.splice(index, 1);
                                model.fields.splice(i, 0, item);
                            } else {
                                model.fields.splice(i, 0, datasetField);
                            }
                        }
                        for (let i = this.model.fields.length; i < model.fields.length;) {
                            let datasetField = model.fields[i];
                            let field = datasetField.tableField;
                            if (datasetField.fieldType === LuthierVisionDatasetFieldTypeEnum.NORMAL) {
                                const indexTableField = table.fields.findIndex(x => x.name === field.name);
                                if (indexTableField < 0) {
                                    model.fields.splice(i, 1);
                                    continue;
                                }
                                datasetField.tableField = table.fields[indexTableField];
                            } else if (datasetField.fieldType === LuthierVisionDatasetFieldTypeEnum.LOOKUP) {

                                const referenceIndex = table.references?.findIndex(x => x.name.toUpperCase() === datasetField.reference.name.toUpperCase()
                                    && x.tablePK.name.toUpperCase() === datasetField.reference.tablePK.name.toUpperCase());
                                if (referenceIndex < 0) {
                                    model.fields.splice(i, 1);
                                    continue;
                                }
                                const lookupIndex = tablesSearched.findIndex(x => x.code === table.references[referenceIndex].tablePK.code);
                                let pkTable = null;
                                if (lookupIndex >= 0) {
                                    pkTable = tablesSearched[lookupIndex];
                                }
                                else {
                                    pkTable = await this.service.getTable(table.references[referenceIndex].tablePK.code);
                                    tablesSearched.push(pkTable);
                                }
                                const indexPKField = pkTable.fields.findIndex(x => x.name.toUpperCase() === field.name.toUpperCase());
                                if (indexPKField < 0) {
                                    model.fields.splice(i, 1);
                                    continue;
                                }
                                datasetField.tableField = pkTable.fields[indexPKField];
                                datasetField.reference = table.references[referenceIndex];
                            }
                            datasetField.code = null;
                            datasetField.id = crypto.randomUUID();
                            i++;
                        }
                        for (let i = 0; i < model.fields.length; i++) {
                            let field = model.fields[i];
                            if (field.groupInfo && UtilFunctions.isValidStringOrArray(field.groupInfo.description) === true) {
                                const index = model.groupInfos.findIndex(x => x.description === field.groupInfo.description);
                                field.groupInfo = model.groupInfos[index];
                            } else {
                                field.groupInfo = null;
                            }
                        }
                        // end fields

                        // customFields
                        if (UtilFunctions.isValidStringOrArray(model.customFields) === false) {
                            model.customFields = [];
                        }
                        if (UtilFunctions.isValidStringOrArray(this.model.customFields) === false) {
                            this.model.customFields = [];
                        }
                        for (let i = 0; i < this.model.customFields.length; i++) {
                            let datasetField = this.model.customFields[i];
                            let field = datasetField.tableField;
                            let index = model.customFields.findIndex(x =>
                                x.tableField.name.toUpperCase() === field.name.toUpperCase() &&
                                x.fieldType === datasetField.fieldType &&
                                x.reference === datasetField.reference
                            );
                            if (index >= 0) {
                                model.customFields[index].code = field.code;
                                model.customFields[index].id = field.id;
                                const [item] = model.customFields.splice(index, 1);
                                model.customFields.splice(i, 0, item);
                            } else {
                                model.customFields.splice(i, 0, datasetField);
                            }
                        }

                        for (let i = this.model.customFields.length; i < model.customFields.length;) {
                            let datasetField = model.customFields[i];
                            let field = datasetField.tableField;
                            if (datasetField.fieldType === LuthierVisionDatasetFieldTypeEnum.NORMAL) {
                                let indexTableField = table.fields.findIndex(x => x.name.toUpperCase() === field.name.toUpperCase());
                                if (indexTableField < 0) {
                                    indexTableField = table.customFields.findIndex(x => x.name.toUpperCase() === field.name.toUpperCase());
                                    if (indexTableField < 0) {
                                        model.fields.splice(i, 1);
                                        continue;
                                    }
                                    else {
                                        datasetField.tableField = table.customFields[indexTableField];
                                    }
                                }
                                else {
                                    datasetField.tableField = table.fields[indexTableField];
                                }
                            } else if (datasetField.fieldType === LuthierVisionDatasetFieldTypeEnum.LOOKUP) {

                                const referenceIndex = table.references?.findIndex(x => x.name.toUpperCase() === datasetField.reference.toUpperCase());
                                if (referenceIndex < 0) {
                                    model.fields.splice(i, 1);
                                    continue;
                                }
                                const lookupIndex = tablesSearched.findIndex(x => x.code === table.references[referenceIndex].tablePK.code);
                                let pkTable = null;
                                if (lookupIndex >= 0) {
                                    pkTable = tablesSearched[lookupIndex];
                                }
                                else {
                                    pkTable = await this.service.getTable(table.references[referenceIndex].tablePK.code);
                                    tablesSearched.push(pkTable);
                                }
                                const indexPKField = pkTable.fields.findIndex(x => x.name.toUpperCase() === field.name.toUpperCase());
                                if (indexPKField < 0) {
                                    model.fields.splice(i, 1);
                                    continue;
                                }
                                datasetField.tableField = pkTable.fields[indexPKField];
                                datasetField.reference = table.references[referenceIndex].name;
                            }
                            datasetField.code = null;
                            datasetField.id = crypto.randomUUID();
                            i++;
                        }
                        for (let i = 0; i < model.customFields.length; i++) {
                            let field = model.customFields[i];
                            if (field.groupInfo && UtilFunctions.isValidStringOrArray(field.groupInfo) === true) {
                                const index = model.groupInfos.findIndex(x => x.description === field.groupInfo);
                                field.groupInfo = model.groupInfos[index].description;
                            } else {
                                field.groupInfo = null;
                            }
                        }
                        // end customFields

                        //searchs
                        if (UtilFunctions.isValidStringOrArray(model.searchs) === false) {
                            model.searchs = [];
                        }
                        if (UtilFunctions.isValidStringOrArray(this.model.searchs) === false) {
                            this.model.searchs = [];
                        }

                        for (let i = 0; i < this.model.searchs.length; i++) {
                            let search = this.model.searchs[i];
                            let index = model.searchs.findIndex(x => x.name.toUpperCase() === search.name.toUpperCase());
                            if (index >= 0) {
                                model.searchs[index].code = search.code;
                                model.searchs[index].id = search.id;
                                if (UtilFunctions.isValidStringOrArray(search.searchFields) === false) {
                                    search.searchFields = [];
                                }
                                if (UtilFunctions.isValidStringOrArray(model.searchs[index].searchFields) === false) {
                                    model.searchs[index].searchFields = [];
                                }
                                for (let j = 0; j < search.searchFields.length; j++) {
                                    let searchField = search.searchFields[j];
                                    const searchFieldIndex = model.searchs[index].searchFields.findIndex(x =>
                                        x.label.toUpperCase() === searchField.label.toUpperCase() &&
                                        x.dataset.name === searchField.dataset.name &&
                                        x.field.name === searchField.field.name
                                    );
                                    if (searchFieldIndex >= 0) {
                                        model.searchs[index].searchFields[searchFieldIndex].code = searchField.code;
                                        model.searchs[index].searchFields[searchFieldIndex].id = searchField.id;
                                        const [itemSearch] = model.searchs[index].searchFields.splice(searchFieldIndex, 1);
                                        model.searchs[index].searchFields.splice(j, 0, itemSearch);
                                    } else {
                                        model.searchs[index].searchFields.splice(j, 0, searchField);
                                    }
                                }
                                for (let j = search.subsystems.length; j < model.searchs[index].subsystems.length;) {
                                    let subsystemField = model.searchs[index].subsystems[j];

                                    const indexField = subsystems.findIndex(x => x.code === subsystemField.subsystem.code);
                                    if (indexField < 0) {
                                        model.searchs[index].subsystems.splice(j, 1);
                                        continue;
                                    }
                                    j++;
                                }
                                for (let j = search.searchFields.length; j < model.searchs[index].searchFields.length;) {
                                    let searchField = model.searchs[index].searchFields[j];
                                    if (searchField.dataset && searchField.dataset.code !== importedCode) {
                                        const indexRelative = this.model.relatives.findIndex(x =>
                                            x.name === searchField.dataset.name
                                        );
                                        if (indexRelative < 0) {
                                            search.searchFields.splice(j, 1);
                                            continue;
                                        }
                                        const indexRelativeField = this.model.relatives[indexRelative].fields.findIndex(x =>
                                            x.tableField.name.toUpperCase() === searchField.field.tableField.name.toUpperCase());
                                        if (indexRelativeField < 0) {
                                            search.searchFields.splice(j, 1);
                                            continue;
                                        }
                                        searchField.dataset = this.model.relatives[indexRelative];
                                        searchField.field = this.model.relatives[indexRelative].fields[indexRelativeField];
                                    }
                                    else {
                                        const indexModelFields = model.fields.findIndex(x =>
                                            x.tableField.name.toUpperCase() === searchField.field.tableField.name.toUpperCase());
                                        if (indexModelFields < 0) {
                                            search.searchFields.splice(j, 1);
                                            continue;
                                        }
                                        searchField.dataset = {code: model.code, id: model.id, name: model.name};
                                        searchField.field = this.model.fields[indexModelFields];
                                    }

                                    searchField.code = null;
                                    searchField.id = crypto.randomUUID();
                                    j++;
                                }

                                const [item] = model.searchs.splice(index, 1);
                                model.searchs.splice(i, 0, item);
                            } else {
                                model.searchs.splice(i, 0, search);
                            }
                        }
                        for (let i = this.model.searchs.length; i < model.searchs.length; i++) {
                            let search = model.searchs[i];
                            search.code = null;
                            search.id = crypto.randomUUID();
                            for (let j = 0; j < search.subsystems.length;) {
                                let subsystemField = search.subsystems[j];

                                const indexField = subsystems.findIndex(x => x.code === subsystemField.subsystem.code);
                                if (indexField < 0) {
                                    search.subsystems.splice(j, 1);
                                    continue;
                                }
                                j++;
                            }
                            for (let j = 0; j < search.searchFields.length;) {
                                let searchField = search.searchFields[j];
                                searchField.code = null;
                                searchField.id = crypto.randomUUID();

                                if (searchField.dataset.code && searchField.dataset.code !== importedCode) {
                                    const indexRelative = this.model.relatives.findIndex(x =>
                                        x.name === searchField.dataset.name
                                    );
                                    if (indexRelative < 0) {
                                        search.searchFields.splice(j, 1);
                                        continue;
                                    }
                                    const indexRelativeField = this.model.relatives[indexRelative].fields.findIndex(x =>
                                        x.tableField.name.toUpperCase() === searchField.field.tableField.name.toUpperCase());
                                    if (indexRelativeField < 0) {
                                        search.searchFields.splice(j, 1);
                                        continue;
                                    }
                                    searchField.dataset = this.model.relatives[indexRelative];
                                    searchField.field = this.model.relatives[indexRelative].fields[indexRelativeField];
                                }
                                else {
                                    const indexModelFields = model.fields.findIndex(x =>
                                        x.tableField.name.toUpperCase() === searchField.field.tableField.name.toUpperCase());
                                    if (indexModelFields < 0) {
                                        search.searchFields.splice(j, 1);
                                        continue;
                                    }
                                    searchField.dataset = {code: model.code, id: model.id, name: model.name};
                                    searchField.field = model.fields[indexModelFields];
                                }
                                searchField.code = null;
                                searchField.id = crypto.randomUUID();
                                j++;
                            }

                        }
                        //end searchs

                        //customizations
                        if (UtilFunctions.isValidStringOrArray(model.customizations) === false) {
                            model.customizations = [];
                        }
                        if (UtilFunctions.isValidStringOrArray(this.model.customizations) === false) {
                            this.model.customizations = [];
                        }
                        for (let i = 0; i < model.customizations.length; i++) {
                            model.customizations[i].name1 = this.model.name;
                        }

                        for (let i = 0; i < this.model.customizations.length; i++) {
                            let customization = this.model.customizations[i];
                            let index = model.customizations.findIndex(x =>
                                x.name1.toUpperCase() === customization.name1.toUpperCase() &&
                                x.name2.toUpperCase() === customization.name2.toUpperCase() &&
                                x.name3.toUpperCase() === customization.name3.toUpperCase() &&
                                x.name4.toUpperCase() === customization.name4.toUpperCase() &&
                                x.name5.toUpperCase() === customization.name5.toUpperCase() &&
                                x.type === customization.type
                            );
                            if (index >= 0) {
                                model.customizations[index].code = customization.code;
                                model.customizations[index].id = customization.id;
                                const [item] = model.customizations.splice(index, 1);
                                model.customizations.splice(i, 0, item);
                            } else {
                                model.customizations.splice(i, 0, customization);
                            }
                        }
                        for (let i = this.model.customizations.length; i < model.customizations.length; i++) {
                            let customization = model.customizations[i];
                            customization.code = null;
                            customization.id = crypto.randomUUID();
                        }
                        //end customizations
                        this._cloneModel = model;
                        this.refresh();
                        this._changeDetectorRef.detectChanges();
                        this.messageService.open('Importação realizada com sucesso', 'SUCESSO', 'success');

                    } catch (e) {
                        console.error(e);
                        this.messageService.open('Erro na importação : ' + e, 'ERRO', 'error');
                    }

                });



            } catch (e) {
                console.error(e);
                this.messageService.open('Erro na importação : ' + e, 'ERRO', 'error');
            }
        }
    }
    showValidationsError(): string {
        const errors = UtilFunctions.getInvalidFields(this.formSave);
        /*
        if (UtilFunctions.isValidStringOrArray(errors) === true) {
            errors.forEach(value => {
                if (value.startsWith('fields')) {
                    const path = value.split('.');
                    const model = this.fieldsDataSource.data[parseInt(path[1])][path[2]];
                    console.log(path, model);
                }

            })
        }
         */
        if (UtilFunctions.isValidObject(this.model.invalidFields) === true) {
            return JSON.stringify(this.model.invalidFields, null, 2);
        }
        else {
            return JSON.stringify(errors, null, 2);
        }
    }

    hasValidationProblem(type: TableType): boolean {
        return UtilFunctions.isValidObject(this.model.invalidFields) && UtilFunctions.isValidStringOrArray(this.model.invalidFields[type]);
    }
}
