const path = require("path");
const nodeExternals = require("webpack-node-externals");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  target: "node", // important for express/node
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.(ts)$/,
        exclude: [path.resolve("node_modules")],
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: path.resolve(__dirname, "../../tsconfig.node.json"),
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, "../../tsconfig.node.json"), // ✅ absolute path to tsconfig
      }),
    ],
  },
  output: {
    filename: "index.js",
  },
};
