const process = require('process');

module.exports = function () {
  return {
    visitor: {
      Identifier(path) {
        if (path.node.name === 'API_URL')
        {
          path.node.name = JSON.stringify(
            process.env.API_URL || 'https://hyperschedule-api-v3.herokuapp.com');
        }
      }
    }
  };
};
