const path = require("path");
const Path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserJsPlugin = require("terser-webpack-plugin");
const Webpack = require("webpack");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");

module.exports = (env, argv) => {
  const prod = argv.mode === "production";

  return {
    mode: argv.mode,
    entry: {
      app: path.join(__dirname, "src/js/hyperschedule.ts"),
    },
    optimization: {
      //minimizer: [new TerserJsPlugin({})],
    },
    output: {
      path: path.join(__dirname, "dist"),
      filename: "hyperschedule.js",
    },
    module: {
      rules: [
        {
          test: /\.ts$/i,
          use: "ts-loader",
        },
        {
          test: /\.p?css$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            { loader: "css-loader", options: { sourceMap: !prod } },
            { loader: "postcss-loader", options: { sourceMap: !prod } },
          ],
        },
        { test: /\.html$/i, use: ["html-loader", "posthtml-loader"] },
      ],
    },
    resolve: {
      extensions: [".ts", ".js"],
      alias: {
        "@hyperschedule/lib": Path.join(__dirname, "src/js/lib"),
        "@hyperschedule/view": Path.join(__dirname, "src/js/view"),
        "@hyperschedule/model": Path.join(__dirname, "src/js/model"),
        "@hyperschedule/css": Path.join(__dirname, "src/css"),
      },
    },
    plugins: [
      new Webpack.EnvironmentPlugin({
        API_URL: "https://hyperschedule.herokuapp.com",
      }),
      new FaviconsWebpackPlugin("src/icon.png"),
      new HtmlWebpackPlugin({
        title: "hyperschedule",
        template: "src/html/index.html",
      }),
      new MiniCssExtractPlugin(),
    ],
    devtool: prod ? "hidden-source-map" : "eval-source-map",
    devServer: {
      host: "0.0.0.0",
      contentBase: path.join(__dirname, "dist"),
      port: 5000,
      liveReload: !prod,
    },
  };
};
