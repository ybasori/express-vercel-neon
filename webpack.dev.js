const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common,{
  mode: "development", // or "development"
  entry: "./app/index.ts",
});