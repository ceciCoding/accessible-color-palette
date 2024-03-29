const path = require('path')

module.exports = {
  entry: './src/index.ts',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'accessible-color-palette.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'AccessibleColorPalette',
    libraryTarget: 'umd',
    globalObject: 'this',
},

}