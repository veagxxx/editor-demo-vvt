export function formatTimeString2Duration(timeString: string)
{
  timeString = timeString.replace('.', ':');
  const timeArray = timeString.split(':');
  const hours = parseInt(timeArray[0]) || 0;
  const minutes = parseInt(timeArray[1]) || 0;
  const seconds = parseInt(timeArray[2]) || 0;
  const milliseconds = parseInt(timeArray[3]) || 0;
  const duration = (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds * 100;
  return duration;
}

export function calcDuration2TimeString(duration: number, value: number): string
{
  const totalDuration = Math.max(+duration + value * 1000, 0);
  return formatPlayerTime(totalDuration / 1000);
}

// 格式化时间，将秒数格式化为 "MM:SS.M" 的字符串格式
export function formatPlayerTime(duration: number, withMs = true): string
{
  // 将秒数转换为毫秒数
  const totalMilliseconds = duration * 1000;

  // 计算毫秒部分（这里保留一位小数）
  const milliseconds = Math.floor(Math.floor(totalMilliseconds % 1000) / 100);

  // 计算秒数
  const seconds = Math.floor(totalMilliseconds / 1000) % 60;

  // 计算分钟数
  const minutes = Math.floor(totalMilliseconds / (1000 * 60)) % 60;

  const hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));

  // 格式化时间字符串，确保秒和分钟为两位数
  const formattedSeconds = seconds.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedHours = hours.toString().padStart(2, '0');
  // 返回格式化的时间字符串
  if (withMs)
  {
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${milliseconds}`;
  }
  else
  {
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
}
// 时间输入格式化
export function timeInputFormatter(value: string): string
{
  value = value.replace(/[^0-9]/g, '').substring(0, 7);
  const timeArr = Array.from({ length: Math.ceil(value.length / 2) }, (_, i) =>
    value.slice(i * 2, i * 2 + 2)
  );
  let result = '';
  for (let i = 0; i < timeArr.length; i++)
  {
    result += timeArr[i];
    if (i < timeArr.length - 2)
    {
      result += ':';
    }
    else if (i !== timeArr.length - 1)
    {
      result += '.';
    }
  }
  return result;
}
// 将流转成Blob格式
export async function streamToBlob(stream: ReadableStream<ArrayBuffer>, fileType: 'mp4' | 'webm' = 'mp4')
{
  return new Promise<Blob>((resolve, reject) =>
  {
    try
    {
      const chunks: ArrayBuffer[] = [];
      const reader = stream.getReader();
      function read()
      {
        reader.read().then(({ done, value }) =>
        {
          if (done)
          {
            // 当所有数据都读取完毕时，合并所有数据块为一个 Blob
            const blob = new Blob(chunks, { type: `video/${fileType}` }); // 根据实际视频格式设置 MIME 类型
            resolve(blob);
          }
          else
          {
            chunks.push(value);
            read();
          }
        }).catch(reject);
      }
      read();
    }
    catch (error)
    {
      reject(error);
    }
  });
}


// 异步获取音频或视频文件的播放长度
export function fetchMediaDuration(mediaUrl: string, type: 'audio' | 'video')
{
  return new Promise<number>((resolve, reject) =>
  {
    // 创建一个新的 Audio 或 Video 元素
    const media = document.createElement(type) as HTMLAudioElement | HTMLVideoElement;

    // 设置媒体源
    media.src = mediaUrl;

    // 加载媒体数据
    media.load();

    // 当媒体的元数据完成加载时，获取时长并解析承诺
    media.addEventListener('loadedmetadata', () =>
    {
      resolve(media.duration);
      media.remove();
    });

    // 错误处理
    media.addEventListener('error', () =>
    {
      reject(new Error(`Failed to load media ${mediaUrl}`));
      media.remove();
    });
  });
}