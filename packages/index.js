import PreviewImage from './preview-image/index.js'

const install = function (Vue, opts = {}) {
  Vue.prototype.$previewImage = PreviewImage
}

export default { install }
