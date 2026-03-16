<template>
  <div class="video-player">
    <video ref="videoRef" :src="demoUrl" muted></video>
  </div>
  <div class="video-track">
    <!-- 视频帧列表 -->
    <div ref="selectionRef" v-loading="frameLoading" class="video-track__selection">
      <!-- 选择区域的内层，用于显示选择的音频区间 -->
      <div class="video-track__selection-inner" @mousedown="onSelectionMouseDown" @touchmove.stop.prevent="onSelectionMove" @touchend="onSelectionMoveEnd" />
      <!-- 播放线 -->
      <div class="video-track__play-line" :style="playLineStyle" @mousedown="onPlayLinePick" @touchmove.stop.prevent="onTouchMove" @touchend.stop.prevent="onPlayLineMoveEnd" />
      <!-- 开始手柄 -->
      <div class="video-track__handle-start" :style="handlerStyle.start" @mousedown="onStartMouseDown" @touchmove.stop.prevent="onStartTouchMove">
 
      </div>
      <!-- 结束手柄 -->
      <div class="video-track__handle-end" :style="handlerStyle.end" @mousedown="onEndMouseDown" @touchmove.stop.prevent="onEndTouchMove">
        <div class="video-duration">{{ playedTimeString }}</div>
      </div>
      <!-- 边框 -->
      <view class="video-track__selection-border" :style="maskStyle.border"></view>
      <!-- 视频帧遮罩 -->
      <div class="video-track__selection-mask" :style="maskStyle.left" />
      <div class="video-track__selection-mask" :style="maskStyle.right" />
      <!-- 视频帧 -->
      <div class="video-track__frame-list">
        <img v-for="(url, index) in data.imageList" :key="`url_${index}`" class="image-item" :src="url">
      </div>
    </div>
  </div>

  <el-button type="primary" @click="onTestClip">裁剪</el-button>
  <el-button type="primary" @click="onPlayVideo">播放</el-button>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue';
// import { ITrackState } from './types';
import { useTrackClipper } from './hooks/useTrackClipper';
import { fetchMediaDuration, formatPlayerTime } from './utils';
import demoUrl from '@/assets/videos/demo.mp4';
import { useMediaClip } from './hooks/useMediaClip';
import { ElMessage } from 'element-plus';

interface IData
{
  imageList: string[]; // 图片列表
  frameLoading: boolean; // 是否正在加载帧
  volume: number; // 视频音量
}

interface IProps
{
  fps?: number;
}

const {
  trackState,
  destroy: trackDestroy,
  handleMoveStart,
  handleMoveEnd,
  setPlayEnterPoint,
  calcPlayLineInPoint
} = useTrackClipper();


const { clipVideo, initClipper } = useMediaClip();

const emit = defineEmits<{
  (e: 'pause'): void;
  (e: 'play', val: number): void;
  (e: 'preview', val: number): void;
  (e: 'volume-change', val: number): void;
}>();

const props = withDefaults(defineProps<IProps>(), {
  fps: 30
});

const isPlaying = defineModel('isPlaying', {
  type: Boolean,
  default: false
});
const frameLoading = defineModel('frameLoading', {
  type: Boolean,
  default: false
});

const selectionRef = ref<HTMLElement>();

const videoRef = ref<HTMLVideoElement>();

const isDragging = ref<boolean>(false); // 标记是否正在拖动

const data = reactive<IData>({
  frameLoading: false,
  volume: 100,
  imageList: []
});

const playedTimeString = computed(() =>
{
  return formatPlayerTime((trackState.end - trackState.start), false);
});

const playLineStyle = computed(() =>
{
  const width = selectionRef.value?.offsetWidth || 0;
  const left = (trackState.in / trackState.duration) * width || 0;
  return {
    left: '-1px',
    transform: `translate3d(${left}px, 0px, 0px)`
  };
});

// 计算选择区域开始和结束手柄的样式，根据trackState动态调整位置
const handlerStyle = computed(() =>
{
  const width = selectionRef.value?.offsetWidth || 0;
  const left = (trackState.start / trackState.duration) * width || 0;
  const right = width - (trackState.end / trackState.duration) * width || 0;
  return {
    start: {
      left: `${left - 12}px`
    },
    end: {
      right: `${right - 12}px`
    }
  };
});

