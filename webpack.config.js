const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserJsPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => {
  const prod = argv.mode === "production";

  return {
    mode: argv.mode,
    entry: {
      app: path.join(__dirname, "src/js/hyperschedule.ts")
    },
    optimization: {
      minimizer: [new TerserJsPlugin({}), new OptimizeCssAssetsPlugin({})]
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
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: !prod
              }
            },
            "css-loader",
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    "postcss-nested",
                    "autoprefixer",
                    "postcss-validator"
                  ]
                }
              }
            }
          ]
        }
      ]
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: "hyperschedule",
        template: "src/index.html"
      }),
      new MiniCssExtractPlugin()
    ],
    devtool: prod ? "hidden-source-map" : "eval-source-map",
    devServer: {
      host: "0.0.0.0",
      contentBase: path.join(__dirname, "dist"),
      port: 5000,
      hot: !prod
    }
  };
};
