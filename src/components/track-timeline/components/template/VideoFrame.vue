<template>
  <div ref="frameContainer" class="frame-container">
    <canvas v-bind="canvasAttr" ref="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, reactive, inject, computed } from 'vue';
import type FFmpegManager from '@/components/track-timeline/utils/ffmpeg-manager';
import type { PropType } from 'vue';
import { ITrackClipInComponent } from '@/components/track-timeline/types';
import { getGridPixel } from '../../utils/canvas';
import { useTrackState } from '../../stores/track-state';
const props = defineProps({
  trackItem: {
    type: Object as PropType<ITrackClipInComponent>,
    default() {
      return {
        showWidth: '0px',
        showLeft: '0px'
      };
    }
  },
  type: {
    type: String,
    default: 'video'
  },
  nonLoading: {
    type: Boolean,
    default: false
  }
});

const ffmpeg = inject('ffmpeg') as FFmpegManager;
const store = useTrackState();
/**
 * 初始化 Canvas
 * */
const frameContainer = ref();
const canvas = ref();
let canvasContext = {} as CanvasRenderingContext2D;
const canvasImage = ref();
const canvasAttr = reactive({
  width: 0,
  height: 0,
  originWidth: 0,
});
const drawSize = reactive({
  width: 0,
  height: 0,
  frameCount: 0,
  maxFrame: 1
});
const trackScale = computed(() => store.trackScale);
/**
 * @param imageBitmap 图像数据
 * @param start 开始位置
 * @param margin 图像间距
 * */
function drawBitmap(imageBitmap: ImageBitmap, drawIndex = 0, margin = 0) {
  const { width, height } = drawSize;
  const { width: imageW = 0, height: imageH = 0 } = props.trackItem;
  canvasContext.drawImage(imageBitmap, 0, 0, imageW, imageH, drawIndex * (width + margin), 0, width, height);
}
// 绘制图像
async function drawImage() {
  if (canvasImage.value && canvas.value.width) {
    await nextTick();
    const x = getGridPixel(trackScale.value, props.trackItem.offsetLeft);
    canvasContext.clearRect(0, 0, canvas.value.width, canvas.value.height);
    canvasContext.putImageData(canvasImage.value, 0, 0, 0, 0, canvas.value.width, canvas.value.height);
    if (x > 0) {
      const imageData = canvasContext.getImageData(0, 0, canvas.value.width, canvas.value.height);
      canvasContext.putImageData(imageData, 0, 0);
    }
    return;
  }
  if (props.trackItem.name && props.nonLoading && ffmpeg.isLoaded.value) {
    const { width: containerWidth } = canvasAttr;
    const { maxFrame, width, frameCount } = drawSize;
    const frameStep = Math.max(maxFrame - 1, 1); // 帧间距数，最小为1帧
    const renderSpace = Math.max(Math.floor(frameCount / frameStep), 1); // 间隔多少帧渲染一次
    let overFrame = Math.floor(frameCount - 1 - renderSpace * frameStep); // 不能整除时溢出帧数
    let offset = Math.max(containerWidth - Math.floor(maxFrame * width), 0); // 不够撑满canvas宽度的情况
    let marginSpace = Math.max(Math.round((offset / frameStep)), 0); // 帧数不够填满容器时的间距
    let frameIndex = props.trackItem.offsetLeft + 1; // 开始下标
    for (let i = 0; i < maxFrame; i++) {
      try {
        const blobFrame = await ffmpeg.getFrame(props.trackItem.name, frameIndex);
        const imageBitmap = await createImageBitmap(blobFrame);
        drawBitmap(imageBitmap, i, marginSpace);
        getImageData();
        frameIndex = Math.min(frameIndex + renderSpace, frameCount);
        if (overFrame > 0) {
          frameIndex += 1;
          overFrame--;
        }
      } catch (error) {
        console.log('error: ', error);
      }
    }
  }
}
function getImageData() {
  if (canvas.value.width) {
    canvasImage.value = canvasContext.getImageData(0, 0, canvas.value.width, canvas.value.height);
  }
}
// 设置 canvas 上下文环境
function setCanvasContext() {
  canvasContext = canvas.value.getContext('2d', { willReadFrequently: true });
}
// 设置 canvas 大小
function setCanvasRect() {
  const { inFrame, outFrame, width: frameW = 0, height: frameH = 0 } = props.trackItem;
  const showFrameCount = outFrame - inFrame;
  const { width, height } = frameContainer.value.getBoundingClientRect();
  canvasAttr.width = width;
  canvasAttr.height = height;
  if (!canvasAttr.originWidth) {
    console.log('widt', width);
    canvasAttr.originWidth = width;
  }
  const scaleW = Math.ceil(frameW / (frameH / height));
  drawSize.height = height;
  drawSize.width = scaleW;
  drawSize.frameCount = showFrameCount;
  drawSize.maxFrame = Math.min(Math.ceil(width / scaleW), showFrameCount);
  drawImage();
}
onMounted(() => {
  setCanvasContext();
});
watch(props, () => {
  nextTick(setCanvasRect);
}, { immediate: true, flush: 'post' });
</script>
<style lang="scss" scoped>
  .frame-container {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 100%;
  }
</style>
