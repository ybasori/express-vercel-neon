import dbs from "@app/config/db";
import mysql from "mysql2/promise";
import pg from "pg";

interface IFilter {
  [x: string]: any;
}

interface IPage {
  of: string | number;
  size: string | number;
}

interface ISort {
  by: string;
  order: "asc" | "desc";
}

export interface IPagination {
  page?: IPage;
  sort?: ISort[];
}

interface IJoin {
  name: string;
  joinType?: "leftJoin" | "rightJoin" | "join";
  filter?: IFilter;
  join?: (IJoin | string)[];
  show?: string[];
  pagination?: IPagination;
}

export interface IRelation {
  [field: string]: {
    type: "belongsTo" | "hasMany" | "hasOne";
    relatedTo: {
      database: string;
      dialect: "pgsql" | "mysql";
      table: string;
      localKey: string;
      foreignKey: string;
      relations?: IRelation | null;
      columns?: string[][];
    };
  };
}

/**
 * @typedef {Object<string, {
 * name: string,
 * type: "hasMany"|"hasOne"|"belongsTo",
 * relatedTo:{
 * database: string,
 * table: string,
 * localKey: string,
 * foreignKey: string,
 * relations?: IRelation}
 * }>} IRelation
 */

class Model {
  /**
   * @property {string} database
   * @property {"pgsql" | "mysql"} dialect
   * @property {string} table
   * @property {IRelation} [relations]
   */
  database?: string;
  dialect: "pgsql" | "mysql" = "mysql";
  table?: string;
  relations: IRelation | null = null;

  /**
   *
   * @param {Object<string, {not: string, in: string[]}|string>} filter
   * @description the outer object is based on field or column of a table
   * @property {string} not - Represents the exclusion condition
   * @property {string[]} in - it can be more than one value
   * @returns {string[]}
   */
  filterQuery(
    {
      filter,
      table,
      dialect,
    }: { filter: IFilter; table: string; dialect: "pgsql" | "mysql" },
    debug?: any
  ): string[] {
    if (!!filter) {
      if (!!debug) {
        console.log(filter);
      }

      const queries = Object.keys(filter)
        .filter((item) => {
          const arrkey = item.split("_");
          return arrkey[0] === "join" ||
            arrkey[0] === "leftjoin" ||
            arrkey[0] === "rightjoin"
            ? false
            : true;
        })
        .filter((key) => {
          let filterValue = filter[key];

          let checking = true;
          let empty = false;

          while (checking === true) {
            if (typeof filterValue === "object") {
              if (Array.isArray(filterValue)) {
                if (filterValue.length === 0) {
                  empty = true;
                  checking = false;
                } else {
                  checking = false;
                }
              } else {
                filterValue = filterValue["not"] ?? filterValue["in"];
              }
            } else {
              checking = false;
            }
          }

          return !empty;
        })
        .map((key) => {
          let filterValue = filter[key];

          let not = false;
          let in_query = false;
          if (!!filterValue?.["not"]) {
            not = true;
            filterValue = filterValue["not"];
          }
          if (!!filterValue["in"]) {
            in_query = true;
            filterValue = `(${filterValue["in"]
              .map((item: any) => `'${item}'`)
              .join(", ")})`;
          }

          if (filterValue === "null") {
            if (not) {
              return `${table}.${key} IS NOT NULL`;
            }

            return `${table}.${key} IS NULL`;
          }

          if (in_query) {
            if (not) {
              return `${table}.${key} NOT IN ${filterValue}`;
            }
            return `${table}.${key} IN ${filterValue}`;
          }

          if (dialect === "mysql") {
            // mysql
            if (not) {
              return `${table}.${key} NOT LIKE '${filterValue}'`;
            }

            return `${table}.${key} LIKE '${filterValue}'`;
          }

          if (dialect === "pgsql") {
            // pgsql
            if (not) {
              return `${table}.${key}::text NOT ILIKE '${filterValue}'`;
            }

            return `${table}.${key}::text ILIKE '${filterValue}'`;
          }

          return "";
        });

      return queries;
    }

    return [];
  }

