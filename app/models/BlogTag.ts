import Model, { IRelation } from "@app/helper/Model";

class BlogTag extends Model{
    database = "webivert_app";
    table = "blog_tags";
    relations: IRelation = {
        created_by: {
            type: "belongsTo",
            relatedTo: {
                database: "webivert_app",
                table: "users",
                foreignKey: "created_by_user_id",
                localKey: "id"
            }
        },
    }
}

export default BlogTag;

