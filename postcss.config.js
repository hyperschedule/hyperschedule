module.exports = {
  parser: "postcss-scss",
  plugins: [
    require("postcss-nested"),
    require("autoprefixer"),
    require("@tailwindcss/jit"),
  ],
};
