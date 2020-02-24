const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");
const NodeExternals = require("webpack-node-externals");
const Dotenv = require("dotenv-webpack");
const Nodemon = require("nodemon-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

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
    : [
        new HtmlWebpackPlugin({
          template: __dirname + "/src/server/public/index.html",
          favicon: __dirname + "/src/server/public/favicon.ico",
          filename: "template.html",
          minify: {
            removeTagWhitespace: true,
            collapseWhitespace: true
          }
        })
      ];

  if (!env.production && isServer) {
    plugins.push(new Dotenv());
    plugins.push(new CleanWebpackPlugin());
  }
  const outputPath = isServer
    ? __dirname + "/dist"
    : __dirname + "/dist/public";

  const target = isServer ? "node" : "web";
  return {
    mode,
    entry: {
      [name]: `${__dirname}/src/${name}/${isServer ? "index.ts" : "index.tsx"}`
    },
    output: {
      filename: "[name].js",
      path: outputPath,
      publicPath: isServer ? "/public" : "/"
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
    externals: isServer ? [new NodeExternals()] : [],
    target,
    node: {
      __dirname: true
    }
  };
};

module.exports = [makeConfig("server"), makeConfig("client")];
