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
import { computed } from 'vue';
import { getGridPixel } from '../utils/canvas';
import { ITrackClipInComponent } from '../types';

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
  return store.trackList[props.lineIndex].trackClips[props.itemIndex];
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
function initLimits(lineData: ITrackClipInComponent[], trackClipItem: ITrackClipInComponent) {
  const beforeTrack = props.itemIndex > 0 ? lineData[props.itemIndex - 1] : null;
  const afterTrack = props.itemIndex < lineData.length ? lineData[props.itemIndex + 1] : null;
  const isVA = ['video', 'audio'].includes(trackClipItem.type);
  const limitData = {
    isVA,
    start: trackClipItem.inFrame,
    end: trackClipItem.outFrame,
    offsetR: trackClipItem.offsetRight,
    offsetL: trackClipItem.offsetLeft,
    minStart: beforeTrack ? beforeTrack.outFrame : 0, // 可以调节的最小start
    maxStart: trackClipItem.outFrame - 1, // 最少要保留一帧数据
    minEnd: trackClipItem.inFrame + 1,
    maxEnd: afterTrack ? afterTrack.inFrame : (30 * 60 * 60) // 最长一小时
  };
  if (isVA) { // 音视频结尾受资源大小限制
    const frameCount = trackClipItem.frameCount || 0;
    const rightMaxWidth = (frameCount - limitData.offsetL); // 右侧最大宽度
    const leftMaxWidth = (frameCount - limitData.offsetR);// 左侧最大宽度
    limitData.maxEnd = afterTrack 
      ? (Math.min(afterTrack.inFrame, limitData.start + rightMaxWidth)) 
      : Math.min(rightMaxWidth + limitData.start, (30 * 60 * 60));

    limitData.minStart = beforeTrack 
      ? (Math.max(beforeTrack.outFrame, limitData.end - leftMaxWidth)) 
      : Math.max(limitData.end - leftMaxWidth, 0);
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
  const trackClip = store.trackList[props.lineIndex].trackClips[props.itemIndex];
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
      trackClip.offsetLeft = Math.max(offsetL + diffStart, 0);
    } else { // 其他资源操作无限制
      trackClip.frameCount = originEnd - newStart;
    }
    trackClip.inFrame = newStart;
  } else { // 右侧手柄
    let newEnd = originEnd + frameCount;
    if (newEnd > maxEnd) newEnd = maxEnd;
    if (newEnd < minEnd) newEnd = minEnd;
    if (isVA) { // 音视频的手柄操作限制在资源长度内，向内则视为资源裁切，裁切部分为 offset
      if (newEnd - originStart > rightMaxWidth) { // 音视频存在长度限制，手柄向内则截取， 向外展开截取，但是不能超过总长度
        newEnd = originStart + rightMaxWidth;
      }
      const diffEnd = newEnd - originEnd;
      trackClip.offsetRight = Math.max(offsetR - diffEnd, 0);
    } else { // 其他资源操作无限制
      trackClip.frameCount = newEnd - originStart;
    }
    trackClip.outFrame = newEnd;
  }
}

function mouseDownHandler(event: MouseEvent, type: string) {
  event.preventDefault();
  event.stopPropagation();
  playerStore.isPause = true;
  const { pageX: startX } = event;
  positionLeft = startX;
  enableMove = true;
  initLimits(store.trackList[props.lineIndex]?.trackClips || [], targetTrack.value);

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
    &:hover {
      cursor: pointer;
    }
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
