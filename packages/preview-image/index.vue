<template lang="html">
  <transition name="fade">
    <div class="image-preview__swiper-container" v-if="visible">
      <div class="image-preview__index">
        {{ activeIndex + 1 }} / {{ urls.length }}
      </div>
      <div
        class="image-preview__swiper-wrapper"
        :style="{
          transform: 'translate3d(' + translateX +'px, 0px, 0px)',
          'transition-duration': duration + 's'
        }">
        <div
          v-for="(src, index) in urls"
          :key="index"
          class="image-preview__swiper-slider"
          :class="{ 'is-active': activeIndex === index, 'image-preview__center': center[index] }"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd">
          <div class="image-preview__loading" v-if="loading[index]">
            <img class="loading__image" src="./loading.png" alt="">
          </div>
          <img v-else style="width: 100%" class="image-preview__image" :src="src" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import './index.less'

export default {
  data () {
    return {
      visible: false,
      flex: true,
      offsetX: 0, // 当前X轴偏移
      offsetY: 0, // 当前Y轴偏移
      moveDirection: '', // 手指移动方向
      translateX: 0, // 整体偏移
      duration: 0,
      activeIndex: 0,
      initTouch: {
        screenX: 0,
        screenY: 0,
        timestamp: 0
      }, // 初始触控坐标
      initMultiTouch: [], // 多点触控初始坐标
      isMultiTouch: false, // 是否多点触控
      isDoubleTouch: false, // 是否双击
      scale: 1,
      scaleDatum: 1, // 缩放系数，每次缩放后保存
      loading: [],
      center: [],
      touchgap: 0,
      clickTimes: 0,
      timeout: null,
      startPosition: 0, // 当前显示图片的索引
      urls: [], // 需要预览的图片http链接列表
      onClose: () => {}
    }
  },

  watch: {
    visible (value) {
      if (value) {
        this.activeIndex = this.startPosition
        this.translateX = this.activeIndex * -screen.width

        if (Array.isArray(this.urls) && this.urls.length === 0) {
          return
        }

        // 监听图片加载，加载完成后取消loading状态
        for (let i = 0; i < this.urls.length; i++) {
          const img = new Image()

          // 初始默认配置
          this.center.push(true)
          this.loading.push(true)

          img.onload = (e) => {
            const height = e.target.height * screen.width / e.target.width
            // 图片转换后的高度小于屏幕高度则垂直居中，反之顶部对齐
            this.center.splice(i, 1, height < screen.height)
            this.loading.splice(i, 1, false)
          }
          img.src = this.urls[i]
        }
      }
    }
  },

  methods: {
    handleClose () {
      this.visible = false
      this.onClose()
    },

    handleTouchStart (e) {
      if (e.touches.length === 1) {
        this.isMultiTouch = false
        this.initTouch.timestamp = new Date().getTime()
        this.initTouch.screenX = e.touches[0].screenX
        this.initTouch.screenY = e.touches[0].screenY
      } else {
        this.isMultiTouch = true
        this.initMultiTouch[0] = e.touches[0]
        this.initMultiTouch[1] = e.touches[1]
      }
    },

    handleTouchMove (e) {
      if (e.touches.length === 1) {
        this.isMultiTouch = false
        this.offsetX = e.touches[0].screenX - this.initTouch.screenX
        this.offsetY = e.touches[0].screenY - this.initTouch.screenY

        // Y轴偏移大于X轴偏移时移动方向为Y轴，且一旦设置在手指离开之前不在更新
        if (!this.moveDirection) {
          this.moveDirection = Math.abs(this.offsetX) > Math.abs(this.offsetY) ? 'x' : 'y'
        }

        // 图片放大和移动方向为Y轴的时候移动手指不切换视图
        if (this.scale > 1 || this.moveDirection === 'y') {
          return
        }

        // 第一屏往左滑动的时候增大阻力，左边已经没有图片了
        if (this.activeIndex === 0 && this.offsetX > 0) {
          this.translateX = this.activeIndex * -screen.width + this.offsetX * 0.4
          return
        }

        // 最后一屏往右滑动的时候增大阻力，右边已经没有图片了
        if (this.activeIndex === this.urls.length - 1 && this.offsetX < 0) {
          this.translateX = this.activeIndex * -screen.width + this.offsetX * 0.4
          return
        }

        this.translateX = this.activeIndex * -screen.width + this.offsetX
      } else {
        this.isMultiTouch = true
        this.getScale(this.initMultiTouch, [e.touches[0], e.touches[1]])
        this.setScale()
      }
    },

    handleTouchEnd (e) {
      // 手指按下到离开的时间
      this.touchgap = new Date().getTime() - this.initTouch.timestamp

      if (this.isMultiTouch) {
        // 双指缩放，缩放结束后存储缩放系数
        this.scaleDatum = this.scale

        // 缩放后比比例比1小则需要还原到初始状态
        if (this.scale < 1) {
          this.scale = 1
          this.scaleDatum = 1
          this.setScale(0.3)
        }
      } else {
        this.singleTouch()
      }

      this.offsetX = 0
      this.offsetY = 0
      this.moveDirection = ''
    },

    // 单指触控，包括点击和滑动
    singleTouch () {
      // 单指触控且移动距离小于阈值则关闭
      if (Math.abs(this.offsetX) < 2 && Math.abs(this.offsetY) < 2 && this.touchgap < 300) {
        this.handleClose()
      } else {
        // 滑动为水平方向
        if (this.moveDirection === 'x') {
          if (this.touchgap < 200) {
            // 手指触摸时间小于200毫秒且图片没有被放大，不判断是否超过半屏，直接切换
            if (this.scale === 1) {
              if (this.offsetX > 0) {
                if (this.activeIndex > 0) {
                  this.activeIndex -= 1
                }
              } else {
                if (this.activeIndex < this.urls.length - 1) {
                  this.activeIndex += 1
                }
              }
            }
          } else {
            // 视图跟随手指切换
            if (this.offsetX > 0) {
              // 往左滑动
              if (this.offsetX > screen.width / 2) {
                // 往左滑动超过半屏自动切换到上一屏，但前提条件是不能为第一屏
                if (this.activeIndex > 0) {
                  // 切换成功后之前的图片如果被放大了需要还原
                  const dom = document.querySelectorAll('.image-preview__image')[this.activeIndex]
                  this.scale = 1
                  this.scaleDatum = 1
                  dom.style.width = `${this.scale * 100}%`

                  this.activeIndex -= 1
                }
              }
            } else {
              // 往右滑动
              if (Math.abs(this.offsetX) > screen.width / 2) {
                // 往右滑动超过半屏自动切换到下一屏，但前提条件是不能为最后一屏
                if (this.activeIndex < this.urls.length - 1) {
                  // 切换成功后之前的图片如果被放大了需要还原
                  const dom = document.querySelectorAll('.image-preview__image')[this.activeIndex]
                  this.scale = 1
                  this.scaleDatum = 1
                  dom.style.width = `${this.scale * 100}%`

                  this.activeIndex += 1
                }
              }
            }
          }

          // 总体偏移距离
          this.translateX = this.activeIndex * -screen.width

          // 滑动切换视屏的时候加一个动画持续时间300毫秒，300毫秒后置为0
          this.duration = 0.3
          setTimeout(() => {
            this.duration = 0
          }, 300)
        }
      }
    },

    getDistance (p1, p2) {
      return Math.sqrt(Math.pow((p2.screenX - p1.screenX), 2) + Math.pow((p2.screenY - p1.screenY), 2))
    },

    getScale (start, stop) {
      let scale = this.getDistance(stop[0], stop[1]) / this.getDistance(start[0], start[1])
      scale = this.scaleDatum * scale
      if (scale < 1) {
        // 不能小于0.8
        this.scale = scale < 0.8 ? 0.8 : scale
      } else {
        // 不能大于4
        this.scale = scale > 4 ? 4 : scale
      }
    },

    setScale (duration = 0) {
      const dom = document.querySelectorAll('.image-preview__image')[this.activeIndex]
      if (duration === 0) {
        dom.style.width = `${this.scale * 100}%`
      } else {
        dom.style.transitionDuration = `${duration}s`
        dom.style.width = `${this.scale * 100}%`
        setTimeout(() => {
          dom.style.transitionDuration = '0s'
        }, 300)
      }
    }
  }
}
</script>
