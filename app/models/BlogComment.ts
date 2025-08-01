import Model, { IRelation } from "@app/helper/Model";

class BlogComment extends Model {
  database = "webivert_app";
  dialect:"pgsql"|"mysql" = "pgsql";
  table = "blog_comments";
  relations: IRelation = {
    comment: {
      type: "belongsTo",
      relatedTo: {
        database: "webivert_app",
                dialect: "pgsql",
        table: "blog_comments",
        foreignKey: "blog_comment_id",
        localKey: "id",
      },
    },
    content: {
      type: "belongsTo",
      relatedTo: {
        database: "webivert_app",
                dialect: "pgsql",
        table: "blog_contents",
        foreignKey: "blog_content_id",
        localKey: "id",
        columns:[['title'],['uid']],
        relations: {
          author: {
            type: "belongsTo",
            relatedTo: {
              database: "webivert_app",
                dialect: "pgsql",
              table: "users",
              foreignKey: "created_by_user_id",
              localKey: "id",
              columns:[['name']],
            },
          },
        },
      },
    },
    created_by: {
      type: "belongsTo",
      relatedTo: {
        database: "webivert_app",
                dialect: "pgsql",
        table: "users",
        foreignKey: "created_by_user_id",
        localKey: "id",
      },
    },
  };
}

export default BlogComment;
