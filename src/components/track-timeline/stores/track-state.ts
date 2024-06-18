import { ref, watchEffect, reactive, computed } from 'vue';
import { defineStore } from 'pinia';
import globalDefault from '../global-default';
// import { checkTrackListOverlap } from '@/utils/storeUtil';
// import { useTrackAttrState } from '@/stores/trackAttribute';
import { getJsonParse } from '../utils/common';
import { useTrackAttrState } from './track-attribute';
import { checkTrackListOverlap } from '../utils/store';
import { ITimelineInComponent, ITrackClipInComponent } from '../types';

export type TrackType = 'video' | 'audio' | 'text' | 'image' | 'effect' | 'transition' | 'filter';
interface BaseTractItem {
  id: string,
  type: TrackType,
  name: string,
  start: number,
  end: number,
  frameCount: number,
  offsetL: number, // 音视频左侧裁切
  offsetR: number, // 音视频右侧裁切
  showWidth?: string;
  showLeft?: string;
}
export interface VideoTractItem extends BaseTractItem {
  time: number,
  format: string,
  source: string,
  cover: string,
  width: number,
  height: number,
  fps: number
}

export interface AudioTractItem extends BaseTractItem {
  time: number,
  format: string,
  source: string
  cover: string
}

export interface TextTractItem extends BaseTractItem {
  cover: string,
  templateId: number
}

export interface ImageTractItem extends BaseTractItem {
  source: string,
  format: string,
  width: number,
  height: number,
  sourceFrame: number,
  cover: string
}

export interface EffectTractItem extends BaseTractItem {
  templateId: number,
  cover: string
}

export interface TransitionTractItem extends BaseTractItem {
  templateId: number,
  cover: string
}

export interface FilterTractItem extends BaseTractItem {
  templateId: number,
  cover: string
}

export type TrackItem = VideoTractItem | AudioTractItem | TextTractItem | ImageTractItem | EffectTractItem | TransitionTractItem | FilterTractItem;

export interface TrackLineItem {
  type: TrackItem['type'],
  main?: boolean,
  list: TrackItem[]
}

export type TrackItemExt = TrackItem & {
  showWidth: string;
  showLeft: string;
  time: number | string;
}

export interface TrackLineItemExt {
  type: TrackItemExt['type'],
  main?: boolean,
  list: TrackItemExt[];
}

const mockList = [
  {
    "type": "video",
    "main": true,
    "list": [
      {
        "type": "video",
        "name": "video_1",
        "format": "mp4",
        "cover": "/image/video/video_1.png",
        "source": "/video/video_1.mp4",
        "width": 1232,
        "height": 720,
        "fps": 30,
        "frameCount": 712,
        "time": 23733,
        "main": false,
        "id": "t-5f711984-9383",
        "start": 0,
        "end": 712,
        "offsetL": 0,
        "offsetR": 0
      }
    ]
  },
  {
    "type": "audio",
    "list": [
      {
        "type": "audio",
        "cover": "/image/audio/audio_0.png",
        "time": 25000,
        "format": "mp3",
        "name": "测试音频1",
        "source": "/audio/audio_0.mp3",
        "main": false,
        "id": "t-8cfc2b04-cde2",
        "start": 0,
        "end": 750,
        "offsetL": 0,
        "offsetR": 0,
        "frameCount": 750,
      }
    ]
  }
]

