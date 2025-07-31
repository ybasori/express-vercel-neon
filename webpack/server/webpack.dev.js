const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");

module.exports = merge(common,{
  mode: "development", // or "development"
  entry: "./app/index.ts",
  output:{
    path: path.resolve(__dirname, "../../dist"),
  }
});

