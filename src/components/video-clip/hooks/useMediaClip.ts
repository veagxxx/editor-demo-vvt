import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { ref } from 'vue';

interface IClipVideo
{
  videoUrl: string;
  startTime: string | number;
  duration: string | number;
  volume?: number;
}

function getBaseURL()
{
  return `${import.meta.env.VITE_PUBLIC_PATH || ''}`;
}

export function useMediaClip()
{
  let ffmpeg: FFmpeg;

  const progress = ref(0);

  const initClipper = async () =>
  {
    ffmpeg = new FFmpeg();

    ffmpeg.on('progress', ({ progress: prog }: { progress: number }) =>
    {
      console.log('progress: ', prog);
      progress.value = parseFloat((prog * 100).toFixed(2));
    });
    await ffmpeg.load({
      coreURL: await toBlobURL(`${getBaseURL()}/ffmpeg/core/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${getBaseURL()}/ffmpeg/core/ffmpeg-core.wasm`, 'application/wasm')
      // 如果需要 worker 支持，可以取消注释下面的行
      // workerURL: await toBlobURL(`${getBaseURL()}/ffmpeg/core-mt/ffmpeg-core.worker.js`, 'text/javascript')
    });
  };

  const runCommands = async (commands: string[]) =>
  {
    return await ffmpeg.exec([...commands]);
  };

  // 视频裁剪方法（支持网络地址）
  const clipVideo = async (params: IClipVideo): Promise<Blob> =>
  {
    const { videoUrl, startTime, duration, volume = 1 } = params;
    if (!ffmpeg?.loaded)
    {
      await initClipper();
    }
    // 将文件加载到FFmpeg文件系统
    const fileName = 'input.mp4'; // 你可以根据URL自定义文件名
    await ffmpeg.writeFile(fileName, await fetchFile(videoUrl));
    const outputPath = 'output.mp4';
    // 使用FFmpeg命令进行裁剪
    const command = [
      '-ss', `${startTime}`, // 将 -ss 参数放在输入文件之前以提高效率
      '-i', fileName, // 输入文件路径
      '-t', `${duration}`, // 持续时间
      '-c:v', 'copy', // 视频不重新编码
      '-af', `volume=${volume}`, // 设置音量
      '-c:a', 'aac', // 音频重新编码
      '-movflags', '+faststart', // 移动元数据到文件开头，有利于快速播放
      outputPath // 输出文件路径
    ];
    try
    {
      await runCommands(command);
      const data = await ffmpeg.readFile(outputPath);
      return new Blob([data as any], { type: 'video/mp4' });
    }
    catch (error)
    {
      console.error('Error during video clipping:', error);
      throw error;
    }
  };

  const destroyClipper = () =>
  {
    ffmpeg?.terminate();
  };

  return {
    progress,
    clipVideo,
    initClipper,
    destroyClipper
  };
}
