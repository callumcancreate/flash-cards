const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");
const NodeExternals = require("webpack-node-externals");
const Dotenv = require("dotenv-webpack");
const Nodemon = require("nodemon-webpack-plugin");

const server = env => {
  const mode = env.production ? "production" : "development";
  let plugins = [
    new CleanWebpackPlugin(),
    new Nodemon({ script: "./dist/server.bundle.js" })
  ];

  if (!env.production) plugins.push(new Dotenv());

  return {
    mode,
    entry: {
      server: path.resolve(__dirname, "src", "server", "index.ts")
    },
    output: {
      filename: "[name].bundle.js",
      publicPath: "/"
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
    externals: [new NodeExternals()]
  };
};

module.exports = server;