  /**
   *
   * @param {Object} pagination - Pagination
   * @param {Object} pagination.page - Page
   * @param {number} pagination.page.of - The current page number.
   * @param {number} pagination.page.size - The number of items per page.
   * @returns {string}
   */
  paginationQuery(pagination?: IPagination): string {
    if (
      !!pagination &&
      !!pagination.page &&
      !!pagination.page.of &&
      !!pagination.page.size
    ) {
      const offset =
        (Number(pagination.page.of) - 1) * Number(pagination.page.size);

      return `LIMIT ${pagination.page.size} OFFSET ${offset}`;
    }

    return "";
  }
  /**
   *
   * @param {Object} pagination
   * @param {Object[]} pagination.sort
   * @param {string} pagination.sort[].by
   * @param {"asc"|"desc"} pagination.sort[].order
   * @returns {string}
   */
  sortQuery(pagination?: IPagination): string {
    if (!!pagination && !!pagination.sort) {
      const queries = pagination.sort
        .filter((item) => {
          if (!!item.by && !!item.order) {
            return true;
          }
          return false;
        })
        .map((sort) => {
          return `${sort.by} ${sort.order}`;
        });

      if (queries.length > 0) {
        return `ORDER BY ${queries.join(", ")}`;
      }

      return "";
    }

    return "";
  }

  joinSqlQuery(
    {
      joinArr,
      relationObj,
      parentTable,
    }: { joinArr: IJoin[]; relationObj: IRelation | null; parentTable: string },
    debug?: string
  ) {
    let sqlJoin = "";

    for (let i = 0; i < joinArr.length; i++) {
      const name = joinArr[i].name;
      const joinType = joinArr[i].joinType;
      const aliasTable = (joinType ?? "").toLowerCase() + "_" + name;
      if (!!relationObj && relationObj[joinArr[i].name].type === "belongsTo") {
        sqlJoin =
          sqlJoin +
          " " +
          (joinType === "leftJoin"
            ? "LEFT JOIN"
            : joinType === "rightJoin"
            ? "RIGHT JOIN"
            : "JOIN") +
          " " +
          relationObj[name].relatedTo.table +
          " AS " +
          aliasTable +
          " ON " +
          aliasTable +
          "." +
          relationObj[name].relatedTo.localKey +
          " = " +
          parentTable +
          "." +
          relationObj[name].relatedTo.foreignKey;
      }
      if (!!relationObj && relationObj[name].type === "hasMany") {
        sqlJoin =
          sqlJoin +
          " " +
          (joinType === "leftJoin"
            ? "LEFT JOIN"
            : joinType === "rightJoin"
            ? "RIGHT JOIN"
            : "JOIN") +
          " " +
          relationObj[name].relatedTo.table +
          " AS " +
          aliasTable +
          " ON " +
          aliasTable +
          "." +
          relationObj[name].relatedTo.foreignKey +
          " = " +
          parentTable +
          "." +
          relationObj[name].relatedTo.localKey;
      }
      if (!!relationObj && relationObj[name].type === "hasOne") {
        sqlJoin =
          sqlJoin +
          " " +
          (joinType === "leftJoin"
            ? "LEFT JOIN"
            : joinType === "rightJoin"
            ? "RIGHT JOIN"
            : "JOIN") +
          " " +
          relationObj[name].relatedTo.table +
          " AS " +
          aliasTable +
          " ON " +
          aliasTable +
          "." +
          relationObj[name].relatedTo.foreignKey +
          " = " +
          parentTable +
          "." +
          relationObj[name].relatedTo.localKey;
      }

      if (!!joinArr[i].join) {
        sqlJoin =
          sqlJoin +
          " " +
          this.joinSqlQuery({
            joinArr: joinArr[i].join as IJoin[],
            relationObj: relationObj?.[name].relatedTo.relations ?? null,
            parentTable: aliasTable,
          });
      }
    }

    return sqlJoin;
  }

