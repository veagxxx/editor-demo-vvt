<template>
  <div class="tracklist">
    <TrackIconList :list-data="showTrackList"></TrackIconList>
    <div 
      class="tracklist-timeline" 
      ref="trackListRef" 
      @scroll="handleScroll"
      @wheel="handleWheel"
      @click="setSelectTract($event, -1, -1)"
    >
      <Timeline 
        :start="startX" 
        :scale="trackScale" 
        :step="defaultFps" 
        :focus-position="focusPosition"
        @select-frame="handlerSelectFrame"
      ></Timeline>
      <div
        class="tracklist-container" 
        ref="trackListContainerRef" 
        @dragover="trackListOverHandler($event)"
        @drop="addTrack"
      >
        <template v-if="showTrackList.length === 0">
          <div class="empty-track-wrapper">
            添加素材
          </div>
        </template>
        <div
          v-else
          class="tracklist-clips-wrapper"
          :style="{ width: `${trackStyle.width}px` }"
          @click="handleMovePlayPoint"
        >
          <template v-for="(lineData, lineIndex) in showTrackList" :key="lineIndex">
            <TrackClip
              :style="{
                'margin-left': `${offset.left}px`
              }"
              :class="[dropLineIndex === lineIndex ? (insertBefore ? 'showLine-t' : 'showLine-b') : '']"
              :lineType="lineData.type"
              :isActive="store.selectTrackItem.line === lineIndex"
              :lineIndex="lineIndex"
              :isMain="lineData.mainTrack"
              :line-data="lineData.trackClips"
              @dragover="dragLineHandler($event, 'over', lineIndex)"
            />
          </template>
        </div>
        <TrackPlayPoint 
          v-show="showTrackList.length !== 0" 
          :start="startX" 
          :scale="trackScale" 
          :step="defaultFps" 
          :container="trackListRef"
          @select-frame="handlerSelectFrame"
        ></TrackPlayPoint>
        <div
          v-show="showTrackList.length !== 0 && dropItemLeft !== 0"
          class="drag-warning-line"
          :style="{ left: `${dropItemLeft}px` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import TrackIconList from './TrackIconList.vue';
import Timeline from './Timeline.vue';
import TrackClip from './TrackClip.vue';
import TrackPlayPoint from './TrackPlayPoint.vue';
import { computed, ref } from 'vue';
import { useTrackState } from '../stores/track-state';
import globalDefault from '../global-default';
import { getGridPixel, getSelectFrame } from '../utils/canvas';
import { getJsonParse } from '../utils/common';
import { usePlayerState } from '../stores/player-state';
import { formatTrackItemData } from '../utils/store';
import { debounce } from 'lodash-es';
const store = useTrackState();
const playerStore = usePlayerState();
const offset = {
  left: 10, // 容器 margin, 为了显示拖拽手柄
  right: 200
}
const trackListRef = ref();
const trackListContainerRef = ref();
const startX = ref(0 - offset.left);
const startY = ref(0); // 左侧icons对齐
const defaultFps = ref(globalDefault.track.fps); // 帧率
const dropLineIndex = ref(-1); // 目标行
const dropItemLeft = ref(0); // 目标left值
const insertBefore = ref(true); // 之前插入还是之后插入
const trackScale = computed(() => store.trackScale);
const focusPosition = computed(() => store.selectResource ? store.selectResource : undefined);

const trackStyle = computed(() => {
  return {
    width: getGridPixel(trackScale.value, playerStore.frameCount) + offset.right
  };
});

const isVaDragElement = computed(() => {
  return ['video', 'audio'].includes(store.dragData.dragType);
}); // 是否是音视频节点
const dragPoint = computed(() => store.dragData.dragPoint);

let mainIndex = ref(0); // main 行下标
const showTrackList = computed<any[]>(() => {
  const result = store.trackList.map((line, lineIndex) => {
    line.mainTrack && (mainIndex.value = lineIndex);
    const trackClips = line.trackClips.map(item => {
      return {
        ...item,
        showWidth: `${getGridPixel(trackScale.value, item.outFrame - item.inFrame)}px`,
        showLeft: `${getGridPixel(trackScale.value, item.inFrame)}px`,
      };
    });
    return {
      ...line,
      trackClips
    };
  });
  return result;
});

