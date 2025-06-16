import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FilterModel } from '../../models/filter.model';

@Component({
    selector: 'app-filter',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatRadioModule,
        MatDatepickerModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule
    ],
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
    @Input() filters: FilterModel[] = [];
    @Input() loading: boolean = false;
    @Input() showCloseButton: boolean = false;
    @Output() onFilter = new EventEmitter<any>();
    @Output() onClear = new EventEmitter<void>();
    @Output() onClose = new EventEmitter<void>();

    filterForm: FormGroup;

    constructor(private fb: FormBuilder) {
        this.filterForm = this.fb.group({});
    }

    ngOnInit(): void {
        this.buildForm();
    }

    ngOnChanges(): void {
        if (this.filters?.length) {
            this.buildForm();
        }
    }

    private buildForm(): void {
        const formControls: any = {};

        this.filters.forEach(filter => {
            if (filter.type === 'DATE_RANGE') {
                formControls[`${filter.column}_start`] = [filter.value?.start || ''];
                formControls[`${filter.column}_end`] = [filter.value?.end || ''];
            } else if (filter.type === 'CHECKBOX') {
                formControls[filter.column] = [filter.value || false];
            } else if (filter.type === 'MULTIPLE_SELECT') {
                formControls[filter.column] = [filter.value || []];
            } else {
                formControls[filter.column] = [filter.value || ''];
            }
        });

        this.filterForm = this.fb.group(formControls);
    }

    onSubmit(): void {
        const filterData = this.getFilters();
        if (filterData) {
            this.onFilter.emit(filterData);
        }
    }

    onClearFilters(): void {
        this.filterForm.reset();

        // Reset specific field types to their default values
        this.filters.forEach(filter => {
            if (filter.type === 'CHECKBOX') {
                this.filterForm.get(filter.column)?.setValue(false);
            } else if (filter.type === 'MULTIPLE_SELECT') {
                this.filterForm.get(filter.column)?.setValue([]);
            }
        });

        this.onClear.emit();
    }

    onCloseFilter(): void {
        this.onClose.emit();
    }

    private hasValue(value: any, type: string): boolean {
        if (type === 'CHECKBOX') {
            return value === true;
        }

        if (type === 'MULTIPLE_SELECT') {
            return Array.isArray(value) && value.length > 0;
        }

        return value !== null && value !== undefined && value !== '';
    }

    getFieldError(filter: FilterModel): string | null {
        const control = this.filterForm.get(filter.column);

        if (control && control.errors && control.touched) {
            if (control.errors['required']) {
                return `${filter.label} é obrigatório`;
            }
        }

        return null;
    }

    getFilters(): FilterModel[] {
        if (this.filterForm.valid) {
            const formValues = this.filterForm.value;
            const filterData: FilterModel[] = [];

            this.filters.forEach(filter => {
                if (filter.type === 'DATE_RANGE') {
                    const startValue = formValues[`${filter.column}_start`];
                    const endValue = formValues[`${filter.column}_end`];

                    if (startValue || endValue) {
                        const f: FilterModel = {
                            column: filter.column,
                            label: filter.label,
                            type: filter.type,
                            operator: filter.operator || 'BETWEEN',
                            required: filter.required || false,
                        }
                        f.value = [startValue, endValue];
                        filterData.push(f);

                    }
                } else {
                    const value = formValues[filter.column];

                    if (this.hasValue(value, filter.type)) {
                        const f: FilterModel = {
                            column: filter.column,
                            label: filter.label,
                            type: filter.type,
                            operator: filter.operator || 'EQUALS',
                            required: filter.required || false,
                            value: value
                        };

                        if (filter.type === 'MULTIPLE_SELECT' && Array.isArray(value)) {
                            f.value = value.filter(v => v !== null && v !== undefined);
                        } else {
                            f.value = value;
                        }

                        filterData.push(f);
                    }
                }
            });
            return filterData;
        }
        return null;
    }
}
