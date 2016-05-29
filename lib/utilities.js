const utilities = {
  hasRequiredProps: function(toCheck, requiredProps) {
    return !requiredProps.some(function(prop, propIndex) {
      return !toCheck.hasOwnProperty(prop);
    });
  },
  zeroBuffer: function(buf) {
    for (let i = 0; i < buf.length; i++) {
      buf.writeUInt8(0, i);
    }
  }
};

module.exports = exports = utilities;