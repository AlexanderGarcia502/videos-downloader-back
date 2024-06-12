const resolutionCodes = require('../utils/resolutionCodes')

const getResolutionCode = (resolution) => {
    return resolutionCodes[resolution] || resolution;
  };

module.exports = getResolutionCode