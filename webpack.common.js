const path = require("path");
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: "node", // important for express/node
  externals: [ nodeExternals() ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "api")
  }
};