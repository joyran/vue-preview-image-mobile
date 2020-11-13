<template>
  <div id="app">
    <button type="button" name="button" @click="handleClick()">预览</button>
  </div>
</template>

<script>
export default {
  methods: {
    handleClick () {
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
    }
  }
}
</script>

<style lang="less">
</style>
