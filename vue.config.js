const path = require('path')

module.exports = {
  pages: {
    index: {
      // page 的入口
      entry: 'examples/main.js'
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        packages: path.join(__dirname, 'packages')
      }
    }
  }
}
