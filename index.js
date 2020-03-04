const api = {};

module.exports = Object.assign(api,
                               require('./dist/comparison'),
                               require('./dist/ranges'),
                               require('./dist/functions'));