export const useTrackState = defineStore('trackState', () => {
  const attrStore = useTrackAttrState();
  const dragData = reactive({ // 拖拽数据
    dataInfo: '',
    dragType: '',
    dragPoint: {
      x: 0,
      y: 0
    }
  });
  const moveTrackData = reactive({ // 行内移动
    lineIndex: -1,
    itemIndex: -1
  });
  // 轨道放大比例
  const trackScale = ref(parseInt(localStorage.trackS) || globalDefault.track.scale);
  const localList = localStorage.trackList && getJsonParse(localStorage.trackList).legnth && getJsonParse(localStorage.trackList);
  const trackList = ref<ITimelineInComponent[]>(localList ? localList : []);
  // const timeline = reactive<ITimelineInComponent[]>([]);

  // 选中元素坐标
  const selectTrackItem = reactive({
    line: -1,
    index: -1
  });
  // 选中元素
  const selectResource = computed(() => {
    if (selectTrackItem.line === -1) {
      return null;
    }
    return trackList.value[selectTrackItem.line]?.trackClips[selectTrackItem.index] || null;
  });

  function setTrackList(timeline: ITimelineInComponent[], cover: boolean = true)
  {
    trackList.value = cover ? timeline : [...trackList.value, ...timeline];
    localStorage.trackList = JSON.stringify(trackList);
  }

  // 删除元素
  function removeTrack(lineIndex: number, itemIndex: number, removeAttr = true) {
    const removeItem = trackList.value[lineIndex].trackClips[itemIndex];
    trackList.value[lineIndex].trackClips.splice(itemIndex, 1);
    if (trackList.value[lineIndex].trackClips.length === 0 && !trackList.value[lineIndex].mainTrack) {
      trackList.value.splice(lineIndex, 1);
    }
    if (trackList.value.length === 1 && trackList.value[0].trackClips.length === 0) {
      trackList.value.splice(0, 1);
    }
    removeAttr && attrStore.deleteTrack(removeItem.id);
  }
  // 复用已有行
  function insertExistingLine(item: ITrackClipInComponent, insertLine: { line: number, index: number }) {
    trackList.value[insertLine.line].trackClips.splice(insertLine.index, 0, item);
    selectTrackItem.line = insertLine.line;
    selectTrackItem.index = insertLine.index;
  }
  // 插入新行
  function insertNewLine(item: ITrackClipInComponent) {
    const isVA = ['video', 'audio'].includes(item.type);
    trackList.value[isVA ? 'push' : 'unshift']({
      type: item.type,
      trackClips: [item]
    });
    selectTrackItem.line = isVA ? trackList.value.length - 1 : 0;
    selectTrackItem.index = 0;
  }
  // 移动目标行
  function moveTargetLine(item: ITrackClipInComponent, insertLine: { line: number, index: number }) {
    let { lineIndex: moveLineIndex = -1, itemIndex: moveIndex = -1 } = moveTrackData;
    trackList.value[insertLine.line].trackClips.splice(insertLine.index, moveLineIndex === insertLine.line ? 1 : 0, item);
    if (moveLineIndex !== -1 && insertLine.line !== moveLineIndex) {
      if (trackList.value[moveLineIndex].trackClips.length === 1 && insertLine.line > moveLineIndex) {
        insertLine.line--; // 如果在移除元素前面插入，选中元素列上移
      }
      removeTrack(moveLineIndex, moveIndex, false);
    }
    selectTrackItem.line = insertLine.line;
    selectTrackItem.index = moveLineIndex === -1 ? insertLine.index + 1 : insertLine.index;
  }
  // 目标行不可用，则移动到目标之后、之前
  function moveLine(item: ITrackClipInComponent, targetLineIndex: number) {
    let { lineIndex: moveLineIndex = -1, itemIndex: moveIndex = -1 } = moveTrackData;
    trackList.value.splice(targetLineIndex, 0, {
      type: item.type,
      trackClips: [item]
    });
    if (moveLineIndex !== -1 && moveIndex !== -1) { // 移动到新行，删除老数据
      if (targetLineIndex < moveLineIndex) {
        moveLineIndex++; // 如果在移除元素前面插入，则移除下标自增
      }
      if (trackList.value[moveLineIndex].trackClips.length === 1 && targetLineIndex > moveLineIndex) {
        targetLineIndex--; // 如果在移除元素前面插入，选中元素列上移
      }
      removeTrack(moveLineIndex, moveIndex, false);
    }
    selectTrackItem.line = targetLineIndex;
    selectTrackItem.index = 0;
  }
  function selectTrackById(id: string) {
    trackList.value.forEach((item, index) => {
      item.trackClips.forEach((trackItem, trackIndex) => {
        if (trackItem.id === id) {
          selectTrackItem.line = index;
          selectTrackItem.index = trackIndex;
        }
      });
    });
  }
  // 新增元素
  function addTrack(item: ITrackClipInComponent, lineIndex = -1, insertBefore = true, index = 0) {
    const { type } = item;
    const isVA = ['video', 'audio'].includes(type);
    let { lineIndex: moveLineIndex = -1, itemIndex: moveIndex = -1 } = moveTrackData;
    // 插入main
    if (trackList.value.length === 0) {
      trackList.value.push({
        type: 'video',
        mainTrack: true,
        trackClips: []
      });
    }

    let canInsertLines = []; // 可以承载新元素的行与下标
    // 找到最近的一个当前类型轨道, 使用 insertIndex 保持数组与实际顺序一致, 使用倒序从距离主轨道最近的轨道开始添加
    let startIndex = isVA ? 0 : trackList.value.length - 1;
    for (let i = startIndex; (isVA ? i < trackList.value.length : i > -1); isVA ? i++ : i--) {
      const lineData = trackList.value[i];
      const { hasOverlap, insertIndex } = checkTrackListOverlap(lineData.trackClips, item, moveLineIndex === i ? moveIndex : -1);
      if (lineData.type === type && !hasOverlap) { // 存在可复用行
        canInsertLines.push({
          line: i,
          index: insertIndex
        });
      }
    }
    if (lineIndex !== -1) { // 指定行插入, 注意轨道渲染顺序 0 在最上方
      let targetLineIndex = insertBefore ? lineIndex : lineIndex + 1;
      let insertLine = canInsertLines.find(canInsItem => canInsItem.line === lineIndex);
      if (insertLine) { // 目标行可插入
        moveTargetLine(item, insertLine);
      } else {
        moveLine(item, targetLineIndex);
      }
    } else if (canInsertLines.length > 0) { // 左侧列表添加，可复用现有同类型行内空隙
      insertExistingLine(item, canInsertLines[0]);
    } else { // 开新行插入
      insertNewLine(item);
    }
    moveTrackData.lineIndex = -1;
    moveTrackData.itemIndex = -1;
    attrStore.initTrackAttr(item.id);
  }

  watchEffect(() => {
    localStorage.trackS = trackScale.value;
  });
  watchEffect(() => {
    localStorage.trackList = JSON.stringify(trackList.value);
  });
  return {
    moveTrackData,
    selectTrackItem,
    selectResource,
    trackScale,
    trackList,
    addTrack,
    selectTrackById,
    removeTrack,
    dragData,
    setTrackList
  };
});
