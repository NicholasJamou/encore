module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated plugin has to be listed last
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './tamagui.config.ts',
          logTimings: true,
        }
      ],
      'transform-inline-environment-variables',
      'react-native-reanimated/plugin',
    ],
  };
};