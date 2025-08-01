import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { expandRouter, promisify, renderHtml } from "./helper";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send(renderHtml());
});
app.use("/api", (req, _res, next) => {
  const coloredMethod = `\x1b[32m[${req.method}]\x1b[0m`;
  const queryStr = Object.entries(req.query)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map((v) => `${key}=${encodeURIComponent(v.toString())}`)
          .join("&");
      } else {
        return `${key}=${encodeURIComponent(value?.toString() ?? "")}`;
      }
    })
    .join("&");

  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}]${coloredMethod} ${req.path}${
      queryStr ? "?" + queryStr : ""
    }`
  );
  console.log(``);
  next();
});

expandRouter(routes).forEach((item) =>
  item.controller && item.method
    ? app[item.method](
        item.path,
        item.middleware ? item.middleware : [],
        item.controller
      )
    : null
);

module.exports = app;
