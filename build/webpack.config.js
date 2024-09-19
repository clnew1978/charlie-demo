
const path = require('path');

module.exports = {
  entry: '../server/dist/app.js',
  mode: 'production',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.bundle.js'
  },
  optimization: {
    minimize: false
  }
}
