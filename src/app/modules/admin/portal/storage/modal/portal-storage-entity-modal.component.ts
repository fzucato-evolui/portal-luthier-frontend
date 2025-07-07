import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {firstValueFrom, map, Observable, startWith, Subject, takeUntil} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {PortalStorageService} from '../portal-storage.service';
import {PortalStorageEntityModel, StorageBreadcrumbModel} from '../../../../../shared/models/portal-storage.model';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';

export interface StorageEntityModalData {
    title: string;
    entity?: PortalStorageEntityModel;
    userId?: number;
    userName?: string;
    name?: string;
    breadcrumbs?: StorageBreadcrumbModel[],
    mode: 'create' | 'edit';
}

export interface UserOption {
    id: number;
    name: string;
    email: string;
}

@Component({
    selector: 'portal-storage-entity-modal',
    styleUrls: ['./portal-storage-entity-modal.component.scss'],
    templateUrl: './portal-storage-entity-modal.component.html',
    imports: [
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatButtonModule,        MatFormFieldModule,
        ReactiveFormsModule,
        ScrollingModule,
        NgFor,
        NgIf,
        AsyncPipe,
        MatDialogModule
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class PortalStorageEntityModalComponent implements OnInit, OnDestroy {

    formSave: FormGroup;
    userSearchControl = new FormControl('');
    filteredUsers: Observable<UserOption[]>;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    data: StorageEntityModalData;
    availableUsers: UserOption[] = [];

    constructor(
        private _formBuilder: FormBuilder,
        private _storageService: PortalStorageService,
        private _messageService: MessageDialogService,
        private _changeDetectorRef: ChangeDetectorRef,
        public dialogRef: MatDialogRef<PortalStorageEntityModalComponent>
    ) {}

    ngOnInit(): void {
        // Create the form
        this.formSave = this._formBuilder.group({
            id: [null],
            userId: [{ value: this.data.userId || null, disabled: !!this.data.userId }, [Validators.required]],
            name: [{ value: this.data.name || '', disabled: !!this.data.name }, [Validators.required, Validators.maxLength(100)]],
            description: ['', [Validators.maxLength(500)]]
        });

        // If editing, populate form with existing data
        if (this.data.entity) {
            this.formSave.patchValue(this.data.entity);
        }

        // Setup user search filter first
        this.setupUserFilter();

        // Load available users if needed
        if (!this.data.userId) {
            this.loadAvailableUsers();
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private loadAvailableUsers(): void {
        this._storageService.getUsersWithStorageConfig()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (users) => {
                    this.availableUsers = users.map(user => ({
                        id: user.id,
                        name: user.name,
                        email: user.email
                    }));
                    // Trigger filter update after loading users
                    this.userSearchControl.updateValueAndValidity();
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading users:', error);
                }
            });
    }

    private setupUserFilter(): void {
        this.filteredUsers = this.userSearchControl.valueChanges.pipe(
            startWith(''),
            map(value => {
                // Se o valor é um objeto (usuário selecionado), usa uma string vazia para mostrar todos
                const filterValue = typeof value === 'string' ? value : '';
                return this._filterUsers(filterValue);
            })
        );
    }

    private _filterUsers(value: string): UserOption[] {
        if (!this.availableUsers) {
            return [];
        }

        if (!value) {
            return this.availableUsers.slice();
        }

        const filterValue = value.toLowerCase();
        return this.availableUsers.filter(user =>
            user.name.toLowerCase().includes(filterValue) ||
            user.email.toLowerCase().includes(filterValue)
        );
    }

    doSaving(): void {
        const entityData: PortalStorageEntityModel = {
            ...this.formSave.getRawValue(),
            userId: this.formSave.get('userId')?.value
        };
        if (this.data.mode === 'edit') {
            entityData.id = this.data.entity?.id; // Ensure we have the ID for editing
            firstValueFrom(this._storageService.updateEntity(entityData)).then(result => {
                this._messageService.open('Entidade atualizada com sucesso!', 'SUCCESS', 'success');
                this.dialogRef.close(result);
            });
        }
        else {
            firstValueFrom(this._storageService.createEntity(entityData)).then(result => {
                this._messageService.open('Entitidade criada com sucesso!', 'SUCCESS', 'success');
                this.dialogRef.close(result);
            })
        }
    }

    canSave(): boolean {
        return this.formSave ? !this.formSave.invalid : false;
    }

    getUserDisplayName(user: UserOption): string {
        return `${user.name} (${user.email})`;
    }

    onUserSelected(event: MatAutocompleteSelectedEvent): void {
        const user = event.option.value as UserOption;
        if (user && user.id) {
            this.formSave.get('userId')?.setValue(user.id);
            console.log('User selected:', user);
        }
    }

    displayUserFn = (user: UserOption | null): string => {
        return user ? this.getUserDisplayName(user) : '';
    }
}