const maskStyle = computed(() =>
{
  const width = selectionRef.value?.offsetWidth || 0;
  const left = (trackState.start / trackState.duration) * width || 0;
  const right = (trackState.duration - trackState.end) / trackState.duration * width || 0;
  const borderBoxWidth = Math.max(width - left - right, 0);
  return {
    left: {
      width: `${left}px`
    },
    right: {
      right: '0px',
      width: `${right}px`
    },
    border: {
      left: `${left - 2}px`,
      right: `${right - 2}px`,
      width: `${borderBoxWidth + 4}px`
    }
  };
});

onMounted(() => {
  init(demoUrl)
})

async function init(videoUrl: string)
{
  try {
    frameLoading.value = true;
    const duration = await fetchMediaDuration(videoUrl, 'video');
    console.log(['duration'], duration);
    // // 获取缩略图
    // const { imgList } = await clipVideoFrame(videoUrl, duration);
    setDuration(duration);
    // data.imageList = imgList;
    frameLoading.value = false;
    // return { volume: data.volume };
  } catch (error) {
    console.error(error);
  }
}

async function onTestClip()
{
  await initClipper();
  const duration = trackState.end - trackState.start;
  const blob = await clipVideo({ 
    duration,
    videoUrl: demoUrl,
    startTime: trackState.start
  });
  ElMessage.success('成功')
  console.log('[blob]', URL.createObjectURL(blob));
}

// 设置音轨的总时长，并初始化选择区域的起止点
function setDuration(duration: number)
{
  if (isPlaying.value)
  {
    return;
  }
  trackState.duration = duration;
  trackState.end = duration;
  trackState.start = 0;
  trackState.in = 0;
}

