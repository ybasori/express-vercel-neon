import dbs from "@app/config/db";
import pg from "pg";

type IRuleCustom = (config: {
  setMessage: (value: string) => boolean;
  value: string | number;
  label: string;
}) => Promise<boolean> | boolean;

type IRule = {
  required?: boolean;
  number?: boolean;
  email?: boolean;
  unique?: string;
  equalsTo?: string;
  customWithRegex?: {
    regex: string;
    message: string;
  };
  custom?: IRuleCustom;
};

type IRuleItem = {
  label: string;
  rule: IRule;
};

export type IRules = {
  [key: string]: IRuleItem;
};

type IBodyValue = string | number;

type IBody = {
  [key: string]: IBodyValue;
};

type IErrMsg = {
  [key: string]: string[];
};
// type IValidator = {
//   make: (
//     body: IBody,
//     rules: IRules
//   ) => Promise<{
//     fails: () => boolean;
//     getMessages: () => IErrMsg;
//   }>;
// };

// type IUniqueness = (
//   model: keyof typeof models,
//   column: keyof IBody,
//   value: IBodyValue,
//   ignoreId: string | null,
//   ignoreIdColumn: string | null
// ) => Promise<any>;

const uniqueness = async function (
  db: string,
  table: string,
  column: string,
  value: IBodyValue,
  ignoreId?: string | null,
  ignoreIdColumn?: string | null
) {
  //   var modelnya = models[model];
  //   var query = {
  //     where: {},
  //   };
  //   query.where[column] = value;
  //   if (ignoreId != null && ignoreIdColumn != null) {
  //     query.where[ignoreIdColumn] = {
  //       [Op.ne]: ignoreId,
  //     };
  //   }

  //   return modelnya.findAll(query);
  let algo = "";
  if (ignoreId != null && ignoreIdColumn != null) {
    algo = algo + " AND " + ignoreIdColumn + ' != "' + ignoreId + '"';
  }

  const d = dbs[db as keyof typeof dbs];

  if(d instanceof pg.Pool){
    const {rows: result} = await d.query(
      "select * from " +
        table +
        " where " +
        column +
        '="' +
        value +
        '" ' +
        algo +
        " limit 1"
    );

    return result as unknown[] as any[];
  }
  const [result] = await d.query(
    "select * from " +
      table +
      " where " +
      column +
      '="' +
      value +
      '" ' +
      algo +
      " limit 1"
  );

  return result as unknown[] as any[];

};

const Validator = {
  make: async function (body: IBody, rules: IRules) {
    let error = 0;
    let err_msg: IErrMsg = {};
    for (const key in rules) {
      const rule = rules[key as keyof typeof rules];
      const label =
        rule.label == null || rule.label === undefined || rule.label === ""
          ? key
          : rule.label;

      let noRule = 0;
      for (const keyRule in rule.rule) {
        if (keyRule === "required") {
          if (rule.rule[keyRule]) {
            if (
              typeof body[key] === "undefined" ||
              body[key] == null ||
              body[key] === undefined ||
              body[key] === ""
            ) {
              if (noRule === 0) {
                err_msg = { ...err_msg, [key]: [] };
              }
              err_msg = {
                ...err_msg,
                [key]: [...err_msg[key], `${label} is required.`],
              };
              noRule++;
              error++;
            }
          } else {
            continue;
          }
        } else if (keyRule === "unique") {
          if (rule.rule[keyRule] !== undefined) {
            const uniqueRule = rule.rule[keyRule].split(".");
            const db = uniqueRule[0];
            const table = uniqueRule[1];
            const column = uniqueRule[2];
            let ignoreId = null;
            let ignoreIdColumn = "id";
            if (uniqueRule[3] !== undefined) {
              ignoreId = uniqueRule[3];
            }
            if (uniqueRule[4] !== undefined) {
              ignoreIdColumn = uniqueRule[4];
            }
            const bodyKey = body[key];
            await uniqueness(
              db,
              table,
              column,
              bodyKey,
              ignoreId,
              ignoreIdColumn
            ).then(function (res) {
              if (res[0][0]) {
                if (noRule === 0) {
                  err_msg[key] = [];
                }
                err_msg[key].push(`${label} is already in use.`);
                noRule++;
                error++;
              }
            });
          } else {
            continue;
          }
        } else if (keyRule === "email") {
          if (rule.rule[keyRule]) {
            const re =
              /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            if (
              typeof body[key] !== "undefined" &&
              !re.test(body[key].toString().toLowerCase().trim())
            ) {
              if (noRule === 0) {
                err_msg[key] = [];
              }
              err_msg[key].push(`${label} is invalid.`);
              noRule++;
              error++;
            }
          }
        } else if (keyRule === "equalsTo") {
          if (rule.rule[keyRule]) {
            const value2 = body[rule.rule[keyRule]];

            const key2 = rule.rule[keyRule];

            const label2 =
              rules[key2].label == null ||
              rules[key2].label === undefined ||
              rules[key2].label === ""
                ? key2
                : rules[key2].label;

            if (body[key] !== value2) {
              if (noRule === 0) {
                err_msg[key] = [];
              }

              err_msg[key].push(`${label} must be match to ${label2}.`);
              noRule++;
              error++;
            }
          }
        } else if (keyRule === "customWithRegex") {
          if (
            !!rule.rule[keyRule]?.regex &&
            typeof rule.rule[keyRule]?.message !== "undefined"
          ) {
            const re = eval("/" + rule.rule[keyRule].regex + "/i");

            if (!re.test(body[key].toString().trim())) {
              if (noRule === 0) {
                err_msg[key] = [];
              }
              const new_message = rule.rule[keyRule].message.replace("%s", label);
              err_msg[key].push(new_message);
              noRule++;
              error++;
            }
          }
        } else if (keyRule === "custom") {
          if (!!rule.rule[keyRule]) {
            let new_message = "";
            const setMessage = (value: any) => {
              new_message = value;
              return false;
            };

            const result = await rule.rule[keyRule]({
              setMessage,
              value: body[key],
              label,
            });

            if (!result) {
              if (noRule === 0) {
                err_msg[key] = [];
              }
              err_msg[key].push(new_message);
              noRule++;
              error++;
            }
          }
        } else if (keyRule === "number") {
          if (!!rule.rule[keyRule]) {
            if (isNaN(body[key] as number)) {
              if (noRule === 0) {
                err_msg[key] = [];
              }
              err_msg[key].push(`${label} is not a number.`);
              noRule++;
              error++;
            }
          }
        } else {
          continue;
        }
      }
    }
    return {
      fails: function () {
        if (error > 0) {
          return true;
        } else {
          return false;
        }
      },
      getMessages: function () {
        return err_msg;
      },
    };
  },
};
export default Validator;
