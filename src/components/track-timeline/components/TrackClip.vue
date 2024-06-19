<template>
  <div 
    class="trackclips"
    :class="[isActive ? 'is-active' : '', isMain ? 'is-main' : '']"
    :style="{ height: `${TrackHeightMap.get(lineType)}px` }"
  >
    <template v-for="(item, index) in lineData" :key="item.id">
      <TrackClipItem 
        :lineIndex="lineIndex" 
        :itemIndex="index" 
        :trackItem="item" 
        draggable="true"
        @dragstart="dragLineHandler($event, 'start', lineIndex, index, item.type)" 
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { TrackHeightMap } from '../data/track-config';
import { TrackItemExt, useTrackState } from '../stores/track-state';
import { computed, PropType } from 'vue';
import TrackClipItem from './TrackClipItem.vue';
import { usePlayerState } from '../stores/player-state';
const props = defineProps({
  isMain: {
    type: Boolean,
    default: false
  },
  lineType: {
    type: String,
    default: ''
  },
  lineIndex: {
    type: Number,
    default: 0
  },
  lineData: {
    type: Array as PropType<TrackItemExt[]>,
    default() {
      return [];
    }
  }
});
const playerStore = usePlayerState();
const store = useTrackState();
const isActive = computed(() => {
  return store.selectTrackItem.line === props.lineIndex;
});
function dragLineHandler(event: DragEvent, type: string, lineIndex: number, index: number, dragType: string) {
  if (type === 'start') {
    playerStore.isPause = true;
    store.dragData.dataInfo = JSON.stringify(store.trackList[lineIndex].trackClips[index]);
    store.dragData.dragType = dragType;
    store.dragData.dragPoint.x = event.offsetX;
    store.dragData.dragPoint.y = event.offsetY;
    store.moveTrackData.lineIndex = lineIndex;
    store.moveTrackData.itemIndex = index;
    store.selectTrackItem.line = -1;
    store.selectTrackItem.index = 0;
  }
}
</script>

<style lang="scss" scoped>
  .trackclips {
    position: relative;
    margin-left: 8px;
    margin-bottom: 4px;
    margin-top: 4px;
    &.is-active {
      background-color: rgb(243 244 246 / 0.2);
    }
    &.is-main {
      background-color: #323232;
    }
  }
  .showLine-t::after {
    content: '';
    display: block;
    position: absolute;
    top: 1px;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #FCD34D;
    z-index: 30;
  }

  .showLine-b::before {
    content: '';
    display: block;
    position: absolute;
    bottom: 1px;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #FCD34D;
    z-index: 30;
  }
</style>