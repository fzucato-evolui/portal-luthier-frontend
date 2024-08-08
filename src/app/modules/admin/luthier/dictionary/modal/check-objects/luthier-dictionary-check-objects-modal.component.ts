import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {debounceTime, ReplaySubject, Subject, takeUntil} from 'rxjs';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {
    LuthierChangesOfTableModel,
    LuthierCheckObjectsSummaryModel
} from '../../../../../../shared/models/luthier.model';
import {LuthierDictionaryComponent} from '../../luthier-dictionary.component';
import {UtilFunctions} from '../../../../../../shared/util/util-functions';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import {MatTooltipModule} from '@angular/material/tooltip';
import {LuthierDictionaryChangesModalComponent} from '../changes/luthier-dictionary-changes-modal.component';
import {FormsModule} from '@angular/forms';

export type FilterCheckObjectsModel = {
    changed?: boolean
    changedFields?: boolean
    changedPKs?: boolean
    changedReferences?: boolean
    changedIndexes?: boolean
    changedViews?: boolean
    hasError?: boolean
    done?: boolean
    isNew?: boolean
    text?: string
}
@Component({
    selector       : 'luthier-dictionary-check-objects-modal',
    styleUrls      : ['/luthier-dictionary-check-objects-modal.component.scss'],
    templateUrl    : './luthier-dictionary-check-objects-modal.component.html',
    imports: [
        FormsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        NgFor,
        MatDialogModule,
        MatTableModule,
        MatSortModule,
        NgIf,
        MatCheckboxModule,
        MatTooltipModule,
        AsyncPipe
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class LuthierDictionaryCheckObjectsModalComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatSort) sort: MatSort;
    model: LuthierCheckObjectsSummaryModel;
    summaryFooter: LuthierCheckObjectsSummaryModel = new LuthierCheckObjectsSummaryModel();
    displayedColumns = [ 'buttons', 'table.code', 'table.name', 'table.objectType', 'isNew', 'changed', 'done', 'hasError', "changedFields", "changedPKs", "changedReferences", "changedIndexes", "changedViews" ];
    filterModel: FilterCheckObjectsModel = {
        changed: null,
        changedFields: null,
        changedPKs: null,
        changedReferences: null,
        changedIndexes: null,
        changedViews: null,
        hasError: null,
        done: null,
        isNew: null,
        text: null
    }
    $filterModel: ReplaySubject<FilterCheckObjectsModel> = new ReplaySubject<FilterCheckObjectsModel>(1);
    public dataSource = new MatTableDataSource<LuthierChangesOfTableModel>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    title: string;
    private _parent: LuthierDictionaryComponent;

    set parent(value: LuthierDictionaryComponent) {
        this._parent = value;
    }

    get parent(): LuthierDictionaryComponent {
        return  this._parent;
    }

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _matDialog: MatDialog,
                public dialogRef: MatDialogRef<LuthierDictionaryCheckObjectsModalComponent>)
    {
    }

    ngOnInit(): void {
        this.dataSource.data = this.model.changes;
        this.summaryFooter = {
            totalTime: this.model.totalTime,
            total: this.model.total,
            totalChanges: this.model.totalChanges,
            totalNew: this.model.totalNew,
            totalChangesFields: this.model.totalChangesFields,
            totalChangesPKs: this.model.totalChangesPKs,
            totalChangesReferences: this.model.totalChangesReferences,
            totalChangesIndexes: this.model.totalChangesIndexes,
            totalChangesViews: this.model.totalChangesViews,
            totalTables: this.model.totalTables,
            totalViews: this.model.totalViews,
            totalDone: this.model.totalDone,
            totalErrors: this.model.totalErrors

        }
        this.$filterModel.pipe(takeUntil(this._unsubscribeAll), debounceTime(300))
            .subscribe((value) =>
            {
                this.filter(value);
            });
    }

    ngOnDestroy(): void {
        this.parent.service.checkObjectsDeleteChanges(this.model.id);
        this.dataSource.data = [];
        this.model = null;
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        UtilFunctions.setSortingDataAccessor(this.dataSource);
    }

    filter(value: FilterCheckObjectsModel) {
        this.summaryFooter = new LuthierCheckObjectsSummaryModel();

        this.dataSource.data = this.model.changes.filter(x => {
            for (const key in value) {
                if (key !== 'text') {
                    if (value[key] !== null) {
                        if (x[key] !== value[key]) {
                            return false;
                        }
                    }
                }
            }
            let valid = true;
            if (UtilFunctions.isValidStringOrArray(value.text) === true) {
                valid = UtilFunctions.removeAccents(x.table.code.toString()).includes(UtilFunctions.removeAccents(value.text.toUpperCase())) ||
                    UtilFunctions.removeAccents(x.table.name.toUpperCase()).includes(UtilFunctions.removeAccents(value.text.toUpperCase())) ||
                    UtilFunctions.removeAccents(x.table.objectType.toUpperCase()).includes(UtilFunctions.removeAccents(value.text.toUpperCase()));
            }
            if (valid) {
                this.summaryFooter.total += 1;
                if (x.table.objectType === 'TABLE') {
                    this.summaryFooter.totalTables += 1;
                }
                else {
                    this.summaryFooter.totalViews += 1;
                }
                if (x.done) {
                    this.summaryFooter.totalDone += 1;
                }
                if (x.hasError) {
                    this.summaryFooter.totalErrors += 1;
                }
                if (x.isNew) {
                    this.summaryFooter.totalNew += 1;
                }
                if (x.changed) {
                    this.summaryFooter.totalChanges += 1;
                }
                if (x.changedFields) {
                    this.summaryFooter.totalChangesFields += 1;
                }
                if (x.changedPKs) {
                    this.summaryFooter.totalChangesPKs += 1;
                }
                if (x.changedReferences) {
                    this.summaryFooter.totalChangesReferences += 1;
                }
                if (x.changedIndexes) {
                    this.summaryFooter.totalChangesIndexes += 1;
                }
                if (x.changedViews) {
                    this.summaryFooter.totalChangesViews += 1;
                }

            }
            return valid;
        });

        this.dataSource._updateChangeSubscription();
        this._changeDetectorRef.detectChanges();

    }

    filterText() {
        this.$filterModel.next(this.filterModel);
    }
    changeBoolean(event: MatCheckboxChange, key: string) {
        if (this.filterModel[key] !== null) {
            if (UtilFunctions.parseBoolean(this.filterModel[key]) === false) {
                this.filterModel[key] = null;
            }
            else {
                this.filterModel[key] = false;
            }
        }
        else {
            this.filterModel[key] = true;
        }
        event.source.checked = this.filterModel[key];
        this.$filterModel.next(this.filterModel);
    }

    download() {
        this.parent.service.checkObjectsAllChanges(this.model.id)
            .then(result => {
                const filteredResult = {
                    filter: this.filterModel,
                    summary: this.summaryFooter,
                    changes: result.changes.filter(x => this.dataSource.data.findIndex(y => y.table.name === x.table.name) >= 0)
                };
                this.parent.downloadFile(filteredResult, 'changes.json');
            })

    }

    downloadChange(model: LuthierChangesOfTableModel) {
        if (model['complete']) {
            this.parent.downloadFile(model, `changes${model.table.name}.json`);
        }
        else {
            this.parent.service.checkObjectsTableChanges(this.model.id, model.table.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSource.data.findIndex(x => x.table.code === model.table.code);
                    this.dataSource.data[index] = result;
                    this.dataSource._updateChangeSubscription();
                    this.parent.downloadFile(result, `changes${result.table.name}.json`);
                });
        }
    }
    viewTable(model: LuthierChangesOfTableModel) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                luthierTable: model.table
            };
            this.openModal(`Dados do banco Luthier da ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
        }
        else {
            this.parent.service.checkObjectsTableChanges(this.model.id, model.table.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSource.data.findIndex(x => x.table.code === model.table.code);
                    this.dataSource.data[index] = result;
                    this.dataSource._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        luthierTable: result.table
                    };
                    this.openModal(`Dados do banco Luthier da ${result.table.objectType === 'TABLE' ? 'tabela' : 'view'} ${result.table.name}`, modalModel);
                });
        }

    }

    viewMeta(model: LuthierChangesOfTableModel, i) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                databaseMeta: model.meta
            };
            this.openModal(`Dados que estavam salvos no banco de dados da ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
        }
        else {
            this.parent.service.checkObjectsTableChanges(this.model.id, model.table.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSource.data.findIndex(x => x.table.code === model.table.code);
                    this.dataSource.data[index] = result;
                    this.dataSource._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        databaseMeta: result.meta
                    };
                    this.openModal(`Dados que estavam salvos no banco de dados da ${result.table.objectType === 'TABLE' ? 'tabela' : 'view'} ${result.table.name}`, modalModel);
                });
        }
    }

    viewError(model: LuthierChangesOfTableModel, i) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                error: model.error
            };
            this.openModal(`Stacktrace do erro ocorrido na ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
        }
        else {
            this.parent.service.checkObjectsTableChanges(this.model.id, model.table.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSource.data.findIndex(x => x.table.code === model.table.code);
                    this.dataSource.data[index] = result;
                    this.dataSource._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        error: result.error
                    };
                    this.openModal(`Stacktrace do erro ocorrido na ${result.table.objectType === 'TABLE' ? 'tabela' : 'view'} ${result.table.name}`, modalModel);
                });
        }
    }

    viewChangedFields(model: LuthierChangesOfTableModel, i) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                updated: model.updatedFields,
                inserted: model.insertedFields,
                deleted: model.deletedFields,
                metaFields: model.meta?.fields,
                luthierFields: model.table.fields,
            }
            this.openModal(`Alterações de Campos na ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
        }
        else {
            this.parent.service.checkObjectsTableChanges(this.model.id, model.table.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSource.data.findIndex(x => x.table.code === model.table.code);
                    this.dataSource.data[index] = result;
                    this.dataSource._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        updated: result.updatedFields,
                        inserted: result.insertedFields,
                        deleted: result.deletedFields,
                        metaFields: result.meta?.fields,
                        luthierFields: result.table.fields,
                    }
                    this.openModal(`Alterações de Campos na ${result.table.objectType === 'TABLE' ? 'tabela' : 'view'} ${result.table.name}`, modalModel);
                });
        }
    }

    viewChangedPKs(model: LuthierChangesOfTableModel, i) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                wasNeeded: model.needPK,
                deleted: model.deletedPks,
                metaPKs: model.meta?.fields.filter(x => x.key === true),
                luthierPKs: model.table.fields.filter(x => x.key === true),
            }
            this.openModal(`Alterações de PKs na ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
        }
        else {
            this.parent.service.checkObjectsTableChanges(this.model.id, model.table.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSource.data.findIndex(x => x.table.code === model.table.code);
                    this.dataSource.data[index] = result;
                    this.dataSource._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        wasNeeded: result.needPK,
                        deleted: result.deletedPks,
                        metaPKs: result.meta?.fields.filter(x => x.key === true),
                        luthierPKs: result.table.fields.filter(x => x.key === true),
                    }
                    this.openModal(`Alterações de PKs na ${result.table.objectType === 'TABLE' ? 'tabela' : 'view'} ${result.table.name}`, modalModel);
                });
        }

    }

    viewChangedReferences(model: LuthierChangesOfTableModel, i) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                updated: model.updatedReferences,
                inserted: model.insertedReferences,
                deleted: model.deletedReferences,
                metaReferences: model.meta?.references,
                luthierReferences: model.table.references,
            }
            this.openModal(`Alterações de Referências na ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);

        }
        else {
            this.parent.service.checkObjectsTableChanges(this.model.id, model.table.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSource.data.findIndex(x => x.table.code === model.table.code);
                    this.dataSource.data[index] = result;
                    this.dataSource._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        updated: result.updatedReferences,
                        inserted: result.insertedReferences,
                        deleted: result.deletedReferences,
                        metaReferences: result.meta?.references,
                        luthierReferences: result.table.references,
                    }
                    this.openModal(`Alterações de Referências na ${result.table.objectType === 'TABLE' ? 'tabela' : 'view'} ${result.table.name}`, modalModel);
                });
        }
    }

    viewChangedIndexes(model: LuthierChangesOfTableModel, i) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                updated: model.updatedIndexes,
                inserted: model.insertedIndexes,
                deleted: model.deletedIndexes,
                metaReferences: model.meta?.indexes,
                luthierReferences: model.table.indexes,
            }
            this.openModal(`Alterações de Índices na ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
        }
        else {
            this.parent.service.checkObjectsTableChanges(this.model.id, model.table.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSource.data.findIndex(x => x.table.code === model.table.code);
                    this.dataSource.data[index] = result;
                    this.dataSource._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        updated: result.updatedIndexes,
                        inserted: result.insertedIndexes,
                        deleted: result.deletedIndexes,
                        metaReferences: result.meta?.indexes,
                        luthierReferences: result.table.indexes,
                    }
                    this.openModal(`Alterações de Índices na ${result.table.objectType === 'TABLE' ? 'tabela' : 'view'} ${result.table.name}`, modalModel);
                });
        }

    }

    viewChangedViews(model: LuthierChangesOfTableModel, i) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                updatedValue: model.nativeViewBody,
                metaViews: model.meta?.views,
                luthierViews: model.table.views,
            }
            this.openModal(`Alterações de SQL na ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
        }
        else {
            this.parent.service.checkObjectsTableChanges(this.model.id, model.table.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSource.data.findIndex(x => x.table.code === model.table.code);
                    this.dataSource.data[index] = result;
                    this.dataSource._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        updatedValue: result.nativeViewBody,
                        metaViews: result.meta?.views,
                        luthierViews: result.table.views,
                    }
                    this.openModal(`Alterações de SQL na ${result.table.objectType === 'TABLE' ? 'tabela' : 'view'} ${result.table.name}`, modalModel);
                });
        }

    }

    openModal(title: string, model: any) {
        const modal = this._matDialog.open(LuthierDictionaryChangesModalComponent, { disableClose: true, panelClass: 'luthier-dictionary-changes-modal-container' });
        modal.componentInstance.title = title;
        modal.componentInstance.model = model;
    }

    cleanFilter() {
        this.filterModel = {
            changed: null,
            changedFields: null,
            changedPKs: null,
            changedReferences: null,
            changedIndexes: null,
            changedViews: null,
            hasError: null,
            done: null,
            isNew: null,
            text: null
        }
        this.$filterModel.next(this.filterModel);
    }
}
