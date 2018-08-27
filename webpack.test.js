const path = require("path");
const WebpackShellPlugin = require("webpack-shell-plugin");

module.exports = {
  mode: "development",
  entry: ["babel-polyfill", path.join(__dirname, "src", "test")],
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "test"),
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [path.join(__dirname, "src")],
        loader: "babel-loader",
        options: {
          retainLines: true,
          presets: ["env", "react"],
          plugins: [
            "transform-class-properties",
            "transform-object-rest-spread",
          ],
        },
      },
    ],
  },
  plugins: [
    new WebpackShellPlugin({
      onBuildExit: "mocha",
    }),
  ],
  node: {
    fs: "empty",
    dns: "mock",
    net: "mock",
  },
  resolve: {
    modules: [path.join(__dirname, "node_modules")],
    extensions: [".js", ".jsx"],
    alias: {
      "@": path.join(__dirname, "src"),
    },
  },
};
