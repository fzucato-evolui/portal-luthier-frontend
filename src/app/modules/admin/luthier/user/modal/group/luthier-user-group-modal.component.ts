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
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {DatePipe, JsonPipe, NgFor, NgIf} from '@angular/common';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {MatSlideToggleChange, MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTooltipModule} from '@angular/material/tooltip';
import {SharedPipeModule} from '../../../../../../shared/pipes/shared-pipe.module';
import {
    LuthierSubsystemModel,
    LuthierUserActionEnum,
    LuthierUserGroupEnum,
    LuthierUserGroupModel,
    LuthierUserModel,
    LuthierUserStatusEnum,
    LuthierUserSubsystemAcessEnum,
    LuthierUserSubsystemModel,
    LuthierUserTypeEnum
} from '../../../../../../shared/models/luthier.model';
import {LuthierUserComponent} from '../../luthier-user.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {SelectionModel} from '@angular/cdk/collections';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {UtilFunctions} from '../../../../../../shared/util/util-functions';
import {FilterPredicateUtil} from '../../../../../../shared/util/util-classes';
import {LuthierService} from '../../../luthier.service';

@Component({
    selector       : 'luthier-user-group-modal',
    styleUrls      : ['/luthier-user-group-modal.component.scss'],
    templateUrl    : './luthier-user-group-modal.component.html',
    imports: [
        SharedPipeModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        FormsModule,
        NgFor,
        MatDialogModule,
        NgxMaskDirective,
        JsonPipe,
        MatTableModule,
        MatSortModule,
        NgIf,
        MatSlideToggleModule,
        MatTooltipModule,
        MatTabsModule,
        DatePipe,
        MatDatepickerModule,
        MatCheckboxModule
    ],
    providers: [
        provideNgxMask(),
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class LuthierUserGroupModalComponent implements OnInit, OnDestroy, AfterViewInit
{
    formSave: FormGroup;
    @ViewChild('sortUsers') sortUsers: MatSort;
    @ViewChild('sortSubsystems') sortSubsystems: MatSort;
    userModel: LuthierUserModel;
    selectedUsers: SelectionModel<LuthierUserGroupModel>;
    selectedSubsystems: SelectionModel<LuthierUserSubsystemModel>;
    private _subsystems: LuthierSubsystemModel[];
    private editMode: boolean = false;
    get service(): LuthierService {
        return this.parent.service;
    }
    get subsystems(): LuthierSubsystemModel[] {
        return this._subsystems;
    }

    set subsystems(value: LuthierSubsystemModel[]) {
        this._subsystems = value;
    }
    index: number;
    public dataSourceUsers = new MatTableDataSource<LuthierUserGroupModel>();
    public dataSourceSubsystems = new MatTableDataSource<LuthierUserSubsystemModel>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    title: string;
    private _parent: LuthierUserComponent;
    displayedGroupColumns = ['buttons', 'user.code', 'user.name', 'user.login', 'user.email', 'user.userType', 'user.date', 'user.status', 'user.multiAccess', 'user.sms' ];
    displayedSubsystemsColumns = ['buttons', 'subsystem.code', 'subsystem.description', 'subsystem.plataform', 'access'];
    set parent(value: LuthierUserComponent) {
        this._parent = value;
    }
    get parent(): LuthierUserComponent {
        return  this._parent;
    }
    get users(): LuthierUserModel[] {
        return this.parent.dataSourceUsers.data;
    }

    LuthierUserStatusEnum = LuthierUserStatusEnum;
    LuthierUserTypeEnum = LuthierUserTypeEnum;
    LuthierUserSubsystemAcessEnum = LuthierUserSubsystemAcessEnum;
    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _formBuilder: FormBuilder,
                public dialogRef: MatDialogRef<LuthierUserGroupModalComponent>)
    {
    }

    ngOnInit(): void {
        this.formSave = this._formBuilder.group({
            code: [null],
            name: ['', Validators.required],
            login: [''],
            userType: [null],
            date: [null],
            status: [null, Validators.required],
            group: [LuthierUserGroupEnum.GROUP, Validators.required],
            email: [null, [Validators.email]],
            sms: [null],
            password: [null],
            action: [LuthierUserActionEnum.NONE],
            deadLine: [null],
            multiAccess: [true]
        })
        this.formSave.patchValue(this.userModel);

        this.dataSourceUsers.data = this.users.map(x => {
            return {user:  x}
        });
        let initalSelectedUsers = [];
        if (UtilFunctions.isValidStringOrArray(this.userModel.users) === true) {
            initalSelectedUsers = this.dataSourceUsers.data.filter(x => this.userModel.users.findIndex(y => y.user.code === x.user.code) >= 0);
        }
        this.selectedUsers = new SelectionModel<LuthierUserGroupModel>(true, initalSelectedUsers);

        this.dataSourceSubsystems.data = this.subsystems.map( x => {
                return {subsystem:  x, access: LuthierUserSubsystemAcessEnum.NORMAL}
            });
        let initalSelectedSubsystems = [];
        if (UtilFunctions.isValidStringOrArray(this.userModel.subsystems) === true) {
            this.userModel.subsystems.forEach(x => {
                const index = this.dataSourceSubsystems.data.findIndex(y => y.subsystem.code === x.subsystem.code);
                if (index >= 0) {
                    this.dataSourceSubsystems.data[index].access = x.access;
                }
            });
            initalSelectedSubsystems = this.dataSourceSubsystems.data.filter(x => this.userModel.subsystems.findIndex(y => y.subsystem.code === x.subsystem.code) >= 0);
        }
        this.selectedSubsystems = new SelectionModel<LuthierUserSubsystemModel>(true, initalSelectedSubsystems);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        UtilFunctions.setSortingDataAccessor(this.dataSourceUsers);
        const filterPredicateUsers = FilterPredicateUtil.withColumns(this.displayedGroupColumns);
        this.dataSourceUsers.filterPredicate = filterPredicateUsers.instance.bind(filterPredicateUsers);
        this.dataSourceUsers.sort = this.sortUsers;

        UtilFunctions.setSortingDataAccessor(this.dataSourceSubsystems);
        const filterPredicateSubsystems = FilterPredicateUtil.withColumns(this.displayedSubsystemsColumns);
        this.dataSourceSubsystems.filterPredicate = filterPredicateSubsystems.instance.bind(filterPredicateSubsystems);
        this.dataSourceSubsystems.sort = this.sortSubsystems;
    }


    doSaving() {
        const user = this.formSave.value as LuthierUserModel;
        user.users = this.selectedUsers.selected;
        user.subsystems = this.selectedSubsystems.selected;
        this.service.saveUser(user)
            .then(result => {
                this.userModel = result;
                this.ngOnInit();
                this._changeDetectorRef.detectChanges();
                this.parent.messageService.open('Grupo de usuário salvo com sucesso', 'SUCESSO', 'success');
            });
    }

    canSave(): boolean {
        if (this.formSave) {
            return !this.formSave.invalid;
        }
        return false;
    }


    changePasswordChanged(event: MatSlideToggleChange) {
        if (event.checked) {
            this.formSave.get('action').setValue(LuthierUserActionEnum.CHANGE_PASSWORD);
        }
        else {
            this.formSave.get('action').setValue(LuthierUserActionEnum.NONE);
        }
    }

    isAllUsersSelected() {
        const numSelected = this.selectedUsers.selected.length;
        const numRows = this.dataSourceUsers.data.length;
        return numSelected === numRows;
    }

    toggleAllUsersRows() {
        if (this.isAllUsersSelected()) {
            this.selectedUsers.clear();
            return;
        }

        this.selectedUsers.select(...this.dataSourceUsers.data);
    }

    filterUsers(event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceUsers.filter = filterValue.trim().toLowerCase();
    }

    isAllSubsystemsSelected() {
        const numSelected = this.selectedSubsystems.selected.length;
        const numRows = this.dataSourceSubsystems.data.length;
        return numSelected === numRows;
    }

    toggleAllSubsystemsRows() {
        if (this.isAllSubsystemsSelected()) {
            this.selectedSubsystems.clear();
            return;
        }

        this.selectedSubsystems.select(...this.dataSourceSubsystems.data);
    }

    filterSubsystems(event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceSubsystems.filter = filterValue.trim().toLowerCase();
    }

    add() {
        this.editMode = !this.editMode;
    }
}
