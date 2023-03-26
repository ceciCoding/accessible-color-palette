const path = require('path')

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  output: {
    filename: 'accessible-color-palette.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'AccessibleColorPalette',
    libraryTarget: 'umd',
  },
}