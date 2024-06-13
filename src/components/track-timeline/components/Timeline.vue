<template>
  <div ref="canvasContainer" class="timeline-container">
    <canvas
      :style="canvasStyle"
      v-bind="canvasAttr"
      ref="timeLine"
      @click="handleClick"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { drawTimeLine, getSelectFrame } from '../utils/canvas';
import type { UserConfig, CanvasConfig } from '../utils/canvas';
import { ref, computed, onMounted, nextTick, watch, reactive } from 'vue';
import globalDefault from '../global-default';
const props = defineProps({
  start: { // 开始坐标
    type: Number,
    default: 0
  },
  step: { // 步进，与视频fps同步
    type: Number,
    default: 30
  },
  scale: { // 时间轴缩放比例
    type: Number,
    default: 0
  },
  focusPosition: { // 选中元素时在时间轴中高亮显示
    type: Object,
    default() {
      return {
        start: 0, // 起始帧数
        end: 0 // 结束帧数
      };
    }
  }
});
const emits = defineEmits({
  selectFrame(val: number) {
    return val !== null;
  }
});
/**
 * 初始化 Canvas
 * */
const canvasContainer = ref();
const timeLine = ref();
let canvasContext = {} as CanvasRenderingContext2D;
const canvasConfigs = computed(() => ({
  ...globalDefault.timeline
}));
const canvasAttr = reactive({
  width: 0,
  height: 0
});
const canvasStyle = computed(() => {
  return {
    width: `${canvasAttr.width / canvasConfigs.value.ratio}px`,
    height: `${canvasAttr.height / canvasConfigs.value.ratio}px`
  };
});
// 重绘线条
function updateTimeLine() {
  drawTimeLine(canvasContext, { ...props } as UserConfig, { ...canvasAttr, ...canvasConfigs.value } as CanvasConfig);
}
// 设置 canvas 上下文环境
function setCanvasContext() {
  canvasContext = timeLine.value.getContext('2d');
  canvasContext.font = `
    ${canvasConfigs.value.textSize * canvasConfigs.value.ratio}px 
    -apple-system, 
    ".SFNSText-Regular", 
    "SF UI Text", 
    "PingFang SC", 
    "Hiragino Sans GB", 
    "Helvetica Neue", 
    "WenQuanYi Zen Hei", 
    "Microsoft YaHei", 
    Arial, sans-serif
  `;
  canvasContext.lineWidth = canvasConfigs.value.lineWidth;
  canvasContext.textBaseline = canvasConfigs.value.textBaseline;
  canvasContext.textAlign = canvasConfigs.value.textAlign;
}
// 设置 canvas 大小
function setCanvasRect() {
  const { width, height } = canvasContainer.value.getBoundingClientRect();
  canvasAttr.width = width * canvasConfigs.value.ratio;
  canvasAttr.height = height * canvasConfigs.value.ratio;
  nextTick(() => {
    setCanvasContext();
    updateTimeLine();
  });
}
function handleClick(event: MouseEvent) {
  const offset = event.offsetX;
  const frameIndex = getSelectFrame(props.start + offset, props.scale, props.step);
  emits('selectFrame', frameIndex);
}
onMounted(() => {
  setCanvasRect();
});
watch(canvasConfigs, updateTimeLine);
watch(props, updateTimeLine);
window.addEventListener('resize', setCanvasRect, false);
</script>
<style lang="scss" scoped>
  .timeline-container {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    height: 20px;
    text-align: center;
    line-height: 20px;
    font-size: 14px;
    z-index: 20;
  }
</style>