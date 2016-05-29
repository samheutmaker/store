const writeKey = process.env.ANALYTICS_WRITE_KEY || 's4noKFWcS7z1Zpevty1nG6S6gnr1NkRF';
const Analytics = require('analytics-node');
var analytics = new Analytics(writeKey);

module.exports = exports = analytics;