module.exports = {
  plugins: {
    "posthtml-include": {},
    "posthtml-expressions": {
      locals: {
        ANALYTICS: process.env.ANALYTICS ? true : false,
      },
    },
  },
};
