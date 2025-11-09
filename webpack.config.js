const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function(env, argv) {
  // CRUCIAL CHANGE: Ensure env includes mode, which is necessary for @expo/webpack-config
  const mode = env.mode || 'development'; 
  
  // Pass all environment variables, including the determined mode, to the creator function
  const config = await createExpoWebpackConfigAsync({ ...env, mode }, argv);

  // This is the CRUCIAL line that fixes the react-native-maps web error:
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    'react-native-maps': path.resolve(__dirname, 'node_modules/react-native-web-maps'),
  };

  return config;
};