import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {MatButtonToggleChange, MatButtonToggleModule} from '@angular/material/button-toggle';
import {FormsModule} from '@angular/forms';
import {LuthierManagerPatchesComponent} from '../luthier-manager-patches.component';
import {LuthierService} from '../../../luthier.service';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NgIf} from '@angular/common';
import {NgxFileDropEntry, NgxFileDropModule} from 'ngx-file-drop';
import {UtilFunctions} from '../../../../../../shared/util/util-functions';
import {MessageDialogService} from '../../../../../../shared/services/message/message-dialog-service';
import {LuthierManagerPatchesLupReportComponent} from './report/luthier-manager-patches-lup-report.component';
import {LuthierManagerPatchesLupFileComponent} from './file/luthier-manager-patches-lup-file.component';
import {LuthierManagerPatchesLupResourceComponent} from './resource/luthier-manager-patches-lup-resource.component';
import {LuthierManagerPatchesLupMenuComponent} from './menu/luthier-manager-patches-lup-menu.component';
import {LuthierManagerPatchesLupParameterComponent} from './parameter/luthier-manager-patches-lup-parameter.component';
import {
    LuthierManagerPatchesLupLayoutControlComponent
} from './layout-control/luthier-manager-patches-lup-layout-control.component';
import {LuthierManagerPatchesLupHelpComponent} from './help/luthier-manager-patches-lup-help.component';
import {LuthierManagerPatchesLupMessageComponent} from './message/luthier-manager-patches-lup-message.component';
import {
    LupImportModel,
    LuthierLayoutControlModel,
    LuthierMessageTypeModel,
    LuthierParameterModel,
    LuthierProjectModel,
    LuthierReportModel,
    LuthierResourceModel,
    LuthierScriptTableModel,
    LuthierSubsystemModel,
    LuthierTableHelpModel,
    PatchImportItemModel
} from '../../../../../../shared/models/luthier.model';
import {LuthierManagerPatchesLupProjectComponent} from './project/luthier-manager-patches-lup-project.component';
import {MatDialog} from '@angular/material/dialog';
import {
    LuthierManagerPatchesLupProcessModalComponent
} from './modal/luthier-manager-patches-lup-process-modal.component';

export type LupType = 'PROJECT' | 'FILES' | 'REPORT' | 'RESOURCE' | 'MENU' | 'PARAMETER' | 'LAYOUTCONTROL' | 'HELP' | 'MESSAGE';
@Component({
    selector: 'luthier-manager-patches-lup',
    templateUrl: './luthier-manager-patches-lup.component.html',
    styleUrls: ['/luthier-manager-patches-lup.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatButtonToggleModule,
        MatButtonModule,
        FormsModule,
        MatIconModule,
        MatTooltipModule,
        NgIf,
        NgxFileDropModule,
        LuthierManagerPatchesLupReportComponent,
        LuthierManagerPatchesLupFileComponent,
        LuthierManagerPatchesLupResourceComponent,
        LuthierManagerPatchesLupMenuComponent,
        LuthierManagerPatchesLupParameterComponent,
        LuthierManagerPatchesLupLayoutControlComponent,
        LuthierManagerPatchesLupHelpComponent,
        LuthierManagerPatchesLupMessageComponent,
        LuthierManagerPatchesLupProjectComponent
    ]
})
export class LuthierManagerPatchesLupComponent implements OnInit, OnDestroy, AfterViewInit{
    @ViewChild("projects") projects: LuthierManagerPatchesLupProjectComponent;
    @ViewChild("files") files: LuthierManagerPatchesLupFileComponent;
    @ViewChild("reports") reports: LuthierManagerPatchesLupReportComponent;
    @ViewChild("resources") resources: LuthierManagerPatchesLupResourceComponent;
    @ViewChild("menus") menus: LuthierManagerPatchesLupMenuComponent;
    @ViewChild("parameters") parameters: LuthierManagerPatchesLupParameterComponent;
    @ViewChild("layoutControls") layoutControls: LuthierManagerPatchesLupLayoutControlComponent;
    @ViewChild("helps") helps: LuthierManagerPatchesLupHelpComponent;
    @ViewChild("messages") messages: LuthierManagerPatchesLupMessageComponent;
    lupType: LupType = null;
    fileLoaded: boolean = false;
    private fileName: string = null;
    get service(): LuthierService {
        if (this.parent != null) {
            return this.parent.service;
        }
        return null;
    }

    get import(): boolean {
        if (this.parent != null) {
            return this.parent.import;
        }
        return false;
    }

    get messageService(): MessageDialogService {
        if (this.parent != null) {
            return this.parent.messageService;
        }
        return null;
    }

    get drawerMode(): 'over' | 'side' {
        if (this.parent != null) {
            return this.parent.drawerMode;
        }
        return 'side';
    }

