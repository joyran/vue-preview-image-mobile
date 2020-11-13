<h1 align="center">vue-preview-image-mobile</h1>

Vue图片预览插件，只支持移动端

### Install
```
yarn add vue-preview-image-mobile
```

### Use
```js
import PreviewImage from 'vue-preview-image-mobile'
Vue.use(PreviewImage)

this.$previewImage({
  urls: [
    'https://img.yzcdn.cn/vant/apple-1.jpg',
    'https://img.yzcdn.cn/vant/apple-2.jpg',
    'https://img.yzcdn.cn/vant/apple-3.jpg',
    'https://img.yzcdn.cn/vant/apple-4.jpg'
  ],
  startPosition: 1,
  onClose () {
    console.log('关闭事件回调')
  }
})
```

### Todo
[*] 双击放大缩小功能
