# Filter Component

Um componente dinâmico de filtros para Angular com Angular Material e Tailwind CSS.

## Características

- ✅ Suporte a múltiplos tipos de campo (text, number, date, date-range, select, multiple-select, checkbox, radio)
- ✅ Validação de formulário integrada
- ✅ Design responsivo com Tailwind CSS
- ✅ Tema escuro suportado
- ✅ Componente standalone (não requer módulo)
- ✅ Eventos de filtro, limpeza e fechamento
- ✅ Estado de loading com indicadores visuais
- ✅ Botões de ação no cabeçalho com tooltips
- ✅ Date range integrado em um único campo
- ✅ Integração com Fuse template (fuse-mat-dense)
- ✅ Ícones FontAwesome para calendários
- ✅ Totalmente tipado com TypeScript

## Instalação

O componente está localizado em `src/app/shared/components/filter/` e é um componente standalone.

## Uso Básico

```typescript
import { Component } from '@angular/core';
import { FilterComponent } from './shared/components/filter/filter.component';
import { FilterModel } from './shared/models/filter.model';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [FilterComponent],
  template: `
    <app-filter 
      [filters]="filters"
      [loading]="isLoading"
      [showCloseButton]="true"
      (onFilter)="handleFilter($event)"
      (onClear)="handleClear()"
      (onClose)="handleClose()">
    </app-filter>
  `
})
export class ExampleComponent {
  isLoading = false;
  
  filters: FilterModel[] = [
    {
      column: 'name',
      label: 'Nome',
      type: 'TEXT',
      operator: 'EQUALS',
      required: false
    },
    {
      column: 'period',
      label: 'Período',
      type: 'DATE_RANGE',
      operator: 'BETWEEN'
    },
    {
      column: 'status',
      label: 'Status',
      type: 'SELECT',
      operator: 'EQUALS',
      options: [
        { label: 'Ativo', value: 'active' },
        { label: 'Inativo', value: 'inactive' }
      ]
    }
  ];

  handleFilter(filterData: any): void {
    console.log('Dados do filtro:', filterData);
    // Implementar lógica de filtro
  }

  handleClear(): void {
    console.log('Filtros limpos');
    // Implementar lógica de limpeza
  }

  handleClose(): void {
    console.log('Filtros fechados');
    // Implementar lógica de fechamento
  }
}
```

## Propriedades de Entrada (@Input)

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `filters` | `FilterModel[]` | `[]` | Array de modelos de filtro |
| `loading` | `boolean` | `false` | Estado de carregamento |
| `showCloseButton` | `boolean` | `false` | Exibir botão de fechar no cabeçalho |

## Eventos de Saída (@Output)

| Evento | Tipo | Descrição |
|--------|------|-----------|
| `onFilter` | `EventEmitter<any>` | Emitido quando o filtro é aplicado |
| `onClear` | `EventEmitter<void>` | Emitido quando os filtros são limpos |
| `onClose` | `EventEmitter<void>` | Emitido quando o botão fechar é clicado |

## Tipos de Campo Suportados

### Text
```typescript
{
  column: 'name',
  label: 'Nome',
  type: 'TEXT',
  operator: 'EQUALS'
}
```

### Number
```typescript
{
  column: 'age',
  label: 'Idade',
  type: 'NUMBER',
  operator: 'EQUALS'
}
```

### Date
```typescript
{
  column: 'birthDate',
  label: 'Data de Nascimento',
  type: 'DATE',
  operator: 'EQUALS'
}
```

### Date Range
```typescript
{
  column: 'period',
  label: 'Período',
  type: 'DATE_RANGE',
  operator: 'BETWEEN'
}
```

**Nota:** O campo date-range usa `mat-date-range-input` com um único campo que contém os dois inputs (De/Até) internamente, proporcionando uma experiência de usuário mais limpa e consistente com o Material Design.

### Select
```typescript
{
  column: 'status',
  label: 'Status',
  type: 'SELECT',
  operator: 'EQUALS',
  options: [
    { label: 'Ativo', value: 'active' },
    { label: 'Inativo', value: 'inactive' }
  ]
}
```

### Multiple Select
```typescript
{
  column: 'categories',
  label: 'Categorias',
  type: 'MULTIPLE_SELECT',
  operator: 'in',
  options: [
    { label: 'Categoria A', value: 'cat_a' },
    { label: 'Categoria B', value: 'cat_b' }
  ]
}
```

### Checkbox
```typescript
{
  column: 'isActive',
  label: 'Apenas ativos',
  type: 'CHECKBOX',
  operator: 'EQUALS'
}
```

### Radio
```typescript
{
  column: 'priority',
  label: 'Prioridade',
  type: 'RADIO',
  operator: 'EQUALS',
  options: [
    { label: 'Alta', value: 'high' },
    { label: 'Média', value: 'medium' },
    { label: 'Baixa', value: 'low' }
  ]
}
```

## Operadores Disponíveis

- `equals`: Igualdade exata
- `contains`: Contém o texto (para campos de texto)
- `greaterThan`: Maior que
- `lessThan`: Menor que
- `between`: Entre valores (para date-range)
- `in`: Está contido em (para multiple-select)
- `notIn`: Não está contido em

## Formato de Saída

Quando o filtro é aplicado, o evento `onFilter` emite um objeto com a seguinte estrutura:

```typescript
{
  [column]: {
    value: any,
    operator: string
  }
}
```

Para campos de data-range:
```typescript
{
  [column]: {
    start: Date,
    end: Date,
    operator: 'BETWEEN'
  }
}
```

## Exemplo de Dados Recebidos

```typescript
{
  name: {
    value: "João",
    operator: "contains"
  },
  status: {
    value: "active",
    operator: "equals"
  },
  period: {
    start: "2024-01-01",
    end: "2024-12-31",
    operator: "between"
  },
  categories: {
    value: ["cat_a", "cat_b"],
    operator: "in"
  },
  isActive: {
    value: true,
    operator: "equals"
  }
}
```

## Estilização

O componente usa Tailwind CSS para estilização e Angular Material para os componentes de UI. Suporta automaticamente temas escuros e é totalmente responsivo.

## Dependências

- Angular Material
- Tailwind CSS
- Angular Reactive Forms
