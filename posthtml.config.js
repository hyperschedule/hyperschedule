module.exports = {
  plugins: {
    "posthtml-include": {
      root: "./src/html",
    },
    "posthtml-expressions": {
      locals: {
        ANALYTICS: process.env.ANALYTICS ? true : false,
      },
    },
  },
};
