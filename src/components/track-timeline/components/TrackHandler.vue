<template>
  <div class="track-handler" :class="{ 'is-active': isActive }" v-show="isActive">
    <div class="track-handler--left" ref="handlerLeft" @mousedown="mouseDownHandler($event, 'left')">
      <span>|</span>
    </div>
    <div class="track-handler--right" ref="handlerRight" @mousedown="mouseDownHandler($event, 'right')">
      <span>|</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTrackState } from '../stores/track-state';
import { usePlayerState } from '../stores/player-state';
import type { TrackItem } from '../stores/track-state';
import { computed } from 'vue';
import { getGridPixel } from '../utils/canvas';

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  },
  lineIndex: {
    type: Number,
    default: 0
  },
  itemIndex: {
    type: Number,
    default: 0
  }
});
const store = useTrackState();
const playerStore = usePlayerState();
const targetTrack = computed(() => {
  return store.trackList[props.lineIndex].list[props.itemIndex];
});

// 定位数据缓存
let positionLeft = 0;
// 手柄可操作的属性配置
let handlerData = {
  isVA: false,
  start: 0,
  end: 0,
  offsetR: 0,
  offsetL: 0,
  minStart: 0,
  maxStart: 0,
  minEnd: 0,
  maxEnd: 0
};
let enableMove = false;
const frameWidth = computed(() => getGridPixel(store.trackScale, 1));
function initLimits(lineData: TrackItem[], trackItem: TrackItem) {
  const beforeTrack = props.itemIndex > 0 ? lineData[props.itemIndex - 1] : null;
  const afterTrack = props.itemIndex < lineData.length ? lineData[props.itemIndex + 1] : null;
  const isVA = ['video', 'audio'].includes(trackItem.type);
  const limitData = {
    isVA,
    start: trackItem.start,
    end: trackItem.end,
    offsetR: trackItem.offsetR,
    offsetL: trackItem.offsetL,
    minStart: beforeTrack ? beforeTrack.end : 0, // 可以调节的最小start
    maxStart: trackItem.end - 1, // 最少要保留一帧数据
    minEnd: trackItem.start + 1,
    maxEnd: afterTrack ? afterTrack.start : (30 * 60 * 60) // 最长一小时
  };
  if (isVA) { // 音视频结尾受资源大小限制
    const rightMaxWidth = (trackItem.frameCount - limitData.offsetL); // 右侧最大宽度
    const leftMaxWidth = (trackItem.frameCount - limitData.offsetR);// 左侧最大宽度
    limitData.maxEnd = afterTrack ? (Math.min(afterTrack.start, limitData.start + rightMaxWidth)) : Math.min(rightMaxWidth + limitData.start, (30 * 60 * 60));
    limitData.minStart = beforeTrack ? (Math.max(beforeTrack.end, limitData.end - leftMaxWidth)) : Math.max(limitData.end - leftMaxWidth, 0);
  }
  Object.assign(handlerData, {
    ...limitData
  });
}
function setTrackFrameData(frameCount: number, handleType: string) {
  const { isVA, start: originStart, end: originEnd, offsetR, offsetL, minStart, maxStart, minEnd, maxEnd } = handlerData;
  const originWidth = originEnd - originStart;
  const leftMaxWidth = offsetL + originWidth;
  const rightMaxWidth = offsetR + originWidth;
  if (handleType === 'left') { // 操作左侧手柄
    let newStart = originStart + frameCount;
    if (newStart > maxStart) newStart = maxStart;
    if (newStart < minStart) newStart = minStart;
    let diffStart = newStart - originStart;
    if (isVA) { // 音视频的手柄操作限制在资源长度内，向内则视为资源裁切，裁切部分为 offset
      if (originEnd - newStart > leftMaxWidth) { // 音视频存在长度限制，手柄向内则截取， 向外展开截取，但是不能超过总长度
        newStart = originEnd - leftMaxWidth;
        diffStart = newStart - originStart;
      }
      store.trackList[props.lineIndex].list[props.itemIndex].offsetL = Math.max(offsetL + diffStart, 0);
    } else { // 其他资源操作无限制
      store.trackList[props.lineIndex].list[props.itemIndex].frameCount = originEnd - newStart;
    }
    store.trackList[props.lineIndex].list[props.itemIndex].start = newStart;
  } else { // 右侧手柄
    let newEnd = originEnd + frameCount;
    if (newEnd > maxEnd) newEnd = maxEnd;
    if (newEnd < minEnd) newEnd = minEnd;
    if (isVA) { // 音视频的手柄操作限制在资源长度内，向内则视为资源裁切，裁切部分为 offset
      if (newEnd - originStart > rightMaxWidth) { // 音视频存在长度限制，手柄向内则截取， 向外展开截取，但是不能超过总长度
        newEnd = originStart + rightMaxWidth;
      }
      const diffEnd = newEnd - originEnd;
      store.trackList[props.lineIndex].list[props.itemIndex].offsetR = Math.max(offsetR - diffEnd, 0);
    } else { // 其他资源操作无限制
      store.trackList[props.lineIndex].list[props.itemIndex].frameCount = newEnd - originStart;
    }
    store.trackList[props.lineIndex].list[props.itemIndex].end = newEnd;
  }
}

function mouseDownHandler(event: MouseEvent, type: string) {
  event.preventDefault();
  event.stopPropagation();
  playerStore.isPause = true;
  const { pageX: startX } = event;
  positionLeft = startX;
  enableMove = true;
  initLimits(store.trackList[props.lineIndex]?.list || [], targetTrack.value);

  document.onmousemove = documentEvent => {
    if (!enableMove) return;
    const { pageX } = documentEvent;
    const moveWidth = positionLeft - pageX;
    const frameCount = -Math.round(moveWidth / frameWidth.value);
    setTrackFrameData(frameCount, type);
  };

  document.onmouseup = () => {
    enableMove = false;
    document.onmouseup = null;
    document.onmousemove = null;
  };
}
</script>

<style lang="scss" scoped>
  .track-handler {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    border: 1px solid #fff;
    z-index: 20;
    &.is-active {
      border-color: rgb(243 244 246);
    }
    &--left {
      cursor: col-resize;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: absolute;
      top: -1px;
      bottom: -1px;
      left: -8px;
      text-align: center;
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      width: 8px;
      background-color: rgb(243 244 246);;
      color: rgb(31 41 55);
    }
    &--right {
      cursor: col-resize;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: absolute;
      top: -1px;
      bottom: -1px;
      right: -8px;
      text-align: center;
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
      width: 8px;
      background-color: rgb(243 244 246);
      color: rgb(31 41 55);
    }
  }
</style>