function handleMovePlayPoint(event: MouseEvent)
{
  const offset = event.pageX - trackListRef.value.getBoundingClientRect().left;
  const frameIndex = getSelectFrame(startX.value + offset, trackScale.value, defaultFps.value);
  handlerSelectFrame(frameIndex);
}

function setSelectTract(event: Event, line: number, index: number) {
  event.preventDefault();
  event.stopPropagation();
  store.selectTrackItem.line = line;
  store.selectTrackItem.index = index;
}

let maxDelta = 0;

const setScale = debounce(() => {
  store.trackScale -= maxDelta > 0 ? 10 : -10;
  maxDelta = 0;
}, 100);

const handleWheel = (event: WheelEvent) => {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault();
    maxDelta || (maxDelta = event.deltaY);
    setScale();
  }
};
function handleScroll() {
  const { scrollLeft, scrollTop } = trackListRef.value;
  startX.value = scrollLeft - offset.left;
  startY.value = scrollTop;
}

function handlerSelectFrame(frame: number)
{
  const playFrame = frame - 1;
  const startFrane = playFrame < 0 ? 0 : playFrame > playerStore.frameCount ? playerStore.frameCount : playFrame;
  playerStore.playStartFrame = startFrane;
  playerStore.playAudioFrame = startFrane;
}

function setDropLineLeft(event: DragEvent) {
  const trackListElement = trackListContainerRef.value as HTMLDivElement;
  const { left } = trackListElement.getBoundingClientRect();
  const { clientX } = event;
  const { x: offsetX } = dragPoint.value;
  const itemLeft = clientX - left - offsetX;
  dropItemLeft.value = itemLeft < 0 ? 0 : itemLeft;
}

function dragLineHandler(event: DragEvent, type: string, lineIndex: number) {
  let dropLineI = -1;
  if (type === 'over') {
    if (isVaDragElement.value) {
      dropLineI = (lineIndex > mainIndex.value ? lineIndex : mainIndex.value);
    } else {
      dropLineI = (lineIndex < mainIndex.value ? lineIndex : mainIndex.value);
    }
    if (dropLineI === mainIndex.value) {
      insertBefore.value = !isVaDragElement.value;
    } else {
      const dropLine = event.currentTarget as HTMLDivElement;
      const { clientHeight } = dropLine;
      const { top } = dropLine.getBoundingClientRect();
      const { clientY } = event;
      insertBefore.value = clientY - top < clientHeight / 2;
    }
    dropLineIndex.value = dropLineI;
    setDropLineLeft(event);
  }
}
function trackListOverHandler(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  setDropLineLeft(event);
}
function addTrack() {
  let dragInfo = getJsonParse(store.dragData.dataInfo);
  if (dragInfo) {
    const startFrame = getSelectFrame(dropItemLeft.value, trackScale.value, defaultFps.value);
    store.addTrack(formatTrackItemData(dragInfo, startFrame > 0 ? startFrame - 1 : 0), dropLineIndex.value, insertBefore.value, startFrame - 1);
  }
  dropLineIndex.value = -1;
  dropItemLeft.value = 0;
}
</script>

<style lang="scss" scoped>
  .tracklist {
    flex: 1;
    display: flex;
    width: 100%;
    flex-direction: row;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    .tracklist-timeline {
      flex: 1;
      flex-shrink: 0;
      flex-grow: 1;
      overflow-x: scroll;
      overflow-y: auto;
      flex-direction: column;
      position: relative;
    }
    .tracklist-container {
      position: absolute;
      top: 20px;
      display: flex;
      flex-shrink: 0;
      flex-grow: 1;
      min-width: 100%;
      min-height: calc(100% - 20px);
      .empty-track-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 96px;
        margin: auto;
        width: calc(100% * 2 / 3);
        background-color: #323232;
        border-radius: 6px;
        font-size: 14px;
        line-height: 20px;
        border: 1px dashed rgb(107 114 128);
        color: #b4b4b4;
        &:hover {
          border-color: rgb(96 165 250);
        }
      }
      .tracklist-clips-wrapper {
        z-index: 10;
        padding-top: 20px;
        padding-bottom: 20px;
        min-width: 100%;
        display: flex;
        flex-shrink: 0;
        flex-grow: 1;
        flex-direction: column;
        justify-content: center;
        min-height: 100%;
      }
      .drag-warning-line {
        z-index: 30;
        width: 1px;
        position: absolute;
        top: -20px;
        bottom: 0px;
        background-color: rgb(253 224 71);
      }
    }
  }
</style>
