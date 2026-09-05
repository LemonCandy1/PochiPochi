const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude agent custom skills and test scratchpads from Metro bundling/watching
config.resolver.blockList = [
  /\.agents[\/\\].*/,
  /tests[\/\\].*/,
];

module.exports = config;
