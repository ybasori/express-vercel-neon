const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production", // or "development"
  entry: "./app/main.ts",
});