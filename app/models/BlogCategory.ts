import Model, { IRelation } from "@app/helper/Model";

class BlogCategory extends Model{
    database = "webivert_app";
    table = "blog_categories";
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
        content: {
            type: "hasMany",
            relatedTo: {
                database: "webivert_app",
                table: "blog_contents",
                foreignKey: "blog_category_id",
                localKey: "id"
            }
        },
    }
}

export default BlogCategory;

