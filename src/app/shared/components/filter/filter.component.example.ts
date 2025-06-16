import { Component } from '@angular/core';
import { FilterModel } from '../../models/filter.model';

@Component({
    selector: 'app-filter-example',
    template: `
        <div class="container mx-auto p-4">
            <h2 class="text-2xl font-bold mb-6">Exemplo de Uso do Componente Filter</h2>

            <!-- Botão para mostrar/ocultar filtros -->
            <div class="mb-4">
                <button
                    mat-raised-button
                    color="primary"
                    (click)="showFilters = !showFilters">
                    <mat-icon class="mr-2">
                        {{ showFilters ? 'visibility_off' : 'visibility' }}
                    </mat-icon>
                    {{ showFilters ? 'Ocultar' : 'Mostrar' }} Filtros
                </button>
            </div>

            <!-- Componente de Filtro -->
            <app-filter
                *ngIf="showFilters"
                [filters]="filters"
                [loading]="isLoading"
                [showCloseButton]="true"
                (onFilter)="handleFilter($event)"
                (onClear)="handleClear()"
                (onClose)="handleClose()">
            </app-filter>

            <!-- Resultado dos filtros -->
            <div *ngIf="lastFilterData" class="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h3 class="text-lg font-semibold mb-4">Últimos Filtros Aplicados:</h3>
                <pre class="text-sm">{{ lastFilterData | json }}</pre>
            </div>
        </div>
    `
})
export class FilterExampleComponent {
    isLoading = false;
    lastFilterData: any = null;
    showFilters = true;

    filters: FilterModel[] = [
        {
            column: 'name',
            label: 'Nome',
            type: 'TEXT',
            operator: 'EQUALS',
            required: false
        },
        {
            column: 'email',
            label: 'E-mail',
            type: 'TEXT',
            operator: 'EQUALS',
            required: false
        },
        {
            column: 'age',
            label: 'Idade',
            type: 'NUMBER',
            operator: 'EQUALS',
            required: false
        },
        {
            column: 'birthDate',
            label: 'Data de Nascimento',
            type: 'DATE',
            operator: 'EQUALS',
            required: false
        },
        {
            column: 'period',
            label: 'Período de Cadastro',
            type: 'DATE_RANGE',
            operator: 'BETWEEN',
            required: false
        },
        {
            column: 'status',
            label: 'Status',
            type: 'SELECT',
            operator: 'EQUALS',
            required: false,
            options: [
                { label: 'Ativo', value: 'active' },
                { label: 'Inativo', value: 'inactive' },
                { label: 'Pendente', value: 'pending' }
            ]
        },
        {
            column: 'categories',
            label: 'Categorias',
            type: 'MULTIPLE_SELECT',
            operator: 'in',
            required: false,
            options: [
                { label: 'Categoria A', value: 'cat_a' },
                { label: 'Categoria B', value: 'cat_b' },
                { label: 'Categoria C', value: 'cat_c' },
                { label: 'Categoria D', value: 'cat_d' }
            ]
        },
        {
            column: 'isActive',
            label: 'Apenas usuários ativos',
            type: 'CHECKBOX',
            operator: 'EQUALS',
            required: false
        },
        {
            column: 'priority',
            label: 'Prioridade',
            type: 'RADIO',
            operator: 'EQUALS',
            required: false,
            options: [
                { label: 'Alta', value: 'high' },
                { label: 'Média', value: 'medium' },
                { label: 'Baixa', value: 'low' }
            ]
        }
    ];

    handleFilter(filterData: any): void {
        console.log('Filtros aplicados:', filterData);
        this.lastFilterData = filterData;

        // Simular loading
        this.isLoading = true;
        setTimeout(() => {
            this.isLoading = false;
            // Aqui você faria a chamada para sua API com os filtros
            // this.loadData(filterData);
        }, 2000);
    }

    handleClear(): void {
        console.log('Filtros limpos');
        this.lastFilterData = null;
        // Aqui você recarregaria os dados sem filtros
        // this.loadData();
    }

    handleClose(): void {
        console.log('Filtros fechados');
        this.showFilters = false;
        // Aqui você pode implementar lógica adicional quando o filtro for fechado
    }
}
