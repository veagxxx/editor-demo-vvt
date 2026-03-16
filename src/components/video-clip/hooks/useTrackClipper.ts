import { MP4Clip, Combinator } from '@webav/av-cliper';
import { computed, onMounted, reactive, watch } from 'vue';
import { formatPlayerTime } from '../utils';
import { ITrackState } from '../types';
import demoUrl from '@/assets/videos/demo.mp4'

export function useTrackClipper()
{
  const trackState = reactive<ITrackState>({
    in: 0, // 当前播放位置
    start: 0, // 选择区域的起始位置
    end: 0, // 选择区域的结束位置
    duration: 0 // 视频总时长
  });

  let mp4Clip: MP4Clip;

  // 起始位置的时间字符串
  const startTimeString = computed(() =>
  {
    return formatPlayerTime(trackState.start);
  });

  // 结束位置的时间字符串
  const endTimeString = computed(() =>
  {
    return formatPlayerTime(trackState.end);
  });

  // 当前播放位置的时间字符串
  const inTimeString = computed(() =>
  {
    return formatPlayerTime(trackState.in);
  });
  // 当前视频时长（开始-结束）
  const videoRealDuration = computed(() =>
  {
    return formatPlayerTime(trackState.end - trackState.start);
  });

  watch(() => [trackState.start, trackState.end], ([start, end]) =>
  {
    trackState.in = Math.max(start, trackState.in);
    trackState.in = Math.min(end, trackState.in);
  });

  onMounted(async () => {
    const isSupported = await Combinator.isSupported();
    console.log('[is supported]', isSupported);
  })

  // 处理开始手柄移动的函数，根据鼠标拖动的位置调整选择区域的起始点
  const handleMoveStart = (offset: number, width: number) =>
  {
    offset = Math.max(offset, 0); // 限制偏移量不小于0
    // 计算新的开始位置，以防止越过结束位置
    const maxOffset = (trackState.end / trackState.duration) * width;
    offset = Math.min(offset, maxOffset); // 确保不会超过最大允许偏移量

    const rate = offset / width; // 计算偏移量在整体中的比例
    trackState.start = rate * trackState.duration; // 更新选择区域的开始和当前播放位置
  };

  // 处理结束手柄移动的函数，根据鼠标拖动的位置调整选择区域的结束点
  const handleMoveEnd = (offset: number, width: number) =>
  {
    const rate = Math.min(offset / width, 1); // 计算偏移量在整体中的比例
    trackState.end = Math.max(rate * trackState.duration, trackState.start); // 更新结束位置，并确保不小于开始位置
  };

  // 设置播放点的函数，通过点击区域内部设定新的播放起始点
  const setPlayEnterPoint = (event: MouseEvent, width: number) =>
  {
    const offsetX = event.offsetX; // 获取点击位置相对于元素的X偏移
    calcPlayLineInPoint(offsetX, width);
  };

  const calcPlayLineInPoint = (offset: number, width: number) =>
  {
    const offsetRate = offset / width; // 计算偏移量在整体中的比例
    trackState.in = offsetRate * trackState.duration; // 更新播放位置
    trackState.in = Math.max(trackState.in, trackState.start);
    trackState.in = Math.min(trackState.in, trackState.end);
  };

  const clipVideoFrame = async (videoUrl: string, duration: number) =>
  {
    const step = Math.floor((duration / 7) * 1e6);
    mp4Clip = new MP4Clip((await fetch(videoUrl)).body!);
    await mp4Clip.ready;
    const imgList = await mp4Clip.thumbnails(100, {
      step
    });
    return {
      imgList: imgList.map(it => URL.createObjectURL(it.img))
    };
  };

  const destroy = () =>
  {
    trackState.in = 0;
    trackState.start = 0;
    trackState.end = 0;
    trackState.duration = 0;
    mp4Clip?.destroy();
  };

  return {
    trackState,
    startTimeString,
    endTimeString,
    inTimeString,
    videoRealDuration,
    destroy,
    handleMoveStart,
    handleMoveEnd,
    setPlayEnterPoint,
    clipVideoFrame,
    calcPlayLineInPoint
  };
}
