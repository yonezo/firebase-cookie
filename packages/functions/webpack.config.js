/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require("fs");
const path = require("path");

const GenerateJsonPlugin = require("generate-json-webpack-plugin");

const pkg = require("./package.json");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
const appDist = resolveApp("dist");

const externals = ["firebase-admin", "firebase-functions"];

const genPackage = () => ({
  name: "functions",
  private: true,
  main: "index.js",
  license: "UNLICENSED",
  engines: pkg.engines,
  dependencies: externals.reduce(
    (acc, name) =>
      Object.assign({}, acc, {
        [name]: pkg.dependencies[name] || pkg.devDependencies[name],
      }),
    {}
  ),
});

module.exports = {
  target: "node",
  mode: "production",
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
  },
  output: {
    filename: "index.js",
    path: appDist,
    libraryTarget: "commonjs",
  },
  externals: externals.reduce(
    (acc, name) => Object.assign({}, acc, { [name]: true }),
    {}
  ),
  plugins: [new GenerateJsonPlugin("package.json", genPackage())],
};