function onSelectionMouseDown(event: MouseEvent)
{
  event.preventDefault();
  event.stopPropagation();
  if (!trackState.duration || isPlaying.value || frameLoading.value || ((trackState.end - trackState.start) === trackState.duration))
  {
    return;
  }
  isDragging.value = true;
  const { pageX: startX } = event;
  const width = selectionRef.value?.offsetWidth || 0;
  const orgStartTime = trackState.start;
  const orgEndTime = trackState.end;
  const left = (trackState.start / trackState.duration) * width;
  const right = (trackState.duration - trackState.end) / trackState.duration * width || 0;
  const borderBoxWidth = Math.max(width - left - right, 0);
  console.log('[click]', startX, left, borderBoxWidth);
  if (startX < left || startX > right) {
    return;
  }
  // 移动前的结束位置
  document.onmousemove = (documentEvent) => {
    if (!isDragging.value) {
      return;
    }
    const { pageX } = documentEvent;
    const deltaX = pageX - startX;
    // 将像素增量转换为时间增量
    const deltaTime = (deltaX / width) * trackState.duration;
    let newStart = orgStartTime + deltaTime;
    let newEnd = orgEndTime + deltaTime;
    // 边界检查
    if (newStart < 0) {
      newStart = 0;
      newEnd = newStart + (orgEndTime - orgStartTime);
    }
    if (newEnd > trackState.duration) {
      newEnd = trackState.duration;
      newStart = newEnd - (orgEndTime - orgStartTime);
    }
    trackState.start = newStart;
    trackState.end = newEnd;
  };
  document.onmouseup = () => {
    emit('preview', trackState.in);
    isDragging.value = false;
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

let orgStartTime = -1; // 记录移动前的开始时间（时间单位）
let orgEndTime = -1; // 记录移动前的结束时间（时间单位）
let orgPageX = -1; // 记录初始触摸位置
function onSelectionMove(event: TouchEvent) {
  if (!trackState.duration || isPlaying.value || frameLoading.value || 
      ((trackState.end - trackState.start) === trackState.duration)) {
    return;
  }
  const touches = event.touches[0] || event.changedTouches[0];
  const width = selectionRef.value?.offsetWidth || 0;
  // 初始化记录
  if (orgPageX === -1) {
    orgPageX = touches.pageX;
    orgStartTime = trackState.start;
    orgEndTime = trackState.end;
  }
  const orgStartPos = orgStartTime / trackState.duration * width;
  const orgEndPos = orgEndTime / trackState.duration * width;
  if (orgPageX < orgStartPos || orgPageX > orgEndPos) {
    return;
  }
  const deltaX = touches.pageX - orgPageX;
  // 将像素增量转换为时间增量
  const deltaTime = (deltaX / width) * trackState.duration;
  let newStart = orgStartTime + deltaTime;
  let newEnd = orgEndTime + deltaTime;
  // 边界检查
  if (newStart < 0) {
    newStart = 0;
    newEnd = newStart + (orgEndTime - orgStartTime);
  }
  if (newEnd > trackState.duration) {
    newEnd = trackState.duration;
    newStart = newEnd - (orgEndTime - orgStartTime);
  }
  trackState.start = newStart;
  trackState.end = newEnd;
}

function onSelectionMoveEnd()
{
  orgStartTime = -1;
  orgEndTime = -1; 
  orgPageX = -1;
}

// 开始手柄的鼠标按下事件处理，用于调整选择区域的起始位置
function onStartMouseDown(event: MouseEvent)
{
  event.preventDefault();
  event.stopPropagation();
  if (!trackState.duration || isPlaying.value || frameLoading.value)
  {
    return;
  }
  const width = selectionRef.value?.offsetWidth || 0;
  isDragging.value = true;
  const { pageX: startX } = event;
  const offsetStart = (trackState.start / trackState.duration) * width;
  document.onmousemove = (documentEvent) =>
  {
    if (!isDragging.value)
    {
      return;
    }
    const { pageX } = documentEvent;
    const moveWidth = pageX - startX + offsetStart;
    handleMoveStart(moveWidth, width);
  };

  document.onmouseup = () =>
  {
    emit('preview', trackState.in);
    isDragging.value = false;
    document.onmouseup = null;
    document.onmousemove = null;
  };
}

function onStartTouchMove(event: TouchEvent)
{
  if (!trackState.duration || isPlaying.value || frameLoading.value)
  {
    return;
  }
  const touches = event.touches[0] || event.changedTouches[0];
  const left = selectionRef.value?.getBoundingClientRect().left || 0;
  const width = selectionRef.value?.offsetWidth || 0;
  isDragging.value = true;
  const { pageX } = touches;
  const moveWidth = pageX - left;
  handleMoveStart(moveWidth, width);
}

// 结束手柄的鼠标按下事件处理，用于调整选择区域的结束位置
function onEndMouseDown(event: MouseEvent)
{
  event.preventDefault();
  event.stopPropagation();
  if (!trackState.duration || isPlaying.value || frameLoading.value)
  {
    return;
  }
  const width = selectionRef.value?.offsetWidth || 0;
  isDragging.value = true;
  const { pageX: startX } = event;
  // 移动前的结束位置
  const endOffset = ((trackState.duration - trackState.end) / trackState.duration) * width;
  console.log('[end]', endOffset);
  document.onmousemove = (documentEvent) =>
  {
    if (!isDragging.value)
    {
      return;
    }
    const { pageX } = documentEvent;
    const moveWidth = startX - pageX;
    const offsetWidth = Math.min(width - endOffset - moveWidth, width);
    handleMoveEnd(offsetWidth, width);
  };

  // 鼠标释放后取消拖动操作
  document.onmouseup = () =>
  {
    emit('preview', trackState.in);
    isDragging.value = false;
    document.onmouseup = null;
    document.onmousemove = null;
  };
}

function onEndTouchMove(event: TouchEvent)
{
  if (!trackState.duration || isPlaying.value || frameLoading.value)
  {
    return;
  }
  const left = selectionRef.value?.getBoundingClientRect().left || 0;
  const width = selectionRef.value?.offsetWidth || 0;
  const touches = event.touches[0] || event.changedTouches[0];
  const { pageX } = touches;
  const moveWidth = pageX - left;
  handleMoveEnd(moveWidth, width);
}

function onPlayLinePick()
{
  if (isPlaying.value || frameLoading.value)
  {
    return;
  }
  document.onmousemove = (documentEvent) =>
  {
    const { pageX } = documentEvent;
    const width = selectionRef.value?.offsetWidth || 0;
    const moveWidth = pageX - selectionRef.value!.getBoundingClientRect().left;
    calcPlayLineInPoint(moveWidth, width);
  };

  // 鼠标释放后取消拖动操作
  document.onmouseup = () =>
  {
    emit('preview', trackState.in);
    document.onmouseup = null;
    document.onmousemove = null;
  };
}

function onTouchMove(event: TouchEvent) {
  const touches = event.touches[0] || event.changedTouches[0];
  const { pageX } = touches;
  const width = selectionRef.value?.offsetWidth || 0;
  const moveWidth = pageX - selectionRef.value!.getBoundingClientRect().left;
  calcPlayLineInPoint(moveWidth, width);
};

function onPlayLineMoveEnd()
{
  console.log('[play line end]');
  emit('preview', trackState.in);
  setCurrentTime();
}

// function onSelectionClick(event: MouseEvent)
// {
//   if (isPlaying.value || frameLoading.value)
//   {
//     return;
//   }
//   setPlayEnterPoint(event, selectionRef.value!.offsetWidth);
//   emit('preview', trackState.in);
//   setCurrentTime();
// }

function setCurrentTime()
{
  if (videoRef.value) {
    videoRef.value.currentTime = trackState.in;
  }
}

// function onSetTrackState<T extends keyof ITrackState>(key: T, value: ITrackState[T])
// {
//   trackState[key] = value;
//   emit('preview', trackState.in);
// }
let animateId: any;
function onPlayVideo()
{
  if (isPlaying.value) {
    onPauseVideo();
    return;
  }
  if (!trackState.duration || !videoRef.value)
  {
    return;
  }
  isPlaying.value = true;
  if (trackState.in >= trackState.end)
  {
    trackState.in = trackState.start;
  }
  videoRef.value.currentTime = trackState.in;
  videoRef.value.play();
  emit('play', trackState.in);
  animateId = setInterval(() =>
  {
    trackState.in += (1000 / props.fps) / 1000;
    if (trackState.in >= trackState.end)
    {
      trackState.in = trackState.end;
      onPauseVideo();
      onPlayVideo();
    }
  }, 1000 / props.fps);
}
function onPauseVideo()
{
  animateId && clearInterval(animateId);
  isPlaying.value = false;
  videoRef.value?.pause();
  emit('pause');
}

function destroy()
{
  data.imageList = [];
  onPauseVideo();
  trackDestroy();
}

defineExpose({ init, destroy, trackState });
</script>

<style lang="scss" scoped>
.video-player {
  width: 100%;
  padding-inline: 12px;
  padding-bottom: 12px;
  video {
    width: 100%;
  }
}
.video-track {
  width: 100%;
  position: relative;
  padding-inline: 12px;
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none;
  user-select: none;
  &__selection {
    width: 100%;
    background-color: var(--el-fill-color-dark);
    position: relative;
    height: 70px;
    cursor: pointer;
    &-inner {
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      z-index: 10;
    }
    &-mask {
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: rgba(#000, 0.5);
      z-index: 2;
    }
    &-border {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      box-shadow: 0 0 0 2px #626aef inset;
      box-sizing: border-box;
      pointer-events: none;
      z-index: 5;
    }
    .video-track__frame-list {
      width: 100%;
      height: 100%;
      display: flex;

      align-items: center;
      user-select: none;
      overflow: hidden;
      .image-item {
        flex: 1;
        min-width: 100px;
        height: 100%;
        position: relative;
        object-fit: cover;
      }
    }
  }
  &__play-line {
    position: absolute;
    height: 100%;
    width: 2px;
    background-color: rgba($color: #fff, $alpha: 80%);
    z-index: 10;
    will-change: transform;
    &::before {
      content: "";
      position: absolute;
      top: -7px;
      left: 50%;
      width: 0;
      height: 0;
      transform: translate(-50%);
      border-top: 8px solid #fff;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-radius: 2px;
      cursor: pointer;
    }
  }
  &__handle-start {
    position: absolute;
    left: -12px;
    top: 0;
    width: 12px;
    height: 100%;
    background-color: #626aef;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    cursor: e-resize;
    z-index: 100;
    &:hover {
      >.handle {
        color: var(--el-color-primary);
      }
    }
    >.handle {
      font-size: 20px;
      color: var(--el-fill-color-dark);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    &::after {
      content: attr(data-content);
      position: absolute;
      bottom: -24px;
      left: -30px;
      font-size: 14px;
      width: 60px;
      line-height: 20px;
      border-radius: 8px;
      color: #fff;
    }
  }
  &__handle-end {
    position: absolute;
    right: -12px;
    top: 0;
    width: 12px;
    height: 100%;
    background-color: #626aef;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    cursor: e-resize;
    z-index: 100;
    .video-duration {
      position: absolute;
      top: -14px;
      left: -36px;
      font-size: 12px;
      color: var(--el-text-color-regular);
    }
  }
}
</style>
