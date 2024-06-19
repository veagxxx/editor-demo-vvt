<template>
  <div
    class="trackclip-item"
    :class="[isDragState ? 'is-dragstate' : '']"
    :style="itemClass"
    @click="setSelectTract"
  >
    <!-- 操作手柄 -->
    <TrackHandler :isActive="isActive" :lineIndex="lineIndex" :itemIndex="itemIndex" />
    <!-- 容器 -->
    <component
      :is="componentMap.get(trackItem.type)"
      :trackItem="trackItem"
    />
    <div class="trackclip-item--info" v-show="isActive">
      <div class="clip-name">{{ trackItem.name }}</div>
      <div class="clip-time">{{ displayDuration }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TrackHandler from './TrackHandler.vue';
import VideoItem from './template/VideoItem.vue';
import AudioItem from './template/AudioItem.vue';
import { TrackHeightMap } from '../data/track-config';
import { useTrackState } from '../stores/track-state';
import { computed } from 'vue';
import { formatPlayerTime } from '../utils/common';
const props = defineProps({
  trackType: {
    type: String,
    default: ''
  },
  lineIndex: {
    type: Number,
    default: 0
  },
  itemIndex: {
    type: Number,
    default: 0
  },
  trackItem: {
    type: Object,
    default() {
      return {
        width: '0px',
        left: '0px'
      };
    }
  }
});
const store = useTrackState();
const displayDuration = computed(() => {
  return formatPlayerTime(props.trackItem.outFrame - props.trackItem.inFrame);
});
const itemClass = computed(() => {
  return {
    width: props.trackItem.showWidth,
    height: TrackHeightMap.get(props.trackItem.type) + 'px',
    left: props.trackItem.showLeft
  };
});
const isActive = computed(() => {
  return store.selectTrackItem.line === props.lineIndex && store.selectTrackItem.index === props.itemIndex;
});
const componentMap = new Map<string, any>([
  ['video', VideoItem],
  ['audio', AudioItem],
]);
const isDragState = computed(() => {
  return store.moveTrackData.lineIndex === props.lineIndex && store.moveTrackData.itemIndex === props.itemIndex;
});
function setSelectTract(event: Event) {
  event.preventDefault();
  event.stopPropagation();
  store.selectTrackItem.line = props.lineIndex;
  store.selectTrackItem.index = props.itemIndex;
}
</script>
<style lang="scss" scoped>
  .trackclip-item {
    position: absolute;
    text-align: left;
    font-size: 14px;
    top: 0px;
    color: #b4b4b4;
    &.is-dragstate {
      opacity: 0.3;
    }
    .trackclip-item--info {
      position: absolute;
      top: -22px;
      font-size: 12px;
      height: 18px;
      z-index: 99;
      display: flex;
      gap: 6px;
      & > div {
        white-space: nowrap;
        background-color: #3c3c3c;
        padding: 2px 4px;
        border-radius: 4px;
        height: 100%;
      }
    }
  }
</style>
