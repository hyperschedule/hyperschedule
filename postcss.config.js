module.exports = {
  parser: "postcss-scss",
  plugins: [
    require("postcss-import"),
    require("postcss-nested"),
    require("autoprefixer"),
    //require("@tailwindcss/jit"),
    require("tailwindcss"), // JIT causes freeze after build, I think related to tailwindlabs/tailwindcss-jit#54
  ],
};
