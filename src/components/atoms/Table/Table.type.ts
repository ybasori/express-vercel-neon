export interface ITable{
    data: any[]
    columns:{
        name?: string;
        field?: string;
        sortable?: boolean;
        searchable?: boolean;
        render?: (cell: string | number, row: any) => React.ReactNode;
    }[];
    loading: boolean;
    totalPage: number;
    page: {of: number; size:number;}
    onPage: (page: {of: number; size:number;}) => void;
    sort?: {by: string; order:  "asc"|"desc";}[]
    onSort?: (sort: {by: string; order: "asc"|"desc";}[]) => void;
    filter?: any;
    onFilter?: (filter: any) => void;
    check?: number[];
    onCheckChange?: (result: any[]) => void;
}