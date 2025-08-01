import Model, { IRelation } from "@app/helper/Model";

class BlogTag extends Model{
    database = "webivert_app";
    dialect:"pgsql"|"mysql" = "pgsql";
    table = "blog_tags";
    relations: IRelation = {
        created_by: {
            type: "belongsTo",
            relatedTo: {
                database: "webivert_app",
                dialect: "pgsql",
                table: "users",
                foreignKey: "created_by_user_id",
                localKey: "id"
            }
        },
    }
}

export default BlogTag;

