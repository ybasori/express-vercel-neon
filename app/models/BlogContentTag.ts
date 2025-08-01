import Model, { IRelation } from "@app/helper/Model";

class BlogContentTag extends Model{
    database = "webivert_app";
    dialect:"pgsql"|"mysql" = "pgsql";
    table = "blog_content_tags";
    relations: IRelation = {
        content: {
            type: "belongsTo",
            relatedTo: {
                database: "webivert_app",
                dialect: "pgsql",
                table: "blog_contents",
                foreignKey: "blog_content_id",
                localKey: "id"
            }
        },
        tag: {
            type: "belongsTo",
            relatedTo: {
                database: "webivert_app",
                dialect: "pgsql",
                table: "blog_tags",
                foreignKey: "blog_tag_id",
                localKey: "id"
            }
        },
    }
}

export default BlogContentTag;

