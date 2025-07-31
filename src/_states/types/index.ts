import type { AuthState } from "../reducers/auth/auth.type";
import { IBlogCategoryState } from "../reducers/blogCategory/blogCategory.type";
import { IBlogCommentState } from "../reducers/blogComment/blogComment.type";
import { IBlogContentState } from "../reducers/blogContent/blogContent.type";
import { IBlogTagState } from "../reducers/blogTag/blogTag.type";
import { NotifState } from "../reducers/notif/notif.type";
import { IPublicBlogCategoryState } from "../reducers/publicBlogCategory/publicBlogCategory.type";
import { IPublicBlogContentState } from "../reducers/publicBlogContent/publicBlogContent.type";
import { IPublicBlogContentDetailState } from "../reducers/publicBlogContentDetail/publicBlogContentDetail.type";

export interface IAction {
    type?:string;payload?:any
  }
export  type IDispatch = (action: IAction | Thunk) => void;

export type Middleware = (
    getState: () => any
  ) => (next: IDispatch) => IDispatch;

export type Thunk = (
    dispatch: IDispatch,
    getState: () => any
  ) => void;


export interface RootState {
  auth: AuthState;
  blogCategory: IBlogCategoryState;
  blogComment: IBlogCommentState;
  blogContent: IBlogContentState;
  blogTag: IBlogTagState;
  notif: NotifState;
  publicBlogContent: IPublicBlogContentState;
  publicBlogContentDetail: IPublicBlogContentDetailState;
  publicBlogCategory: IPublicBlogCategoryState;
}
  