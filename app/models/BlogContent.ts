import Model, { IRelation } from "@app/helper/Model";

class BlogContent extends Model{
    database = "webivert_app";
    dialect:"pgsql"|"mysql" = "pgsql";
    table = "blog_contents";
    relations: IRelation = {
        category: {
            type: "belongsTo",
            relatedTo: {
                database: "webivert_app",
                dialect: "pgsql",
                table: "blog_categories",
                foreignKey: "blog_category_id",
                localKey: "id",
                columns:[['name'],['uid']]
            }
        },
        content_tag: {
            type: "hasMany",
            relatedTo: {
                database: "webivert_app",
                dialect: "pgsql",
                table: "blog_content_tags",
                foreignKey: "blog_content_id",
                localKey: "id",
                relations: {
                    tag: {
                        type: "belongsTo",
                        relatedTo: {
                            database: "webivert_app",
                dialect: "pgsql",
                            table: "blog_tags",
                            foreignKey: "blog_tag_id",
                            localKey: "id",
                            columns:[['name'],['uid']]
                        }
                    }
                }
            }
        },
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

export default BlogContent;