  joinColumnSqlQuery(joinArr: IJoin[], relationObj: IRelation | null): string {
    let sqlJoin = "";

    for (let i = 0; i < joinArr.length; i++) {
      const name = joinArr[i].name;
      const joinType = joinArr[i].joinType;
      const aliasTable = (joinType ?? "").toLowerCase() + "_" + name;
      if (!!relationObj && !!relationObj[name].relatedTo.columns) {
        for (let j = 0; j < relationObj[name].relatedTo.columns.length; j++) {
          if (relationObj[name].relatedTo.columns[j].length === 1) {
            sqlJoin =
              sqlJoin +
              aliasTable +
              "." +
              relationObj[name].relatedTo.columns[j][0] +
              " AS " +
              joinType +
              "_" +
              name +
              "_" +
              relationObj[name].relatedTo.columns[j][0] +
              (i !== joinArr.length - 1
                ? ", "
                : j !== relationObj[name].relatedTo.columns.length - 1
                ? ", "
                : "");
          }
          if (relationObj[name].relatedTo.columns[j].length === 2) {
            sqlJoin =
              sqlJoin +
              aliasTable +
              "." +
              relationObj[name].relatedTo.columns[j][0] +
              " AS " +
              joinType +
              "_" +
              name +
              "_" +
              relationObj[name].relatedTo.columns[j][1] +
              (i !== joinArr.length - 1
                ? ", "
                : j !== relationObj[name].relatedTo.columns.length - 1
                ? ", "
                : "");
          }
        }
      }
      if (!!joinArr[i].join) {
        sqlJoin =
          sqlJoin +
          this.joinColumnSqlQuery(
            joinArr[i].join as IJoin[],
            relationObj?.[name].relatedTo.relations ?? null
            // aliasTable
          );
      }
    }

    return sqlJoin !== "" ? ", " + sqlJoin : "";
  }

  joinFilterSqlQuery(
    {
      joinArr,
      relationObj,
      dialect,
    }: {
      joinArr: IJoin[];
      relationObj: IRelation | null;
      dialect: "pgsql" | "mysql";
    },
    debug?: string
  ): // parentTable: string
  string[] {
    if (!!debug) {
      console.log("=======", debug, joinArr, relationObj, dialect);
    }
    let filterQuery: string[] = [];

    for (let i = 0; i < joinArr.length; i++) {
      const name = joinArr[i].name;
      const joinType = joinArr[i].joinType;
      const aliasTable = (joinType ?? "").toLowerCase() + "_" + name;
      if (!!relationObj) {
        filterQuery = [
          ...filterQuery,
          ...this.filterQuery({
            filter: joinArr[i].filter ?? [],
            table: aliasTable,
            dialect,
          }),
        ];
      }
    }

    return filterQuery;
  }

  /**
   * @typedef {object} IFilter
   * @property {string} not
   * @property {string[]} in
   */

  /**
   * @typedef {string[] | {
   * name:string,
   * join: IJoin,
   * joinType: "leftJoin"|"rightJoin"|"orm"
   * filter: {
   * [key: string]: IFilter | string
   * } }[]} IJoin
   */

  /**
   *
   * @param {Object} config
   * @param {string} [config.db]
   * @param {string} [config.table]
   * @param {{[key: string]: IFilter | string}} [config.filter]
   * @param {Object} [config.pagination]
   * @param {Object[]} [config.pagination.sort]
   * @param {string} config.pagination.sort[].by
   * @param {"asc"|"desc"} config.pagination.sort[].order
   * @param {Object} [config.pagination.page] - Page
   * @param {number} config.pagination.page.of - The current page number.
   * @param {number} config.pagination.page.size - The number of items per page.
   * @param {IJoin} [config.join]
   * @param {IRelation} [config.relations]
   * @returns
   */

