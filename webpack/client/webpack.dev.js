const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    proxy: [
      {
        context: ["/"],
        target: `http://0.0.0.0:5000/`,
        changeOrigin: true,
      },
    ],
    historyApiFallback: true,
    port: 3000,
    open: true,
    hot: true,
    static: "./public",
    client: {
      overlay: {
        errors: false,
        runtimeErrors: false,
      },
    },
  },
  output: {
    clean: true,
    publicPath: "/assets/js",
  },
});
