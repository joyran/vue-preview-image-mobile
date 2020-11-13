import Vue from 'vue'
import Index from './index.vue'
const IndexConstructor = Vue.extend(Index)

let instance

const PreviewImage = function (options) {
  options = options || {}

  if (!Array.isArray(options.urls)) {
    console.error('图片列表只能为数组！')
    return
  }

  if (Array.isArray(options.urls) && options.urls.length === 0) {
    console.error('图片列表不能为空！')
    return
  }

  if (options.startPosition >= options.urls.length) {
    console.error('起始图片索引不能超过图片列表长度！')
    return
  }

  instance = new IndexConstructor({
    data: options
  })
  instance.$mount()
  document.body.appendChild(instance.$el)
  instance.visible = true
  return instance
}

export default PreviewImage