  getByFilter(
    {
      db: alternativeDb,
      dialect: alternativeDialect,
      table: alternativeTable,
      filter,
      pagination,
      join = [],
      relations: alternativeRelations = null,
      show = [],
    }: {
      db?: string;
      dialect?: "pgsql" | "mysql";
      table?: string;
      filter: IFilter;
      pagination?: IPagination;
      join?: (IJoin | string)[];
      relations?: IRelation | null;
      show?: string[];
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    debug?: any
  ): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const dbi = !!alternativeDb
          ? alternativeDb
          : !!this.database
          ? this.database
          : "";
        const db = dbs[dbi as keyof typeof dbs];

        const filterQuery = this.filterQuery({
          filter: { ...filter },
          table: !!alternativeTable ? alternativeTable : this.table ?? "",
          dialect: !!alternativeDialect
            ? alternativeDialect
            : !!this.dialect
            ? this.dialect
            : "mysql",
        });
        const sortQuery = this.sortQuery(pagination);
        const paginationQuery = this.paginationQuery(pagination);

        const take_join_from_filter = Object.entries(filter)
          .filter(
            ([key]) =>
              key.startsWith("join_") ||
              key.startsWith("leftjoin_") ||
              key.startsWith("rightjoin_")
          )
          .map(([key, value]) => {
            const joinType = key.split("_")[0];
            return {
              name: key
                .replace(/^(leftjoin_|rightjoin_|join_)/, "")
                .split("_")[0],
              joinType:
                joinType === "leftjoin"
                  ? "leftJoin"
                  : joinType === "rightjoin"
                  ? "rightJoin"
                  : "join",
              filter: {
                [key
                  .replace(/^(leftjoin_|rightjoin_|join_)/, "")
                  .split("_")[1]]: value,
              },
            };
          });

        const joinSql = join.filter(
          (item) =>
            typeof item !== "string" &&
            (item.joinType === "rightJoin" ||
              item.joinType === "leftJoin" ||
              item.joinType === "join")
        ) as unknown as IJoin[];

        const combineJoinSql = [...joinSql, ...take_join_from_filter]
          .map((item, i, self) => {
            const nice = self.filter(
              (s) => s.name === item.name && s.joinType === item.joinType
            );

            let newItem = { ...item };

            nice.forEach((s) => {
              newItem = {
                ...newItem,
                filter: { ...newItem.filter, ...s.filter },
              };
            });

            return newItem;
          })
          .filter(
            (item, i, self) =>
              self.findIndex(
                (j) => j.name === item.name && j.joinType === item.joinType
              ) === i
          );

        const joinQuery = this.joinSqlQuery({
          joinArr: joinSql,
          relationObj: !!alternativeRelations
            ? alternativeRelations
            : this.relations,
          parentTable: !!alternativeTable ? alternativeTable : this.table ?? "",
        });
        const selectJoinQuery = this.joinColumnSqlQuery(
          joinSql,
          !!alternativeRelations ? alternativeRelations : this.relations
        );
        // selectJoinQuery = (selectJoinQuery!==""?",":"") + selectJoinQuery;
        const filterJoinQuery = this.joinFilterSqlQuery(
          {
            joinArr: combineJoinSql as IJoin[],
            relationObj: !!alternativeRelations
              ? alternativeRelations
              : this.relations,
            dialect: !!alternativeDialect
              ? alternativeDialect
              : !!this.dialect
              ? this.dialect
              : "mysql",
          }
          // !!alternativeTable ? alternativeTable : (this.table ?? "")
        );

        const query = `SELECT ${
          !!alternativeTable ? alternativeTable : this.table
        }.* ${selectJoinQuery} FROM ${
          !!alternativeTable ? alternativeTable : this.table
        } ${joinQuery} ${
          [...filterQuery, ...filterJoinQuery].length > 0 ? "WHERE" : ""
        } ${[...filterQuery, ...filterJoinQuery].join(
          " AND "
        )} ${sortQuery} ${paginationQuery}`;

        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}]\x1b[38;2;255;165;0m[SQL]\x1b[0m ${query}`);
        console.log(``);

        let mainResult;

        if (
          (!!alternativeDialect
            ? alternativeDialect
            : !!this.dialect
            ? this.dialect
            : "mysql") === "mysql"
        ) {
          // mysql
          [mainResult] = await (db as mysql.Pool).query(query);
        }
        if (
          (!!alternativeDialect
            ? alternativeDialect
            : !!this.dialect
            ? this.dialect
            : "mysql") === "pgsql"
        ) {
          // pgsql
          const result = await (db as pg.Pool).query(query);
          mainResult = result.rows;
        }

        let joinedResult = [...(mainResult as unknown[] as any[])];

        if (!!join && joinedResult.length > 0) {
          const relations = !!alternativeRelations
            ? alternativeRelations
            : this.relations;

          const joinResult: any[] = await Promise.all(
            join.map((el) => {
              let joinName = "";
              let joinJoin: IJoin[] = [];
              let joinFilter = {};
              if (typeof el === "string") {
                joinName = el;
              } else {
                joinName = el.name;
                joinJoin = el.join as IJoin[];
                joinFilter = el.filter ?? {};
              }

              if (
                ((typeof el !== "string" &&
                  ["rightJoin", "leftJoin", "join"].indexOf(
                    el.joinType as any
                  ) < 0) ||
                  typeof el === "string") &&
                !!relations &&
                relations[joinName].type === "hasOne"
              ) {
                return this.getByFilter({
                  db: relations[joinName].relatedTo.database,
                  table: relations[joinName].relatedTo.table,
                  filter: {
                    ...joinFilter,
                    [relations[joinName].relatedTo.foreignKey]: {
                      in: joinedResult
                        .filter(
                          (a) => !!a[relations[joinName].relatedTo.localKey]
                        )
                        .filter((a, i, s) => s.findIndex((z) => a === z) === i)
                        .map((a) => a[relations[joinName].relatedTo.localKey])
                        .filter((a, i, s) => s.findIndex((z) => a === z) === i),
                    },
                  },
                  join: joinJoin,
                  relations: !!relations[joinName].relatedTo.relations
                    ? relations[joinName].relatedTo.relations
                    : null,
                });
              }
              if (
                ((typeof el !== "string" &&
                  ["rightJoin", "leftJoin", "join"].indexOf(
                    el.joinType as any
                  ) < 0) ||
                  typeof el === "string") &&
                !!relations &&
                relations[joinName].type === "belongsTo"
              ) {
                return this.getByFilter({
                  db: relations[joinName].relatedTo.database,
                  table: relations[joinName].relatedTo.table,
                  filter: {
                    ...joinFilter,
                    [relations[joinName].relatedTo.localKey]: {
                      in: joinedResult
                        .filter(
                          (a) => !!a[relations[joinName].relatedTo.foreignKey]
                        )
                        .map((a) => a[relations[joinName].relatedTo.foreignKey])
                        .filter((a, i, s) => s.findIndex((z) => a === z) === i),
                    },
                  },
                  join: joinJoin,
                  relations: !!relations[joinName].relatedTo.relations
                    ? relations[joinName].relatedTo.relations
                    : null,
                });
              }
              return new Promise((resolve) => resolve([]));
            })
          );

          joinedResult = [
            ...joinedResult.map((item) => {
              let dt = { ...item };
              join.forEach((el, index) => {
                let joinName = "";
                if (typeof el === "string") {
                  joinName = el;
                } else {
                  joinName = el.name;
                }
                if (!!relations && relations[joinName].type === "hasOne") {
                  const [relateDt] = [
                    ...joinResult[index].filter(
                      (b: { [x: string]: any }) =>
                        b[relations[joinName].relatedTo.foreignKey] ===
                        item[relations[joinName].relatedTo.localKey]
                    ),
                  ];
                  dt = { ...dt, [joinName]: relateDt };
                }
                if (!!relations && relations[joinName].type === "belongsTo") {
                  const [relateDt] = [
                    ...(joinResult[index] ?? []).filter(
                      (b: { [x: string]: any }) =>
                        b[relations[joinName].relatedTo.localKey] ===
                        item[relations[joinName].relatedTo.foreignKey]
                    ),
                  ];
                  dt = { ...dt, [joinName]: relateDt };
                }
              });

              return dt;
            }),
          ];

          for (let z = 0; z < joinedResult.length; z++) {
            const item = joinedResult[z];
            const getAllData = await Promise.all([
              ...join.map((el) => {
                let joinName = "";
                let joinFilter = {};
                let joinPagination = undefined;
                let joinJoin: IJoin[] = [];
                if (typeof el === "string") {
                  joinName = el;
                } else {
                  joinName = el.name;
                  joinFilter = el.filter ?? {};
                  joinPagination = el.pagination ?? {};
                  joinJoin = el.join as IJoin[];
                }
                if (!!relations && relations[joinName].type === "hasMany") {
                  return this.getByFilter({
                    db: relations[joinName].relatedTo.database,
                    table: relations[joinName].relatedTo.table,
                    filter: {
                      [relations[joinName].relatedTo.foreignKey]:
                        item[relations[joinName].relatedTo.localKey],
                      ...joinFilter,
                    },
                    join: joinJoin,
                    relations: !!relations[joinName].relatedTo.relations
                      ? relations[joinName].relatedTo.relations
                      : null,
                    pagination: joinPagination,
                  });
                }
                return new Promise((resolve) => resolve([]));
              }),
            ]);
            const countAllData = await Promise.all([
              ...join.map((el) => {
                let joinName = "";
                let joinFilter = {};
                if (typeof el === "string") {
                  joinName = el;
                } else {
                  joinName = el.name;
                  joinFilter = el.filter ?? {};
                }
                if (!!relations && relations[joinName].type === "hasMany") {
                  return this.countByFilter({
                    db: relations[joinName].relatedTo.database,
                    table: relations[joinName].relatedTo.table,
                    dialect: relations[joinName].relatedTo.dialect,
                    filter: {
                      [relations[joinName].relatedTo.foreignKey]:
                        item[relations[joinName].relatedTo.localKey],
                      ...joinFilter,
                    },
                  });
                }
                return new Promise((resolve) => resolve([]));
              }),
            ]);

            join.forEach((j, index) => {
              const joinName = typeof j === "string" ? j : j.name;

              if (!!relations && relations[joinName].type === "hasMany") {
                const data = getAllData[index];
                const total = countAllData[index];
                joinedResult[z][joinName] = { ...item[joinName], data, total };
              }
            });
          }
        }

        let jr = [...joinedResult];

        const removeUnshowed = (
          data: any,
          joinShow: string[],
          joinRowStr: string[],
          subjoin: (string | IJoin)[]
        ) => {
          if (!!data) {
            Object.keys(data).forEach((key) => {
              if (
                joinShow.length > 0 &&
                !joinShow.includes(key) &&
                !joinRowStr.includes(key)
              ) {
                delete data[key];
              } else {
                if (typeof data === "object") {
                  removeUnshowedNested(data, key, subjoin);
                }
              }
            });
          }
          return data;
        };

        const removeUnshowedNested = (
          item: any,
          field: string,
          subjoin: (string | IJoin)[]
        ) => {
          const joinRow = subjoin
            .filter((j) => typeof j !== "string")
            .find((joinItem) => joinItem.name === field);

          if (joinRow) {
            const joinShow = joinRow.show ?? [];
            const joinRowStr = (joinRow.join ?? []).map((j) =>
              typeof j !== "string" ? j.name : j
            );

            if (Array.isArray(item[field])) {
              item[field] = item[field].map((subitem) =>
                removeUnshowed(
                  subitem,
                  joinShow,
                  joinRowStr,
                  joinRow.join ?? []
                )
              );
            } else {
              item[field] = removeUnshowed(
                item[field],
                joinShow,
                joinRowStr,
                joinRow.join ?? []
              );
            }
          }

          return item;
        };

        const mj = join.map((item) => {
          if (typeof item !== "string") {
            return item.name;
          }

          return item;
        });

        if (!!debug) {
          console.log("==========", debug, joinedResult);
        }

        jr = (joinedResult as any[]).map((item) => {
          Object.keys(item).forEach((field) => {
            if (
              show.length > 0 &&
              !show.includes(field) &&
              !mj.includes(field)
            ) {
              delete item[field];
            } else {
              if (typeof item === "object") {
                item = removeUnshowedNested(item, field, join);
              }
            }
          });

          return item;
        });

        resolve(jr);
      } catch (err: any) {
        if (!!err.sqlMessage) {
          reject(err.sqlMessage);
        } else {
          reject(err);
        }
      }
    });
  }

  countByFilter(
    {
      filter,
      join = [],
      db: alternativeDb,
      dialect: alternativeDialect,
      table: alternativeTable,
    }: {
      filter: any;
      join?: IJoin[];
      db?: string;
      dialect?: "pgsql" | "mysql";
      table?: string;
    },
    debug?: any
  ): any {
    const dbi = !!alternativeDb
      ? alternativeDb
      : !!this.database
      ? this.database
      : "";
    const db = dbs[dbi as keyof typeof dbs];

    const filterQuery = this.filterQuery(
      {
        filter: { ...filter },
        table: !!alternativeTable ? alternativeTable : this.table ?? "",
        dialect: !!alternativeDialect
          ? alternativeDialect
          : !!this.dialect
          ? this.dialect
          : "mysql",
      },
      !!debug
    );

    const take_join_from_filter = Object.entries(filter)
      .filter(
        ([key]) =>
          key.startsWith("join_") ||
          key.startsWith("leftjoin_") ||
          key.startsWith("rightjoin_")
      )
      .map(([key, value]) => {
        const joinType = key.split("_")[0];
        return {
          name: key.replace(/^(leftjoin_|rightjoin_|join_)/, "").split("_")[0],
          joinType:
            joinType === "leftjoin"
              ? "leftJoin"
              : joinType === "rightjoin"
              ? "rightJoin"
              : "join",
          filter: {
            [key.replace(/^(leftjoin_|rightjoin_|join_)/, "").split("_")[1]]:
              value,
          },
        };
      });

    const joinSql = join.filter(
      (item) =>
        typeof item !== "string" &&
        (item.joinType === "rightJoin" ||
          item.joinType === "leftJoin" ||
          item.joinType === "join")
    ) as unknown as IJoin[];

    const combineJoinSql = [...joinSql, ...take_join_from_filter]
      .map((item, i, self) => {
        const nice = self.filter(
          (s) => s.name === item.name && s.joinType === item.joinType
        );

        let newItem = { ...item };

        nice.forEach((s) => {
          newItem = {
            ...newItem,
            filter: { ...newItem.filter, ...s.filter },
          };
        });

        return newItem;
      })
      .filter(
        (item, i, self) =>
          self.findIndex(
            (j) => j.name === item.name && j.joinType === item.joinType
          ) === i
      );

      if(!!debug){
        console.log("====1", debug, joinSql, combineJoinSql)
      }

    const joinQuery = this.joinSqlQuery({
      joinArr: joinSql,
      relationObj: this.relations,
      parentTable: !!alternativeTable ? alternativeTable : this.table ?? "",
    },
      debug);
    const filterJoinQuery = this.joinFilterSqlQuery(
      {
        joinArr: combineJoinSql as IJoin[],
        relationObj: this.relations,
        dialect: !!alternativeDialect
          ? alternativeDialect
          : !!this.dialect
          ? this.dialect
          : "mysql",
        // this.table ?? ""
      },
    );

    const query = `SELECT COUNT(*) AS total FROM ${
      !!alternativeTable ? alternativeTable : this.table ?? ""
    } ${joinQuery} ${
      [...filterQuery, ...filterJoinQuery].length > 0 ? "WHERE" : ""
    } ${[...filterQuery, ...filterJoinQuery].join(" AND ")}`;
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}]\x1b[38;2;255;165;0m[SQL]\x1b[0m ${query}`);
    console.log(``);

    return new Promise(async (resolve, reject) => {
      try {
        if (db instanceof pg.Pool) {
          const result = await db.query(query);

          if (!!result.rows && result.rows.length > 0) {
            resolve(result.rows[0].total);
          }
        } else {
          const result = await db.query(query);
          if (!!result && result.length > 0) {
            resolve((result as any[0])[0].total);
          }
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  store(payload: any) {
    const dbi = this.database ?? "";
    const db = dbs[dbi as keyof typeof dbs];

    const columns = [...Object.keys(payload), "created_at", "updated_at"].join(
      ","
    );

    const values = [
      ...Object.keys(payload).map((key) => `'${payload[key]}'`),
      `'${new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", "")
        .slice(0, 19)}'`,
      `'${new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", "")
        .slice(0, 19)}'`,
    ].join(",");

    const query = `INSERT INTO ${this.table} (${columns}) VALUES (${values})`;
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}]\x1b[38;2;255;165;0m[SQL]\x1b[0m ${query}`);
    console.log(``);

    if (db instanceof pg.Pool) {
      return db.query(query);
    }
    return db.query(query);
  }

  update(
    payload: any,
    {
      filter,
      join = [],
      table: alternativeTable,
      relations: alternativeRelations = null,
      dialect: alternativeDialect,
    }: {
      filter: any;
      join?: IJoin[];
      relations?: IRelation | null;
      table?: string;
      dialect?: "pgsql" | "mysql";
    }
  ) {
    const dbi = this.database ?? "";
    const db = dbs[dbi as keyof typeof dbs];

    const joinSql = join.filter(
      (item) =>
        typeof item !== "string" &&
        (item.joinType === "rightJoin" ||
          item.joinType === "leftJoin" ||
          item.joinType === "join")
    ) as unknown as IJoin[];

    const joinQuery = this.joinSqlQuery({
      joinArr: joinSql,
      relationObj: !!alternativeRelations
        ? alternativeRelations
        : this.relations,
      parentTable: !!alternativeTable ? alternativeTable : this.table ?? "",
    });

    let set = "";

    if (
      (!!alternativeDialect
        ? alternativeDialect
        : !!this.dialect
        ? this.dialect
        : "mysql") === "mysql"
    ) {
      // mysql
      set = [
        ...Object.keys(payload).map((key) =>
          payload[key] === null
            ? `${
                !!alternativeTable ? alternativeTable : this.table ?? ""
              }.${key}= NULL `
            : `${
                !!alternativeTable ? alternativeTable : this.table ?? ""
              }.${key}='${payload[key]}'`
        ),
        `${
          !!alternativeTable ? alternativeTable : this.table ?? ""
        }.updated_at = '${new Date()
          .toISOString()
          .replace("T", " ")
          .replace("Z", "")
          .slice(0, 19)}'`,
      ].join(" , ");
    }

    if (
      (!!alternativeDialect
        ? alternativeDialect
        : !!this.dialect
        ? this.dialect
        : "mysql") === "pgsql"
    ) {
      //pgsql
      set = [
        ...Object.keys(payload).map((key) =>
          payload[key] === null ? `${key}= NULL ` : `${key}='${payload[key]}'`
        ),
        `updated_at = '${new Date()
          .toISOString()
          .replace("T", " ")
          .replace("Z", "")
          .slice(0, 19)}'`,
      ].join(" , ");
    }

    const where = [
      ...Object.keys(filter).map((key) => `${key}='${filter[key]}'`),
    ].join(" AND ");

    const query = `UPDATE ${this.table} ${joinQuery} SET ${set} WHERE ${where}`;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}]\x1b[38;2;255;165;0m[SQL]\x1b[0m ${query}`);
    console.log(``);

    if (db instanceof pg.Pool) {
      return db.query(query);
    }
    return db.query(query);
  }
  delete(filter: any) {
    const dbi = this.database ?? "";
    const db = dbs[dbi as keyof typeof dbs];

    const where = [
      ...Object.keys(filter).map((key) => `${key}='${filter[key]}'`),
    ].join(" AND ");

    const query = `DELETE FROM ${this.table} WHERE ${where}`;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}]\x1b[38;2;255;165;0m[SQL]\x1b[0m ${query}`);
    console.log(``);

    if (db instanceof pg.Pool) {
      return db.query(query);
    }
    return db.query(query);
  }
}
export default Model;
