<template>
  <div class="track-play-point" ref="playPointer" :style="trackStyle" @mousedown="onMouseDown">
    <span class="playpoint"></span>
  </div>
</template>

<script setup lang="ts">
import { getGridPixel, getSelectFrame } from '../utils/canvas';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useTrackState } from '../stores/track-state';
import { usePlayerState } from '../stores/player-state';
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
  container: {
    type: Object,
    default: () => null
  }
});
const emits = defineEmits<{
  (e: 'select-frame', index: number): void
}>();
const offsetLine = {
  left: 10
};
const trackStore = useTrackState();
const playStore = usePlayerState();

const isDragging = ref(false);

const playPointer = ref();

const trackStyle = computed(() => {
  return {
    left: `${offsetLine.left}px`,
    transform: `translate(${getGridPixel(trackStore.trackScale, playStore.playStartFrame)}px, 0px)`
  };
});

function onMouseDown()
{
  isDragging.value = true;
}

function onMouseMove(event: MouseEvent)
{
  if (!isDragging.value || !playPointer.value)
  {
    return;
  }
  const offset = event.pageX - props.container.getBoundingClientRect().left;
  if (props.container.clientWidth - offset <= 50) {
    props.container.scrollLeft += 50;
  } else if (offset <= 50) {
    props.container.scrollLeft -= 50;
  }
  const frameIndex = getSelectFrame(props.start + offset, props.scale, props.step);
  emits('select-frame', frameIndex);
}

function onMouseUp()
{
  isDragging.value = false;
}

onMounted(() => {
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('mousemove', onMouseMove);
});
onBeforeUnmount(() => {
  document.removeEventListener('mouseup', onMouseUp);
  document.removeEventListener('mousemove', onMouseMove);
});
</script>

<style lang="scss" scoped>
  .track-play-point {
    z-index: 30;
    width: 1px;
    position: absolute;
    top: -20px;
    bottom: 0px;
    background-color: #00dfb0;
    transition-property: transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 75ms;
    cursor: pointer;
    .playpoint {
      transform: translateX(calc(-50% + 0.5px));
      display: block;
      background-color: #00dfb0;
      width: 10px;
      height: 12px;
      position: sticky;
      top: 0px;
      right: 0px;
      left: 0px;
    }
    .playpoint::after{
      content: '';
      display: block;
      width: 0px;
      height: 0px;
      border: 5px solid #00dfb0;
      position: absolute;
      top: 100%;
      left: 0px;
      border-right-color: transparent;
      border-left-color: transparent;
      border-bottom-color: transparent;
    }
  }
</style>
