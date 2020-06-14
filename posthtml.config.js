module.exports = {
  plugins: {
    "posthtml-expressions": {
      locals: {
        ANALYTICS: process.env.ANALYTICS ? true : false
      }
    }
  }
};
