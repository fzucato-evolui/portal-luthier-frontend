export class FilterModel {
    public column: string;
    public label: string;
    public value?: any;
    public type: 'TEXT' | 'NUMBER' | 'DATE' | 'DATE_RANGE' | 'SELECT' | 'MULTIPLE_SELECT' | 'CHECKBOX' | 'RADIO';
    public options?: Array<{ label: string, value: any }>;
    public operator?: 'EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'BETWEEN' | 'IN' | 'NOT_IN' = 'EQUALS';
    public required: boolean = false;
}

export class FilterRequestModel {
    /**
     * Lista de filtros aplicados
     */
    public filters?: FilterModel[];

    /**
     * Texto de busca geral (opcional)
     */
    public searchText?: string;

    /**
     * Página atual para paginação
     */
    public page?: number = 0;

    /**
     * Tamanho da página para paginação
     */
    public size?: number = 10;

    /**
     * Campo para ordenação
     */
    public sortBy?: string;

    /**
     * Direção da ordenação
     */
    public sortDirection?: SortDirection = SortDirection.ASC;

    constructor(init?: Partial<FilterRequestModel>) {
        Object.assign(this, init);
    }
}

/**
 * Enum para direção da ordenação
 */
export enum SortDirection {
    ASC = 'ASC',
    DESC = 'DESC'
}

/**
 * Interface para resposta paginada do backend
 * Corresponde ao Page<T> do Spring Data
 */
export interface PageResponse<T> {
    /**
     * Conteúdo da página atual
     */
    content: T[];

    /**
     * Informações de paginação
     */
    pageable: {
        sort: {
            sorted: boolean;
            unsorted: boolean;
            empty: boolean;
        };
        pageNumber: number;
        pageSize: number;
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };

    /**
     * Número total de elementos
     */
    totalElements: number;

    /**
     * Número total de páginas
     */
    totalPages: number;

    /**
     * Se é a última página
     */
    last: boolean;

    /**
     * Tamanho da página
     */
    size: number;

    /**
     * Número da página atual
     */
    number: number;

    /**
     * Informações de ordenação
     */
    sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
    };

    /**
     * Se é a primeira página
     */
    first: boolean;

    /**
     * Número de elementos na página atual
     */
    numberOfElements: number;

    /**
     * Se está vazia
     */
    empty: boolean;
}