    set drawerMode(value: 'over' | 'side') {
        if (this.parent != null) {
            this.parent.drawerMode = value;
        }
    }

    get drawerOpened(): boolean {
        if (this.parent != null) {
            return this.parent.drawerOpened;
        }
        return true;
    }

    set drawerOpened(value: boolean) {
        if (this.parent != null) {
            this.parent.drawerOpened = value;
        }
    }

    constructor(public parent: LuthierManagerPatchesComponent,
                public changeDetectorRef: ChangeDetectorRef,
                private _matDialog: MatDialog) {
    }

    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void {

    }

    ngOnInit(): void {

    }

    save() {
        if (!this.import) {
            const filter: {[key: string]: Array<any>} = {};
            if (this.projects.canSave()) {
                //filter['PROJECT'] = this.projects.isAllSelected() ? [] : this.projects.selection.selected.map(item => item.code);
                filter['PROJECT'] = this.projects.selection.selected.map(item => item.code);
            }
            if (this.files.canSave()) {
                //filter['FILES'] = this.files.isAllSelected() ? [] : this.files.selection.selected.map(item => item.code);
                filter['FILES'] = this.files.selection.selected.map(item => item.code);
            }
            if (this.reports.canSave()) {
                //filter['REPORT'] = this.reports.isAllSelected() ? [] : this.reports.selection.selected.map(item => item.code);
                filter['REPORT'] = this.reports.selection.selected.map(item => item.code);
            }
            if (this.resources.canSave()) {
                //filter['RESOURCE'] = this.resources.isAllSelected() ? [] : this.resources.selection.selected.map(item => item.code);
                filter['RESOURCE'] = this.resources.selection.selected.map(item => item.code);
            }
            if (this.menus.canSave()) {
                //filter['MENU'] = this.menus.isAllSelected() ? [] : this.menus.selection.selected.map(item => item.code);
                filter['MENU'] = this.menus.selection.selected.map(item => item.code);
            }
            if (this.parameters.canSave()) {
                //filter['PARAMETER'] = this.parameters.isAllSelected() ? [] : this.parameters.selection.selected.map(item => item.name);
                filter['PARAMETER'] = this.parameters.selection.selected.map(item => item.name);
            }
            if (this.layoutControls.canSave()) {
                //filter['LAYOUTCONTROL'] = this.layoutControls.isAllSelected() ? [] : this.layoutControls.selection.selected.map(item => item.name);
                filter['LAYOUTCONTROL'] = this.layoutControls.selection.selected.map(item => item.name);
            }
            if (this.helps.canSave()) {
                //filter['HELP'] = this.helps.isAllSelected() ? [] : this.helps.selection.selected.map(item => item.code);
                filter['HELP'] = this.helps.selection.selected.map(item => item.code);
            }
            if (this.messages.canSave()) {
                //filter['MESSAGE'] = this.messages.isAllSelected() ? [] : this.messages.selection.selected.map(item => item.code);
                filter['MESSAGE'] = this.messages.selection.selected.map(item => item.code);
            }

            // this.service.generateLup(filter)
            //     .then(result => {
            //         this.service.download(result.link)
            //             .then(blob => {
            //                 saveAs(blob, result.fileName);// Handle successful download
            //             })
            //
            //     });
            const modal = this._matDialog.open(LuthierManagerPatchesLupProcessModalComponent, { disableClose: true, panelClass: 'luthier-manager-patches-lup-process-modal-container' });
            modal.componentInstance.title = "Geração de Arquivo LUP";
            modal.componentInstance.parent = this;
            modal.componentInstance.model = filter;
            modal.componentInstance.isImport = false;
        }
        else {
            const model = new LupImportModel();
            model.fileName = this.fileName;
            model.projects = this.projects.selection.selected.map(item => {
                const table = new PatchImportItemModel<LuthierProjectModel>();
                table.item = item;
                return table;
            });
            model.files = this.files.selection.selected.map(item => {
                const table = new PatchImportItemModel<LuthierScriptTableModel>();
                table.item = item;
                return table;
            });
            model.reports = this.reports.selection.selected.map(item => {
                const table = new PatchImportItemModel<LuthierReportModel>();
                table.item = item;
                return table;
            });
            model.resources = this.resources.selection.selected.map(item => {
                const table = new PatchImportItemModel<LuthierResourceModel>();
                table.item = item;
                return table;
            });
            model.menus = this.menus.selection.selected.map(item => {
                const table = new PatchImportItemModel<LuthierSubsystemModel>();
                table.item = item;
                return table;
            });
            model.parameters = this.parameters.selection.selected.map(item => {
                const table = new PatchImportItemModel<LuthierParameterModel>();
                table.item = item;
                return table;
            });
            model.layoutControls = this.layoutControls.selection.selected.map(item => {
                const table = new PatchImportItemModel<LuthierLayoutControlModel>();
                table.item = item;
                return table;
            });
            model.helps = this.helps.selection.selected.map(item => {
                const table = new PatchImportItemModel<LuthierTableHelpModel>();
                table.item = item;
                return table;
            });
            model.messages = this.messages.selection.selected.map(item => {
                const table = new PatchImportItemModel<LuthierMessageTypeModel>();
                table.item = item;
                return table;
            });

            const modal = this._matDialog.open(LuthierManagerPatchesLupProcessModalComponent, { disableClose: true, panelClass: 'luthier-manager-patches-lup-process-modal-container' });
            modal.componentInstance.title = "Processamento de Arquivo LUP";
            modal.componentInstance.parent = this;
            modal.componentInstance.model = model;
        }
    }

