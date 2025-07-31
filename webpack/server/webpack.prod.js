const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");

module.exports = merge(common, {
  mode: "production", // or "development"
  entry: "./app/main.ts",
  output:{
    libraryTarget: "commonjs2", // 👈 required
    path: path.resolve(__dirname, "../../api")
  }
});