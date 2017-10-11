# Clean Obsolete Assets
A webpack plugin to remove/clean no longer used assets files from previous bundles

![MIT License](https://camo.githubusercontent.com/d59450139b6d354f15a2252a47b457bb2cc43828/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f6c2f7365727665726c6573732e737667)


## Usage
```js
const CleanObsoleteAssets = require('clean-obsolete-assets-webpack-plugin');

// webpack config
{
  plugins: [
    new CleanObsoleteAssets({statsFilePath: 'path-to-stats-file.json'})
  ]
}
```