    canSave() {
        const canSave = (this.projects && this.projects.canSave()) ||
            (this.files && this.files.canSave()) ||
            (this.reports && this.reports.canSave()) ||
            (this.resources && this.resources.canSave()) ||
            (this.menus && this.menus.canSave()) ||
            (this.parameters && this.parameters.canSave()) ||
            (this.layoutControls && this.layoutControls.canSave()) ||
            (this.helps && this.helps.canSave()) ||
            (this.messages && this.messages.canSave());
        return canSave;
    }

    clearFile() {
        this.projects.datasource.data = [];
        this.projects.selection.clear();
        this.files.datasource.data = [];
        this.files.selection.clear();
        this.reports.datasource.data = [];
        this.reports.selection.clear();
        this.resources.datasource.data = [];
        this.resources.selection.clear();
        this.menus.datasource.data = [];
        this.menus.selection.clear();
        this.parameters.datasource.data = [];
        this.parameters.selection.clear();
        this.layoutControls.datasource.data = [];
        this.layoutControls.selection.clear();
        this.helps.datasource.data = [];
        this.helps.selection.clear();
        this.messages.datasource.data = [];
        this.messages.selection.clear();
        this.fileName = null;
        this.fileLoaded = false;
    }

    public dropped(files: NgxFileDropEntry[]) {
        const me = this;
        files.forEach(x => {
            if (x.fileEntry.isFile) {
                const ext = UtilFunctions.getFileExtension(x.relativePath);
                if (ext.toLowerCase() !== '.lup') {
                    this.messageService.open('Extensão não permitida', 'ERRO', 'error');
                    return;
                }
                const fileEntry = x.fileEntry as FileSystemFileEntry;

                fileEntry.file((file: File) => {
                    const formData = new FormData();
                    formData.append('file', file, file.name);

                    me.service.uploadLup(formData).then(result => {
                        me.projects.datasource.data = result.projects.map(item => {
                            item.item['message'] = item.message;
                            item.item['tag'] = item.status;
                            item.selectable = UtilFunctions.parseBoolean(item.selectable);
                            item.item['selectable'] = item.selectable;
                            if (item.selectable === false) {
                                if (UtilFunctions.isValidStringOrArray(item.status) === true) {
                                    item.item['statusRow'] = '#' + item.status.toLowerCase();
                                }
                            }
                            else {
                                item.item['statusRow'] = '#selected';
                                me.projects.selection.select(item.item);
                            }

                            return item.item;
                        });
                        me.files.datasource.data = result.files.map(item => {
                            item.item['message'] = item.message;
                            item.item['tag'] = item.status;
                            item.selectable = UtilFunctions.parseBoolean(item.selectable);
                            item.item['selectable'] = item.selectable;
                            if (item.selectable === false) {
                                if (UtilFunctions.isValidStringOrArray(item.status) === true) {
                                    item.item['statusRow'] = '#' + item.status.toLowerCase();
                                }
                            }
                            else {
                                item.item['statusRow'] = '#selected';
                                me.files.selection.select(item.item);
                            }

                            return item.item;
                        });
                        me.reports.datasource.data = result.reports.map(item => {
                            item.item['message'] = item.message;
                            item.item['tag'] = item.status;
                            item.selectable = UtilFunctions.parseBoolean(item.selectable);
                            item.item['selectable'] = item.selectable;
                            if (item.selectable === false) {
                                if (UtilFunctions.isValidStringOrArray(item.status) === true) {
                                    item.item['statusRow'] = '#' + item.status.toLowerCase();
                                }
                            }
                            else {
                                item.item['statusRow'] = '#selected';
                                me.reports.selection.select(item.item);
                            }

                            return item.item;
                        });
                        me.resources.datasource.data = result.resources.map(item => {
                            item.item['message'] = item.message;
                            item.item['tag'] = item.status;
                            item.selectable = UtilFunctions.parseBoolean(item.selectable);
                            item.item['selectable'] = item.selectable;
                            if (item.selectable === false) {
                                if (UtilFunctions.isValidStringOrArray(item.status) === true) {
                                    item.item['statusRow'] = '#' + item.status.toLowerCase();
                                }
                            }
                            else {
                                item.item['statusRow'] = '#selected';
                                me.resources.selection.select(item.item);
                            }

                            return item.item;
                        });
                        me.menus.datasource.data = result.menus.map(item => {
                            item.item['message'] = item.message;
                            item.item['tag'] = item.status;
                            item.selectable = UtilFunctions.parseBoolean(item.selectable);
                            item.item['selectable'] = item.selectable;
                            if (item.selectable === false) {
                                if (UtilFunctions.isValidStringOrArray(item.status) === true) {
                                    item.item['statusRow'] = '#' + item.status.toLowerCase();
                                }
                            }
                            else {
                                item.item['statusRow'] = '#selected';
                                me.menus.selection.select(item.item);
                            }

                            return item.item;
                        });
                        me.parameters.datasource.data = result.parameters.map(item => {
                            item.item['message'] = item.message;
                            item.item['tag'] = item.status;
                            item.selectable = UtilFunctions.parseBoolean(item.selectable);
                            item.item['selectable'] = item.selectable;
                            if (item.selectable === false) {
                                if (UtilFunctions.isValidStringOrArray(item.status) === true) {
                                    item.item['statusRow'] = '#' + item.status.toLowerCase();
                                }
                            }
                            else {
                                item.item['statusRow'] = '#selected';
                                me.parameters.selection.select(item.item);
                            }

                            return item.item;
                        });
                        me.layoutControls.datasource.data = result.layoutControls.map(item => {
                            item.item['message'] = item.message;
                            item.item['tag'] = item.status;
                            item.selectable = UtilFunctions.parseBoolean(item.selectable);
                            item.item['selectable'] = item.selectable;
                            if (item.selectable === false) {
                                if (UtilFunctions.isValidStringOrArray(item.status) === true) {
                                    item.item['statusRow'] = '#' + item.status.toLowerCase();
                                }
                            }
                            else {
                                item.item['statusRow'] = '#selected';
                                me.layoutControls.selection.select(item.item);
                            }

                            return item.item;
                        });
                        me.helps.datasource.data = result.helps.map(item => {
                            item.item['message'] = item.message;
                            item.item['tag'] = item.status;
                            item.selectable = UtilFunctions.parseBoolean(item.selectable);
                            item.item['selectable'] = item.selectable;
                            if (item.selectable === false) {
                                if (UtilFunctions.isValidStringOrArray(item.status) === true) {
                                    item.item['statusRow'] = '#' + item.status.toLowerCase();
                                }
                            }
                            else {
                                item.item['statusRow'] = '#selected';
                                me.helps.selection.select(item.item);
                            }

                            return item.item;
                        });
                        me.messages.datasource.data = result.messages.map(item => {
                            item.item['message'] = item.message;
                            item.item['tag'] = item.status;
                            item.selectable = UtilFunctions.parseBoolean(item.selectable);
                            item.item['selectable'] = item.selectable;
                            if (item.selectable === false) {
                                if (UtilFunctions.isValidStringOrArray(item.status) === true) {
                                    item.item['statusRow'] = '#' + item.status.toLowerCase();
                                }
                            }
                            else {
                                item.item['statusRow'] = '#selected';
                                me.messages.selection.select(item.item);
                            }

                            return item.item;
                        });
                        me.fileLoaded = true;
                        me.fileName = result.fileName;
                        me.changeDetectorRef.markForCheck();
                    });

                });
            }
        })

    }

    onLupTypeChange(event: MatButtonToggleChange) {
        // Força atualização do drawer quando o tipo muda
        setTimeout(() => {
            if (event.value === 'FILES' && this.files) {
                this.files.forceDrawerUpdate();
            } else if (event.value === 'REPORT' && this.reports) {
                this.reports.forceDrawerUpdate();
            } else if (event.value === 'RESOURCE' && this.resources) {
                this.resources.forceDrawerUpdate();
            } else if (event.value === 'MENU' && this.menus) {
                this.menus.forceDrawerUpdate();
            } else if (event.value === 'PARAMETER' && this.parameters) {
                this.parameters.forceDrawerUpdate();
            } else if (event.value === 'LAYOUTCONTROL' && this.layoutControls) {
                this.layoutControls.forceDrawerUpdate();
            } else if (event.value === 'HELP' && this.helps) {
                this.helps.forceDrawerUpdate();
            } else if (event.value === 'MESSAGE' && this.messages) {
                this.messages.forceDrawerUpdate();
            } else if (event.value === 'PROJECT' && this.projects) {
                this.projects.forceDrawerUpdate();
            }

            this.changeDetectorRef.detectChanges();
        }, 100);
    }
}
