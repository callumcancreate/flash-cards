const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");
const NodeExternals = require("webpack-node-externals");
const Dotenv = require("dotenv-webpack");
const Nodemon = require("nodemon-webpack-plugin");

const makeConfig = name => env => {
  const mode = env.production ? "production" : "development";
  const isServer = name === "server";
  let plugins = isServer
    ? [
        new Nodemon({
          script: "./dist/server.js",
          watch: path.resolve("./dist")
        })
      ]
    : [new CleanWebpackPlugin()];

  if (!env.production) plugins.push(new Dotenv());

  const outputPath = isServer ? [] : ["public"];
  return {
    mode,
    entry: {
      [name]: path.resolve(
        __dirname,
        "src",
        name,
        isServer ? "index.ts" : "index.tsx"
      )
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist", ...outputPath),
      publicPath: "/public"
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: "ts-loader"
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: ["babel-loader", "eslint-loader"]
        },
        {
          enforce: "pre",
          test: /\.js$/,
          use: "source-map-loader"
        }
      ]
    },
    devtool: env.production ? "source-maps" : "eval",
    plugins,
    resolve: {
      extensions: [".tsx", ".ts", ".js"]
    },
    externals: isServer ? [new NodeExternals()] : []
  };
};

module.exports = [makeConfig("server"), makeConfig("client")];
