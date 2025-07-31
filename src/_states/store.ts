import { configureStore, Middleware } from "@reduxjs/toolkit";
import auth from "./reducers/auth/auth.slice";
import blogCategory from "./reducers/blogCategory/blogCategory.slice";
import blogComment from "./reducers/blogComment/blogComment.slice";
import blogContent from "./reducers/blogContent/blogContent.slice";
import blogTag from "./reducers/blogTag/blogTag.slice";
import notif from "./reducers/notif/notif.slice";
import publicBlogContent from "./reducers/publicBlogContent/publicBlogContent.slice";
import publicBlogContentDetail from "./reducers/publicBlogContentDetail/publicBlogContentDetail.slice";
import publicBlogCategory from "./reducers/publicBlogCategory/publicBlogCategory.slice";
import { RootState } from "./types";

const preloadedState = 
  (window as unknown as Window & { __PRELOADED_STATE__: RootState })
    .__PRELOADED_STATE__;



const logger: Middleware<unknown, RootState> = ({ getState }) => {
  return (next) => (action) => {
      console.log('will dispatch', action)

    // Call the next dispatch method in the middleware chain.
    const returnValue = next(action);

      console.log('state after dispatch', getState())

    // This will likely be the action itself, unless
    // a middleware further in chain changed it.
    return returnValue;
  };
}

export const store = configureStore({
  reducer: {
    auth,
    blogCategory,
    blogComment,
    blogContent,
    blogTag,
    notif,
    publicBlogContent,
    publicBlogContentDetail,
    publicBlogCategory,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // ✅ disables check completely
    }).concat(logger),
});

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
