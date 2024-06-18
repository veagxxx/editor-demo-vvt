import { getId } from './common';
import globalDefault from '../global-default';
import { ITrackClipInComponent } from '../types';

const baseFps = globalDefault.track.fps;
/**
 * 格式化 Track Data 补充id 和起始坐标
 * @param itemData 接口节点数据
 * @param startFrame 当前播放指针位置
 * */
export function formatTrackItemData(itemData: Record<string, any>, startFrame: number): ITrackClipInComponent {
  let { duration, type, frameCount, offsetLeft = 0, offsetRight = 0, inFrame = 0, outFrame = 0, id = getId() } = itemData;
  if (type === 'video') {
    duration = frameCount ? frameCount / baseFps : duration;
  } else {
    frameCount = baseFps * duration;
  }
  let originWidth = (inFrame === 0 && outFrame === 0) ? frameCount : (outFrame - inFrame);
  let endFrame = startFrame + originWidth;
  const trackItemData = {
    ...itemData,
    id,
    // in: transferFrame2time(startFrame, itemData.fps),
    // out: transferFrame2time(endFrame, itemData.fps),
    inFrame: startFrame,
    outFrame: endFrame,
    offsetLeft,
    offsetRight,
    duration,
    frameCount
  };
  return trackItemData as ITrackClipInComponent;
}

/**
 * 检查 checkItem 是否与当前 trackList 存在帧重叠部分
 * */
export function checkTrackListOverlap(trackList: ITrackClipInComponent[], checkItem: ITrackClipInComponent, moveIndex = -1) {
  const { inFrame: insertStart, outFrame: insertEnd } = checkItem;
  let overLapIndex = -1;
  let insertIndex = 0;
  const hasOverlap = trackList.some((trackItem, index) => {
    if (moveIndex !== -1 && index === moveIndex) { // 行内移动情况下忽略掉移动元素
      return false;
    }
    const { inFrame, outFrame } = trackItem;
    // 当前列表中元素 开始帧处于新元素内部，或结束帧处于新元素内部，则视为重叠
    if (
      (inFrame <= insertStart && outFrame >= insertEnd) // 添加节点的开始和结束位置位于老节点外 或 两端相等
      || (inFrame >= insertStart && inFrame < insertEnd) // 老节点开始位置在添加节点内部
      || (outFrame > insertStart && outFrame <= insertEnd) // 老节点结束位置在添加节点内部
    ) {
      overLapIndex = index;
      return true;
    } else {
      if (outFrame <= insertStart) {
        insertIndex = index + 1;
      }
      return false;
    }
  });
  return {
    hasOverlap,
    overLapIndex,
    insertIndex
  };
}
