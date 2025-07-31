const path = require("path");
// const HtmlWebpackPlugin = require("html-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  entry: {
    app: {
      import: "./src/main.tsx",
    },
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".css", ".scss"],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, "../../tsconfig.app.json"), // <-- important
      }),
    ],
  },
  output: {
    clean: true,
    path: path.resolve(__dirname, "../../public/assets/js"),
    filename: "[name].bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: [path.resolve("node_modules")],
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: path.resolve(__dirname, "../../tsconfig.app.json"),
            },
          },
        ],
      },
      {
        test: /\.(scss|sass|css)$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
        generator: {
          filename: "fonts/[hash][ext][query]",
        },
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
        generator: {
          filename: "images/[hash][ext][query]",
        },
      },
    ],
  },
  optimization: {
    runtimeChunk: "single",
  },
  plugins: [
    // new HtmlWebpackPlugin({
    //   title: "Output Management",
    // }),
  ],
};
