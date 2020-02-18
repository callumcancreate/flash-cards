const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");
const NodeExternals = require("webpack-node-externals");

const server = {
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
  plugins: [new CleanWebpackPlugin()],
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  externals: [new NodeExternals()]
};

module.exports = server;
