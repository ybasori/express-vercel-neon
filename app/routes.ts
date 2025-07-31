import { Request, Response } from "express";
import authController from "./controllers/authController";
import blogController from "./controllers/blogController";
import homeController from "./controllers/homeController";
import { IRoute } from "./helper";

const routes: IRoute[] = [
  {
    path: "/api",
    children: [
      {
        path: "/login",
        method: "post",
        controller: authController.login,
      },
      {
        path: "/logout",
        method: "post",
        controller: authController.logout,
      },
      {
        path: "/dashboard",
        children: [
          {
            path: "/blog",
            children: [
              {
                path: "/content",
                children: [
                  {
                    path: "/",
                    method: "get",
                    controller: blogController.listContent,
                  },
                  {
                    path: "/create",
                    method: "post",
                    controller: blogController.createContent,
                  },
                  {
                    path: "/update/:uid",
                    method: "put",
                    controller: blogController.updateContent,
                  },
                  {
                    path: "/delete/:uid",
                    method: "delete",
                    controller: blogController.deleteContent,
                  },
                ],
              },
              {
                path: "/category",
                children: [
                  {
                    path: "/",
                    method: "get",
                    controller: blogController.listCategory,
                  },
                  {
                    path: "/create",
                    method: "post",
                    controller: blogController.createCategory,
                  },
                  {
                    path: "/update/:uid",
                    method: "put",
                    controller: blogController.updateCategory,
                  },
                  {
                    path: "/delete/:uid",
                    method: "delete",
                    controller: blogController.deleteCategory,
                  },
                ],
              },
              {
                path: "/tag",
                children: [
                  {
                    path: "/",
                    method: "get",
                    controller: blogController.listTag,
                  },
                  {
                    path: "/create",
                    method: "post",
                    controller: blogController.createTag,
                  },
                  {
                    path: "/update/:uid",
                    method: "put",
                    controller: blogController.updateTag,
                  },
                  {
                    path: "/delete/:uid",
                    method: "delete",
                    controller: blogController.deleteTag,
                  },
                ],
              },
              {
                path: "/comment",
                children: [
                  {
                    path: "/",
                    method: "get",
                    controller: blogController.listComment,
                  },
                  {
                    path: "/delete/:uid",
                    method: "delete",
                    controller: blogController.deleteComment,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "/blog",
        children:[
            {
                path: "/content",
                method: "get",
                controller: blogController.listContentPublic,
            },
            {
                path: "/category",
                method: "get",
                controller: blogController.listCategoryPublic,
            },
            {
                path: "/comment",
                method: "get",
                controller: blogController.listCommentPublic,
            },
            {
                path: "/comment/store",
                method: "post",
                controller: blogController.storeCommentPublic,
            },
        ]
      },
      {
        path: "/{*any}",
        method: "all",
        controller: (_req: Request, res: Response) => {
          res.status(404).json({
            statusCode: 400,
            message: "API endpoint not found",
          });
        },
      },
    ],
  },
//   {
//     path: "/",
//     method: "get",
//     controller: homeController.any,
//   },
  {
    path: "/{*any}",
    method: "get",
    controller: homeController.any,
  },
];

export default routes;
