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
import {Subject} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {NgFor, NgIf} from '@angular/common';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {
    LuthierChangesOfTableModel,
    LuthierCheckObjectsSummaryModel
} from '../../../../../../shared/models/luthier.model';
import {LuthierDictionaryComponent} from '../../luthier-dictionary.component';
import {UtilFunctions} from '../../../../../../shared/util/util-functions';
import {FilterPredicateUtil} from '../../../../../../shared/util/util-classes';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import {MatTooltipModule} from '@angular/material/tooltip';
import {LuthierDictionaryChangesModalComponent} from '../changes/luthier-dictionary-changes-modal.component';

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
        MatTooltipModule
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class LuthierDictionaryCheckObjectsModalComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatSort) sort: MatSort;
    model: LuthierCheckObjectsSummaryModel;
    displayedColumns = [ 'buttons', 'table.code', 'table.name', 'table.objectType', 'new', 'changed', 'done', 'hasError', "changedFields", "changedPKs", "changedReferences", "changedIndexes", "changedViews" ];
    filterModel: {
        changed?: boolean
        changedFields?: boolean
        changedPKs?: boolean
        changedReferences?: boolean
        changedIndexes?: boolean
        changedViews?: boolean
        hasError?: boolean
        done?: boolean
        new?: boolean
        text?: string
    } = {
        changed: null,
        changedFields: null,
        changedPKs: null,
        changedReferences: null,
        changedIndexes: null,
        changedViews: null,
        hasError: null,
        done: null,
        new: null,
        text: null
    }
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
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        UtilFunctions.setSortingDataAccessor(this.dataSource);
        const filterPredicateSearchs = FilterPredicateUtil.withColumns([ 'table.code', 'table.name', 'table.objectType']);
        this.dataSource.filterPredicate = filterPredicateSearchs.instance.bind(filterPredicateSearchs);
    }

    filter() {
        this.dataSource.data = this.model.changes.filter(x => {
            for (const key in this.filterModel) {
                if (key !== 'text') {
                    if (this.filterModel[key] !== null) {
                        if (x[key] !== this.filterModel[key]) {
                            return false;
                        }
                    }
                }
            }
            if (UtilFunctions.isValidStringOrArray(this.filterModel.text) === true) {
                const valid = UtilFunctions.removeAccents(x.table.code.toString()).includes(UtilFunctions.removeAccents(this.filterModel.text.toUpperCase())) ||
                    UtilFunctions.removeAccents(x.table.name.toUpperCase()).includes(UtilFunctions.removeAccents(this.filterModel.text.toUpperCase())) ||
                    UtilFunctions.removeAccents(x.table.objectType.toUpperCase()).includes(UtilFunctions.removeAccents(this.filterModel.text.toUpperCase()));
                return valid;
            }

            return true;
        })
        this.dataSource._updateChangeSubscription();
        this._changeDetectorRef.detectChanges();

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
       this.filter();

    }

    download() {
        this.parent.downloadFile(this.model, 'changes.json');
    }

    viewTable(model: LuthierChangesOfTableModel) {
        const modalModel = {
            isNew: model.new,
            luthierTable: model.table
        };
        this.openModal(`Dados do banco Luthier da ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
    }

    viewMeta(model: LuthierChangesOfTableModel, i) {
        const modalModel = {
            isNew: model.new,
            databaseMeta: model.meta
        };
        this.openModal(`Dados que estavam salvos no banco de dados da ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
    }

    viewError(model: LuthierChangesOfTableModel, i) {
        const modalModel = {
            isNew: model.new,
            error: model.error
        };
        this.openModal(`Stacktrace do erro ocorrido na ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
    }

    viewChangedFields(model: LuthierChangesOfTableModel, i) {
        const modalModel = {
            isNew: model.new,
            updated: model.updatedFields,
            inserted: model.insertedFields,
            deleted: model.deletedFields,
            metaFields: model.meta?.fields,
            luthierFields: model.table.fields,
        }
        this.openModal(`Alterações de Campos na ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
    }

    viewChangedPKs(model: LuthierChangesOfTableModel, i) {
        const modalModel = {
            isNew: model.new,
            wasNeeded: model.needPK,
            deleted: model.deletedPks,
            metaPKs: model.meta?.fields.filter(x => x.key === true),
            luthierPKs: model.table.fields.filter(x => x.key === true),
        }
        this.openModal(`Alterações de PKs na ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
    }

    viewChangedReferences(model: LuthierChangesOfTableModel, i) {
        const modalModel = {
            isNew: model.new,
            updated: model.updatedReferences,
            inserted: model.insertedReferences,
            deleted: model.deletedReferences,
            metaReferences: model.meta?.references,
            luthierReferences: model.table.references,
        }
        this.openModal(`Alterações de Referências na ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
    }

    viewChangedIndexes(model: LuthierChangesOfTableModel, i) {
        const modalModel = {
            isNew: model.new,
            updated: model.updatedIndexes,
            inserted: model.insertedIndexes,
            deleted: model.deletedIndexes,
            metaReferences: model.meta?.indexes,
            luthierReferences: model.table.indexes,
        }
        this.openModal(`Alterações de Índices na ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
    }

    viewChangedViews(model: LuthierChangesOfTableModel, i) {
        const modalModel = {
            isNew: model.new,
            updatedValue: model.nativeViewBody,
            metaViews: model.meta?.views,
            luthierViews: model.table.views,
        }
        this.openModal(`Alterações de SQL na ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
    }

    openModal(title: string, model: any) {
        const modal = this._matDialog.open(LuthierDictionaryChangesModalComponent, { disableClose: true, panelClass: 'luthier-dictionary-changes-modal-container' });
        modal.componentInstance.title = title;
        modal.componentInstance.model = model;
    }
}
