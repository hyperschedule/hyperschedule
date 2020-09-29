const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: {
    app: path.join(__dirname, "src/js/hyperschedule.ts")
  },
  output: {
    path: path.join(__dirname, "dist"),
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
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: ["postcss-nested", "autoprefixer", "postcss-validator"]
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "hyperschedule",
      template: "src/index.html"
    }),
    new MiniCssExtractPlugin()
  ]
};
