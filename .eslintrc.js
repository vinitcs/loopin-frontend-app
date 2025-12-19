module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: true, // or false if you want to skip looking for babel.config.js
    babelOptions: {
      presets: ['module:@react-native/babel-preset'],
      plugins: [
        [
          'module:react-native-dotenv',
          {
            moduleName: '@env',
            path: '.env',
            blocklist: null,
            allowlist: null,
            safe: false,
            allowUndefined: true,
          },
        ],
      ],
    },
  },
};
