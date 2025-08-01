import Model from "@app/helper/Model";

class User extends Model{
    database = "webivert_app";
    dialect:"pgsql"|"mysql" = "pgsql";
    table = "users";
}

export default User;

