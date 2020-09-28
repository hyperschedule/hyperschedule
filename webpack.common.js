const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    app: path.join(__dirname, "src/js/hyperschedule.ts")
  },
  output: {
    path: path.join(__dirname, "dist/js"),
    filename: "hyperschedule.js"
  },
  module: {
    rules: [
      {
        test: /\.ts$/i,
        use: "ts-loader"
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "hyperschedule",
      template: "src/index.html"
    })
  ]
};
