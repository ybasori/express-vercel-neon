import About from "@src/pages/About/About";
import PublicBlogContentDetail from "@src/pages/Blog/pages/Content/PublicBlogContentDetail";
import PublicBlogMain from "@src/pages/Blog/pages/PublicBlogMain/PublicBlogMain";
import PublicBlog from "@src/pages/Blog/PublicBlog";
import Dashboard from "@src/pages/Dashboard/Dashboard";
import Blog from "@src/pages/Dashboard/pages/Blog/Blog";
import Category from "@src/pages/Dashboard/pages/Blog/pages/Category/Category";
import CategoryCreateEdit from "@src/pages/Dashboard/pages/Blog/pages/Category/page/CategoryCreateEdit";
import Comment from "@src/pages/Dashboard/pages/Blog/pages/Comment/Comment";
import Content from "@src/pages/Dashboard/pages/Blog/pages/Content/Content";
import CreateEdit from "@src/pages/Dashboard/pages/Blog/pages/Content/pages/CreateEdit/CreateEdit";
import TagCreateEdit from "@src/pages/Dashboard/pages/Blog/pages/Tag/page/TagCreateEdit";
import Tag from "@src/pages/Dashboard/pages/Blog/pages/Tag/Tag";
import Home from "@src/pages/Home/Home";
import Login from "@src/pages/Login/Login";

export interface IRoute {
  path: string;
  Component: React.FC<any>;
  private?: boolean;
  children?: IRoute[];
  props?: any;
}


export const api = {
  PUBLIC_BLOG_CATEGORY_LIST: "/api/blog/category",
  PUBLIC_BLOG_CONTENT_LIST: "/api/blog/content",
  PUBLIC_BLOG_COMMENT_LIST: "/api/blog/comment",
  PUBLIC_BLOG_COMMENT_STORE: "/api/blog/comment/store",
  DASHBOARD_BLOG_CONTENT_LIST: "/api/dashboard/blog/content",
  DASHBOARD_BLOG_CONTENT_CREATE: "/api/dashboard/blog/content/create",
  DASHBOARD_BLOG_CONTENT_UPDATE: "/api/dashboard/blog/content/update",
  DASHBOARD_BLOG_CONTENT_DELETE: "/api/dashboard/blog/content/delete",
  DASHBOARD_BLOG_CATEGORY_LIST: "/api/dashboard/blog/category",
  DASHBOARD_BLOG_CATEGORY_CREATE: "/api/dashboard/blog/category/create",
  DASHBOARD_BLOG_CATEGORY_UPDATE: "/api/dashboard/blog/category/update",
  DASHBOARD_BLOG_CATEGORY_DELETE: "/api/dashboard/blog/category/delete",
  DASHBOARD_BLOG_TAG_LIST: "/api/dashboard/blog/tag",
  DASHBOARD_BLOG_TAG_CREATE: "/api/dashboard/blog/tag/create",
  DASHBOARD_BLOG_TAG_UPDATE: "/api/dashboard/blog/tag/update",
  DASHBOARD_BLOG_TAG_DELETE: "/api/dashboard/blog/tag/delete",
  DASHBOARD_BLOG_COMMENT_LIST: "/api/dashboard/blog/comment",
  DASHBOARD_BLOG_COMMENT_DELETE: "/api/dashboard/blog/comment/delete",
};

export const routes: IRoute[] = [
  {
    path: "/dashboard",
    Component: Dashboard,
    private: true,
    children: [
      {
        path: "/dashboard/blog/comment",
        Component: Comment,
      },
      {
        path: "/dashboard/blog/tag/edit/:uid",
        Component: TagCreateEdit,
        props: {
          isEdit: true,
        },
      },
      {
        path: "/dashboard/blog/tag/create",
        Component: TagCreateEdit,
      },
      {
        path: "/dashboard/blog/tag",
        Component: Tag,
      },
      {
        path: "/dashboard/blog/category/edit/:uid",
        Component: CategoryCreateEdit,
        props: {
          isEdit: true,
        },
      },
      {
        path: "/dashboard/blog/category/create",
        Component: CategoryCreateEdit,
      },
      {
        path: "/dashboard/blog/category",
        Component: Category,
      },
      {
        path: "/dashboard/blog/content/edit/:uid",
        Component: CreateEdit,
        props: {
          isEdit: true,
        },
      },
      {
        path: "/dashboard/blog/content/create",
        Component: CreateEdit,
      },
      {
        path: "/dashboard/blog/content",
        Component: Content,
      },
      {
        path: "/dashboard/blog",
        Component: Blog,
      },
      {
        path: "/dashboard/page",
        Component: () => <>Page</>,
      },
      {
        path: "/dashboard",
        Component: () => <>Dashboard</>,
      },
    ],
  },
  {
    path: "/about",
    Component: About,
    private: false,
  },
  {
    path: "/login",
    Component: Login,
    private: false,
  },
  {
    path: "/blog",
    Component: PublicBlog,
    private: false,
    children: [
      {
        path: "/blog/content/:uid",
        Component: PublicBlogContentDetail,
      },
      {
        path: "/blog/category/:uid",
        Component: PublicBlogMain,
      },
      {
        path: "/blog",
        Component: PublicBlogMain,
      },
    ],
  },
  {
    path: "/",
    Component: Home,
    private: false,
  },
];

