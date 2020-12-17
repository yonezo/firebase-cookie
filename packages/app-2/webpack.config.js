const webpack = require("webpack");
const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");

const APP_ENVIRONMENTS_PREFIX = /^APP_/i;

const raw = Object.keys(process.env)
  .filter((key) => APP_ENVIRONMENTS_PREFIX.test(key))
  .reduce((env, key) => {
    env[key] = process.env[key];
    return env;
  }, {});
const environments = {
  "process.env": Object.keys(raw).reduce((env, key) => {
    env[key] = JSON.stringify(raw[key]);
    return env;
  }, {}),
};

module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  },
  plugins: [
    new HTMLPlugin({
      template: path.join(__dirname, "src/index.html"),
    }),
    new webpack.DefinePlugin(environments),
  ],
  devServer: {
    port: 7000,
  },
};
