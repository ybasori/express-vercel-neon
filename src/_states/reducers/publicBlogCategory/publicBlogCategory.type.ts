export interface IPublicBlogCategoryState {
  loading: boolean;
  response: {
    statusCode: number;
    message: string;
    result: {
      data: {
        id: number;
        uid: string;
        name: string;
        content:{
          total: number;
        };
        created_at: string;
        updated_at: string;
      }[];
      total: number;
    };
  } | null;
  error: any;
  page:{of:number;size:number};
  sort:{by:string;order:"asc"|"desc"}[];
  filter:{[x:string]:any}
}
