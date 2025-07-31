export interface IRoute {
  path: string;
  method?: "get" | "post" | "put" | "patch" | "delete" | "all";
  middleware?: any[];
  controller?: any;
  children?: IRoute[];
}

const onArrayForm = (
  name: string,
  data: IRoute[],
  obj: IRoute[],
  middlewares: any[]
) => {
  let newObj = [...obj];
  data.forEach((item) => {
    if (item.controller) {
      newObj = [
        ...newObj,
        {
          path: `${name !== "/" ? name : ""}${item.path}`,
          method: item.method,
          middleware: item.middleware
            ? [...middlewares, ...item.middleware]
            : [...middlewares],
          controller: item.controller,
        },
      ];
    }
    if (Array.isArray(item.children) || typeof item.children === "object") {
      newObj = onArrayForm(
        `${name !== "/" ? name : ""}${item.path}`,
        item.children,
        newObj,
        item.middleware
          ? [...middlewares, ...item.middleware]
          : [...middlewares]
      );
    }
  });
  return newObj;
};

/**
 * @typedef {{
 * path: string,
 * method:"post",
 * middleware: any[],
 * controller: any,
 * children: IRoute[]
 * }} IRoute
 */

/**
 *
 * @param {IRoute[]} data
 * @returns
 */

export const expandRouter = (data: IRoute[]) => {
  let obj: IRoute[] = [];
  data.forEach((item) => {
    if (item.controller) {
      obj = [
        ...obj,
        {
          path: item.path,
          method: item.method,
          middleware: item.middleware,
          controller: item.controller,
        },
      ];
    }
    if (Array.isArray(item.children) || typeof item.children === "object") {
      obj = onArrayForm(
        item.path,
        item.children,
        obj,
        item.middleware ? [...item.middleware] : []
      );
    }
  });
  return obj;
};

export const renderHtml = (payload?: { title?: string; reducer?: any }) => {
  const title = payload?.title ?? "Document";
  const reducer = payload?.reducer ?? "{}";

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
    <link rel="stylesheet" href="/bulma/bulma.min.css">
    <link rel="stylesheet" href="/fa/css/all.min.css">
      </head>
      <body>
        <div id="root"></div>
        <!---<div id="fb-root"></div>
<script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v23.0&appId=1282849900174718"></script> -->
        <script>
      window.__PRELOADED_STATE__ = ${reducer==="{}"?reducer:JSON.stringify(reducer)};
        </script>
        <script src="/assets/js/app.bundle.js"></script>
        <script src="/assets/js/runtime.bundle.js"></script>
      </body>
    </html>`;
};

export const promisify =
  (callbackFunc:any) =>
  (...args:any) =>
    new Promise((resolve, reject) => {
      callbackFunc(...args, (error:any, result:any) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
    });

export function convertToObj(input: Record<string, any>): Record<string, any> {
  function parseKeyPath(key: string): (string | number)[] {
    const parts = [];
    const regex = /([^\[\]]+)/g;
    let match;
    while ((match = regex.exec(key))) {
      const part = match[1];
      parts.push(/^\d+$/.test(part) ? Number(part) : part);
    }
    return parts;
  }

  function setDeep(obj: any, keys: (string | number)[], value: any) {
    let current = obj;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const isLast = i === keys.length - 1;

      if (isLast) {
        const maybeNumber = Number(value);
        current[key] =
          !isNaN(maybeNumber) && value.trim() !== '' ? maybeNumber : value;
      } else {
        if (current[key] === undefined) {
          current[key] = typeof keys[i + 1] === 'number' ? [] : {};
        }
        current = current[key];
      }
    }
  }

  const output: Record<string, any> = {};

  for (const [key, value] of Object.entries(input)) {
    const path = parseKeyPath(key);
    setDeep(output, path, value);
  }

  return output;
}