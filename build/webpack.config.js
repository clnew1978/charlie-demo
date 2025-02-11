
const path = require('path');

module.exports = {
  entry: '../nodejs-server/dist/app.js',
  mode: 'none',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.bundle.js'
  },
  optimization: {
    minimize: false
  }
}
