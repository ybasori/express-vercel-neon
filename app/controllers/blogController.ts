import { convertToObj, promisify } from "@app/helper";
import Validator from "@app/helper/Validator";
import BlogCategory from "@app/models/BlogCategory";
import BlogComment from "@app/models/BlogComment";
import BlogContent from "@app/models/BlogContent";
import BlogContentTag from "@app/models/BlogContentTag";
import BlogTag from "@app/models/BlogTag";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const blogController = {
  listComment: async (req: Request, res: Response) => {
    try {
      let filter = {};
      let pagination = {};
      let show: any[] = [];
      const query = convertToObj(req.query);

      if (!!query.page) {
        pagination = { ...pagination, page: query.page };
      }

      if (!!query.sort) {
        pagination = { ...pagination, sort: query.sort };
      }
      if (!!query.filter) {
        filter = { ...filter, ...(query.filter as any) };
      }
      if (!!query.show) {
        show = [...show, ...(query.show as any)];
      }
      const blogContentModel = new BlogComment();
      const blogContents = await blogContentModel.getByFilter({
        filter: {
          deleted_at: "null",
          ...filter,
        },
        pagination,
        join: [
          {
            name: "content",
            joinType: "leftJoin",
            show: ["uid", "title"],
            join: [
              {
                name: "author",
                joinType: "leftJoin",
                show: ["uid", "name"],
              },
            ],
          },
        ],
        show,
      });
      const [[blogContentTotal]] = await blogContentModel.countByFilter({
        filter: {
          deleted_at: "null",
          ...filter,
        },
        join: [
          {
            name: "content",
            joinType: "leftJoin",
            show: ["uid"],
          },
        ],
      });
      return res.status(200).json({
        statusCode: 200,
        message: "Success!",
        result: {
          data: blogContents,
          total: blogContentTotal.total,
        },
      });
    } catch (err: any) {
      console.log(err);
      return res.status(500).json({
        statusCode: 500,
        message: err.message,
      });
    }
  },
  deleteComment: async (req: Request, res: Response) => {
    try {
      const token = req.cookies.token;

      const decoded: any = await promisify(jwt.verify)(
        token,
        process.env.SECRET_KEY ?? ""
      );
      const blogContentModel = new BlogComment();
      await blogContentModel.update(
        {
          deleted_at: new Date()
            .toISOString()
            .replace("T", " ")
            .replace("Z", "")
            .slice(0, 19),
        },
        {
          join: [
            {
              name: "content",
              joinType: "leftJoin",
              join: [
                {
                  name: "author",
                  joinType: "leftJoin",
                },
              ],
            },
          ],
          filter: {
            "blog_comments.uid": req.params.uid,
            "leftJoin_author.id": decoded.id,
          },
        }
      );
      return res.status(200).json({
        statusCode: 200,
        message: "Success!",
      });
    } catch (err) {
      return res.status(500).json({
        statusCode: 500,
        message: err,
      });
    }
  },
  listCommentPublic: async (req: Request, res: Response) => {
    try {
      let filter = {};
      let pagination = {};
      let show: any[] = [];
      const query = convertToObj(req.query);

      if (!!query.page) {
        pagination = { ...pagination, page: query.page };
      }

      if (!!query.sort) {
        pagination = { ...pagination, sort: query.sort };
      }
      if (!!query.filter) {
        filter = { ...filter, ...(query.filter as any) };
      }
      if (!!query.show) {
        show = [...show, ...(query.show as any)];
      }
      const blogContentModel = new BlogComment();
      const blogContents = await blogContentModel.getByFilter({
        filter: {
          deleted_at: "null",
          ...filter,
        },
        pagination,
        join: [{ name: "content", joinType: "leftJoin", show: ["uid"] }],
        show,
      });
      const [[blogContentTotal]] = await blogContentModel.countByFilter({
        filter: {
          deleted_at: "null",
          ...filter,
        },
        join: [{ name: "content", joinType: "leftJoin", show: ["uid"] }],
      });
      return res.status(200).json({
        statusCode: 200,
        message: "Success!",
        result: {
          data: blogContents,
          total: blogContentTotal.total,
        },
      });
    } catch (err: any) {
      console.log(err);
      return res.status(500).json({
        statusCode: 500,
        message: err.message,
      });
    }
  },
  storeCommentPublic: async (req: Request, res: Response) => {
    try {
      const uid = uuidv4();
      const rules = {
        name: {
          label: "Name",
          rule: {
            required: true,
          },
        },
        email: {
          label: "E-mail",
          rule: {
            required: true,
          },
        },
        comment: {
          label: "Comment",
          rule: {
            required: true,
          },
        },
        content_uid: {
          label: "Content",
          rule: {
            required: true,
          },
        },
      };
      const validate = await Validator.make(req.body, rules);
      if (validate.fails()) {
        return res.status(400).json({
          statusCode: 400,
          message: "Bad request!",
          error: validate.getMessages(),
        });
      }

      let optionalInputWithRelation = {};
      if (!!req.cookies.token) {
        const decoded: any = await promisify(jwt.verify)(
          req.cookies.token,
          process.env.SECRET_KEY ?? ""
        );

        optionalInputWithRelation = {
          ...optionalInputWithRelation,
          created_by_user_id: decoded.id,
        };
      }
      if (!!req.body.comment_id) {
        const blogCommentModel = new BlogComment();

        const [blogComment] = await blogCommentModel.getByFilter({
          filter: {
            uid: req.body.comment_uid,
          },
        });

        optionalInputWithRelation = {
          ...optionalInputWithRelation,
          blog_comment_id: blogComment.id,
        };
      }

      const blogContentModel = new BlogContent();

      const [blogContent] = await blogContentModel.getByFilter({
        filter: {
          uid: req.body.content_uid,
        },
      });

      const blogCommentModel = new BlogComment();

      await blogCommentModel.store({
        uid,
        name: req.body.name,
        email: req.body.email,
        comment: req.body.comment,
        blog_content_id: blogContent.id,
        ...optionalInputWithRelation,
      });

      const [blogComment] = await blogCommentModel.getByFilter({
        filter: { uid },
      });

      return res.status(200).json({
        statusCode: 200,
        message: "Success!",
        result: blogComment,
      });
    } catch (err: any) {
      console.log(err);
      return res.status(500).json({
        statusCode: 500,
        message: err.message,
      });
    }
  },
  listContentPublic: async (req: Request, res: Response) => {
    try {
      let filter = {};
      let pagination = {};
      let show: any[] = [];
      const query = convertToObj(req.query);

      if (!!query.page) {
        pagination = { ...pagination, page: query.page };
      }

      if (!!query.sort) {
        pagination = { ...pagination, sort: query.sort };
      }
      if (!!query.filter) {
        filter = { ...filter, ...(query.filter as any) };
      }
      if (!!query.show) {
        show = [...show, ...(query.show as any)];
      }
      const blogContentModel = new BlogContent();
      const blogContents = await blogContentModel.getByFilter({
        filter: {
          deleted_at: "null",
          ...filter,
        },
        pagination,
        join: [
          { name: "content_tag", join: ["tag"] },
          { name: "category", show: ["name"], joinType:"leftJoin" },
          { name: "created_by", show: ["name"] },
        ],
        show,
      });
      const [[blogContentTotal]] = await blogContentModel.countByFilter({
        filter: {
          deleted_at: "null",
          ...filter,
        },
        join: [
          { name: "content_tag", join: ["tag"] },
          { name: "category", show: ["name"], joinType:"leftJoin" },
          { name: "created_by", show: ["name"] },
        ],
      });
      return res.status(200).json({
        statusCode: 200,
        message: "Success!",
        result: {
          data: blogContents,
          total: blogContentTotal.total,
        },
      });
    } catch (err: any) {
      console.log(err);
      return res.status(500).json({
        statusCode: 500,
        message: err.message,
      });
    }
  },
  listCategoryPublic: async (req: Request, res: Response) => {
    try {
      let filter = {};
      let pagination = {};
      let show: any[] = [];
      const query = convertToObj(req.query);

      if (!!query.page) {
        pagination = { ...pagination, page: query.page };
      }

      if (!!query.sort) {
        pagination = { ...pagination, sort: query.sort };
      }
      if (!!query.filter) {
        filter = { ...filter, ...(query.filter as any) };
      }
      if (!!query.show) {
        show = [...show, ...(query.show as any)];
      }
      const blogContentModel = new BlogCategory();
      const blogContents = await blogContentModel.getByFilter({
        filter: {
          deleted_at: "null",
          ...filter,
        },
        pagination,
        join: [
          {
            name: "content",
            pagination: {
              page: {
                of: 1,
                size: 1,
              },
            },
          },
        ],
        show,
      });
      const [[blogContentTotal]] = await blogContentModel.countByFilter({
        filter: {
          deleted_at: "null",
          ...filter,
        },
      });
      return res.status(200).json({
        statusCode: 200,
        message: "Success!",
        result: {
          data: blogContents,
          total: blogContentTotal.total,
        },
      });
    } catch (err: any) {
      console.log(err);
      return res.status(500).json({
        statusCode: 500,
        message: err.message,
      });
    }
  },
  listContent: async (req: Request, res: Response) => {
    try {
      const token = req.cookies.token;

      const decoded: any = await promisify(jwt.verify)(
        token,
        process.env.SECRET_KEY ?? ""
      );

      let filter = {};
      let pagination = {};
      let show: any[] = [];
      const query = convertToObj(req.query);

      if (!!query.page) {
        pagination = { ...pagination, page: query.page };
      }

      if (!!query.sort) {
        pagination = { ...pagination, sort: query.sort };
      }
      if (!!query.filter) {
        filter = { ...filter, ...(query.filter as any) };
      }
      if (!!query.show) {
        show = [...show, ...(query.show as any)];
      }
      const blogContentModel = new BlogContent();
      const blogContents = await blogContentModel.getByFilter({
        filter: {
          created_by_user_id: decoded.id,
          deleted_at: "null",
          ...filter,
        },
        pagination,
        join: [
          { name: "content_tag", join: ["tag"] },
          { name: "category", joinType: "leftJoin", show: ["name"] },
          { name: "category", show: ["name"] },
          { name: "created_by", show: ["name"] },
        ],
        show,
      });
      const [[blogContentTotal]] = await blogContentModel.countByFilter({
        filter: {
          created_by_user_id: decoded.id,
          deleted_at: "null",
          ...filter,
        },
      });
      return res.status(200).json({
        statusCode: 200,
        message: "Success!",
        result: {
          data: blogContents,
          total: blogContentTotal.total,
        },
      });
    } catch (err: any) {
      console.log(err);
      return res.status(500).json({
        statusCode: 500,
        message: err.message,
      });
    }
  },
  createContent: async (req: Request, res: Response) => {
    try {
      const token = req.cookies.token;

      const decoded: any = await promisify(jwt.verify)(
        token,
        process.env.SECRET_KEY ?? ""
      );
      const uid = uuidv4();
      const rules = {
        title: {
          label: "Title",
          rule: {
            required: true,
          },
        },
        content: {
          label: "Content",
          rule: {
            required: true,
          },
        },
      };

      const validate = await Validator.make(req.body, rules);
      if (validate.fails()) {
        return res.status(400).json({
          statusCode: 400,
          message: "Bad request!",
          error: validate.getMessages(),
        });
      }

      let optionalInputWithRelation = {};
      if (!!req.body.category_uid) {
        const blogCategoryModel = new BlogCategory();
        const [blogCategories] = await blogCategoryModel.getByFilter({
          filter: {
            created_by_user_id: decoded.id,
            uid: req.body.category_uid,
          },
        });

        optionalInputWithRelation = {
          ...optionalInputWithRelation,
          blog_category_id: blogCategories.id,
        };
      }

      const blogContentModel = new BlogContent();
      await blogContentModel.store({
        title: req.body.title,
        content: req.body.content,
        created_by_user_id: decoded.id,
        uid,
        ...optionalInputWithRelation,
      });
      const [blogContent] = await blogContentModel.getByFilter({
        filter: { uid },
      });

      const blogContentTagModel = new BlogContentTag();
      if (!!req.body.tag_uid && req.body.tag_uid.length > 0) {
        const blogTagModel = new BlogTag();
        const blogTags = await blogTagModel.getByFilter({
          filter: {
            created_by_user_id: decoded.id,
            uid: {
              in: req.body.tag_uid,
            },
          },
        });

        blogTags.forEach((item: { id: number }) => {
          blogContentTagModel.store({
            blog_content_id: blogContent.id,
            blog_tag_id: item.id,
          });
        });
      }

      return res.status(200).json({
        statusCode: 200,
        message: "Success!",
        result: blogContent,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        statusCode: 500,
        message: err,
      });
    }
  },
  updateContent: async (req: Request, res: Response) => {
    try {
      const token = req.cookies.token;

      const decoded: any = await promisify(jwt.verify)(
        token,
        process.env.SECRET_KEY ?? ""
      );
      const rules = {
        title: {
          label: "Title",
          rule: {
            required: true,
          },
        },
        content: {
          label: "Content",
          rule: {
            required: true,
          },
        },
      };

      const validate = await Validator.make(req.body, rules);
      if (validate.fails()) {
        return res.status(400).json({
          statusCode: 400,
          message: "Bad request!",
          error: validate.getMessages(),
        });
      }

      let optionalInputWithRelation = { blog_category_id: null };
      if (!!req.body.category_uid) {
        const blogCategoryModel = new BlogCategory();
        const [blogCategories] = await blogCategoryModel.getByFilter({
          filter: {
            created_by_user_id: decoded.id,
            uid: req.body.category_uid,
          },
        });

        optionalInputWithRelation = {
          ...optionalInputWithRelation,
          blog_category_id: blogCategories.id,
        };
      }

      const blogContentModel = new BlogContent();
      await blogContentModel.update(
        {
          title: req.body.title,
          content: req.body.content,
          ...optionalInputWithRelation,
        },
        {
          filter: {
            created_by_user_id: decoded.id,
            uid: req.params.uid,
          },
        }
      );
      const [blogContent] = await blogContentModel.getByFilter({
        filter: { uid: req.params.uid },
      });

      const blogContentTagModel = new BlogContentTag();
      blogContentTagModel.delete({
        blog_content_id: blogContent.id,
      });
      if (!!req.body.tag_uid && req.body.tag_uid.length > 0) {
        const blogTagModel = new BlogTag();

        const blogTags = await blogTagModel.getByFilter({
          filter: {
            created_by_user_id: decoded.id,
            uid: {
              in: req.body.tag_uid,
            },
          },
        });

        blogTags.forEach((item: { id: number }) => {
          blogContentTagModel.store({
            blog_content_id: blogContent.id,
            blog_tag_id: item.id,
          });
        });
      }
      return res.status(200).json({
        statusCode: 200,
        message: "Success!",
        result: blogContent,
      });
    } catch (err) {
      return res.status(500).json({
        statusCode: 500,
        message: err,
      });
    }
  },
  deleteContent: async (req: Request, res: Response) => {
    try {
      const token = req.cookies.token;

      const decoded: any = await promisify(jwt.verify)(
        token,
        process.env.SECRET_KEY ?? ""
      );
      const blogContentModel = new BlogContent();
      await blogContentModel.update(
        {
          deleted_at: new Date()
            .toISOString()
            .replace("T", " ")
            .replace("Z", "")
            .slice(0, 19),
        },
        {
          filter: {
            uid: req.params.uid,
            created_by_user_id: decoded.id,
          },
        }
      );
      return res.status(200).json({
        statusCode: 200,
        message: "Success!",
      });
    } catch (err) {
      return res.status(500).json({
        statusCode: 500,
        message: err,
      });
    }
  },
  listCategory: async (req: Request, res: Response) => {
    try {
      const token = req.cookies.token;

      const decoded: any = await promisify(jwt.verify)(
        token,
        process.env.SECRET_KEY ?? ""
      );

      let filter = {};
      let pagination = {};
      let show: any[] = [];
      const query = convertToObj(req.query);

      if (!!query.page) {
        pagination = { ...pagination, page: query.page };
      }

      if (!!query.sort) {
        pagination = { ...pagination, sort: query.sort };
      }
      if (!!query.filter) {
        filter = { ...filter, ...(query.filter as any) };
      }
      if (!!query.show) {
        show = [...show, ...(query.show as any)];
      }
      const blogContentModel = new BlogCategory();
      const blogContents = await blogContentModel.getByFilter({
        filter: {
          created_by_user_id: decoded.id,
          deleted_at: "null",
          ...filter,
        },
        pagination,
        join: [{ name: "created_by", show: ["name"] }],
        show,
      });
      const [[blogContentTotal]] = await blogContentModel.countByFilter({
        filter: {
          created_by_user_id: decoded.id,
          deleted_at: "null",
          ...filter,
        },
      });
      return res.status(200).json({
        statusCode: 200,
        message: "Success!",
        result: {
          data: blogContents,
          total: blogContentTotal.total,
        },
      });
    } catch (err: any) {
      return res.status(500).json({
        statusCode: 500,
        message: err.message,
      });
    }
  },
  createCategory: async (req: Request, res: Response) => {
    try {
      const token = req.cookies.token;

      const decoded: any = await promisify(jwt.verify)(
        token,
        process.env.SECRET_KEY ?? ""
      );
      const uid = uuidv4();
      const rules = {
        name: {
          label: "Name",
          rule: {
            required: true,
          },
        },
      };

      const validate = await Validator.make(req.body, rules);
      if (validate.fails()) {
        return res.status(400).json({
          statusCode: 400,
          message: "Bad request!",
          error: validate.getMessages(),
        });
      }

      const blogContentModel = new BlogCategory();
      await blogContentModel.store({
        name: req.body.name,
        created_by_user_id: decoded.id,
        uid,
      });
      const [blogContent] = await blogContentModel.getByFilter({
        filter: { uid },
      });
      return res.status(200).json({
        statusCode: 200,
        message: "Success!",
        result: blogContent,
      });
    } catch (err) {
      return res.status(500).json({
        statusCode: 500,
        message: err,
      });
    }
  },
  updateCategory: async (req: Request, res: Response) => {
    try {
      const token = req.cookies.token;

      const decoded: any = await promisify(jwt.verify)(
        token,
        process.env.SECRET_KEY ?? ""
      );
      const rules = {
        name: {
          label: "Name",
          rule: {
            required: true,
          },
        },
      };

      const validate = await Validator.make(req.body, rules);
      if (validate.fails()) {
        return res.status(400).json({
          statusCode: 400,
          message: "Bad request!",
          error: validate.getMessages(),
        });
      }

      const blogContentModel = new BlogCategory();
      await blogContentModel.update(
        {
          name: req.body.name,
        },
        {
          filter: {
            created_by_user_id: decoded.id,
            uid: req.params.uid,
          },
        }
      );
      const [blogContent] = await blogContentModel.getByFilter({
        filter: { uid: req.params.uid },
      });
      return res.status(200).json({
        statusCode: 200,
        message: "Success!",
        result: blogContent,
      });
    } catch (err) {
      return res.status(500).json({
        statusCode: 500,
        message: err,
      });
    }
  },
  deleteCategory: async (req: Request, res: Response) => {
    try {
      const token = req.cookies.token;

      const decoded: any = await promisify(jwt.verify)(
        token,
        process.env.SECRET_KEY ?? ""
      );
      const blogContentModel = new BlogCategory();
      await blogContentModel.update(
        {
          deleted_at: new Date()
            .toISOString()
            .replace("T", " ")
            .replace("Z", "")
            .slice(0, 19),
        },
        {
          filter: {
            uid: req.params.uid,
            created_by_user_id: decoded.id,
          },
        }
      );
      return res.status(200).json({
        statusCode: 200,
        message: "Success!",
      });
    } catch (err) {
      return res.status(500).json({
        statusCode: 500,
        message: err,
      });
    }
  },
  listTag: async (req: Request, res: Response) => {
    try {
      const token = req.cookies.token;

      const decoded: any = await promisify(jwt.verify)(
        token,
        process.env.SECRET_KEY ?? ""
      );

      let filter = {};
      let pagination = {};
      let show: any[] = [];
      const query = convertToObj(req.query);

      if (!!query.page) {
        pagination = { ...pagination, page: query.page };
      }

      if (!!query.sort) {
        pagination = { ...pagination, sort: query.sort };
      }
      if (!!query.filter) {
        filter = { ...filter, ...(query.filter as any) };
      }
      if (!!query.show) {
        show = [...show, ...(query.show as any)];
      }
      const blogContentModel = new BlogTag();
      const blogContents = await blogContentModel.getByFilter({
        filter: {
          created_by_user_id: decoded.id,
          deleted_at: "null",
          ...filter,
        },
        pagination,
        join: [{ name: "created_by", show: ["name"] }],
        show,
      });
      const [[blogContentTotal]] = await blogContentModel.countByFilter({
        filter: {
          created_by_user_id: decoded.id,
          deleted_at: "null",
          ...filter,
        },
      });
      return res.status(200).json({
        statusCode: 200,
        message: "Success!",
        result: {
          data: blogContents,
          total: blogContentTotal.total,
        },
      });
    } catch (err: any) {
      return res.status(500).json({
        statusCode: 500,
        message: err.message,
      });
    }
  },
  createTag: async (req: Request, res: Response) => {
    try {
      const token = req.cookies.token;

      const decoded: any = await promisify(jwt.verify)(
        token,
        process.env.SECRET_KEY ?? ""
      );
      const uid = uuidv4();
      const rules = {
        name: {
          label: "Name",
          rule: {
            required: true,
          },
        },
      };

      const validate = await Validator.make(req.body, rules);
      if (validate.fails()) {
        return res.status(400).json({
          statusCode: 400,
          message: "Bad request!",
          error: validate.getMessages(),
        });
      }

      const blogContentModel = new BlogTag();
      await blogContentModel.store({
        name: req.body.name,
        created_by_user_id: decoded.id,
        uid,
      });
      const [blogContent] = await blogContentModel.getByFilter({
        filter: { uid },
      });
      return res.status(200).json({
        statusCode: 200,
        message: "Success!",
        result: blogContent,
      });
    } catch (err) {
      return res.status(500).json({
        statusCode: 500,
        message: err,
      });
    }
  },
  updateTag: async (req: Request, res: Response) => {
    try {
      const token = req.cookies.token;

      const decoded: any = await promisify(jwt.verify)(
        token,
        process.env.SECRET_KEY ?? ""
      );
      const rules = {
        name: {
          label: "Name",
          rule: {
            required: true,
          },
        },
      };

      const validate = await Validator.make(req.body, rules);
      if (validate.fails()) {
        return res.status(400).json({
          statusCode: 400,
          message: "Bad request!",
          error: validate.getMessages(),
        });
      }

      const blogContentModel = new BlogTag();
      await blogContentModel.update(
        {
          name: req.body.name,
        },
        {
          filter: {
            created_by_user_id: decoded.id,
            uid: req.params.uid,
          },
        }
      );
      const [blogContent] = await blogContentModel.getByFilter({
        filter: { uid: req.params.uid },
      });
      return res.status(200).json({
        statusCode: 200,
        message: "Success!",
        result: blogContent,
      });
    } catch (err) {
      return res.status(500).json({
        statusCode: 500,
        message: err,
      });
    }
  },
  deleteTag: async (req: Request, res: Response) => {
    try {
      const token = req.cookies.token;

      const decoded: any = await promisify(jwt.verify)(
        token,
        process.env.SECRET_KEY ?? ""
      );
      const blogContentModel = new BlogTag();
      await blogContentModel.update(
        {
          deleted_at: new Date()
            .toISOString()
            .replace("T", " ")
            .replace("Z", "")
            .slice(0, 19),
        },
        {
          filter: {
            uid: req.params.uid,
            created_by_user_id: decoded.id,
          },
        }
      );
      return res.status(200).json({
        statusCode: 200,
        message: "Success!",
      });
    } catch (err) {
      return res.status(500).json({
        statusCode: 500,
        message: err,
      });
    }
  },
};

export default blogController;
