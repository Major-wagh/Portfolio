module.exports = function override(config, env) {
  config.resolve = {
    ...config.resolve,
    fullySpecified: false, // Disable fully specified imports
  };
  return config;
};
