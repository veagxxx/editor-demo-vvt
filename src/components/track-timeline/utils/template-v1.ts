import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { reactive, ref, watch } from "vue";
import { FileTypeMap } from './constants';
import { TrackItem } from '../stores/track-state';
import { Command } from './ffmpeg-command';

interface RunTask {
  instance: Promise<any>,
  commands: string[],
  resolve: (value: unknown) => void,
  reject: (reason?: any) => void
}
class FFmpegManager {
  private ffmpeg: Record<string, any>;
  private runTask = reactive<RunTask[]>([]);
  private running = ref(false); // 运行状态
  public isLoaded = ref(false); // 是否已加载
  public showLog = true; // 是否打印输出
  public playTimeCache = new Map();
  public audioCache: string[] = [];
  public baseCommand = new Command(); // 基础命令
  public pathConfig = {
    resourcePath: '/resource/', // 资源目录，存放视频、音频等大文件
    framePath: '/frame/', // 持久化帧文件，用于轨道
    playFrame: '/pframe/', // 播放帧文件，因为文件体积大，可能会不定时删除
    audioPath: '/audio/', // 合成音频文件
    logPath: '/logs/', // 命令日志文件目录
    wavePath: '/wave/' // 音频波形文件目录
  };
  public static Hooks = {
    beforeInit: (_ins: FFmpegManager) => { }, // init之前
    afterInit: (_ins: FFmpegManager) => { } // init之后
  };
  constructor(options?: any) {
    Object.assign(FFmpegManager.Hooks, options?.Hooks || {});
    const createOptions = {
      corePath: '/ffmpeg/ffmpeg-core.js',
      log: this.showLog,
    };
    console.log('createFFmpeg', createFFmpeg);
    this.ffmpeg = createFFmpeg(createOptions);
    watch(this.runTask, () => {
      this.startRun();
    });
  }
  public async init() {
    this.runHook('beforeInit');
    console.log('start');
    const value = await this.ffmpeg.load();
    console.log('end', value);
    this.initFileSystem();
    this.runHook('afterInit');
    this.isLoaded.value = true;
  }
  // 启动执行命令队列
  private startRun() {
    if (this.running.value || this.runTask.length === 0) {
      return;
    }
    this.running.value = true;
    this.loopRunTask();
  }
  // 遍历执行任务队列
  private async loopRunTask() {
    const runTask = this.runTask[0];
    if (!runTask) {
      this.running.value = false;
      return;
    }
    const { commands, resolve } = runTask;
    const result = await this.ffmpeg.run(...commands);
    resolve(result);
    this.runTask.shift();
    if (this.runTask.length > 0) {
      await this.loopRunTask();
    } else {
      this.running.value = false;
    }
  }
  // 获取内部实例
  getIns() {
    return this.ffmpeg;
  }
  initFileSystem() {
    // 初始化文件系统
    this.mkdir(Object.values(this.pathConfig));
  }
  // 创建目录
  mkdir(paths: string[]) {
    paths.forEach((filePath) => {
      this.ffmpeg.FS('mkdir', filePath);
    });
  }

  // 执行钩子
  runHook(type: keyof typeof FFmpegManager.Hooks) {
    return FFmpegManager.Hooks[type] && FFmpegManager.Hooks[type](this);
  }
  existCommand(commands: string[]) {
    return this.runTask.find(task => task.commands.join('') === commands.join(''));
  }
  // 命令运行, 先从任务队列中查找是否存在
  run(commands: string[]) {
    const result = this.existCommand(commands);
    if (result) {
      return result.instance;
    } else {
      let task = { commands };
      const instance = new Promise((resolve, reject) => {
        Object.assign(task, {
          resolve,
          reject
        });
      });
      this.runTask.push({
        instance,
        ...task
      } as RunTask);
      return instance;
    }
  }
  // 进程退出
  exit() {
    return this.ffmpeg.exit();
  }
  // 打印目录
  logDir(filePath: string) {
    const log = this.readDir(filePath);
    this.showLog && console.log(log);
  }
  // 读取目录
  readDir(filePath: string) {
    return this.ffmpeg.FS('readdir', filePath);
  }
  // 删除文件
  rmFile(filePath: string) {
    return this.ffmpeg.FS('unlink', filePath);
  }
  // 判断文件是否存在
  fileExist(filePath: string, fileName: string) {
    return this.readDir(filePath).indexOf(fileName) > -1;
  }
  // FS写文件
  async writeFile(filePath: string, fileName: string, fileUrl: string, force = false) {
    const isFileExist = this.fileExist(filePath, fileName);
    if (force || !isFileExist) {
      this.ffmpeg.FS('writeFile', `${filePath}${fileName}`, await fetchFile(fileUrl));
    }
    this.logDir(filePath);
  }
  // 获取文件buffer
  getFileBuffer(filePath: string, fileName: string, format: string) {
    const localPath = `${fileName}.${format}`;
    return this.ffmpeg.FS('readFile', `${filePath}${localPath}`);
  }
  // 获取文件Blob
  getFileBlob(filePath: string, fileName: string, format: string) {
    const fileBuffer = this.getFileBuffer(filePath, fileName, format);
    return new Blob([fileBuffer], { type: FileTypeMap[format as keyof typeof FileTypeMap] });
  }
  /**
   * 获取文件url，用于下载
   * */
  getFileUrl(filePath: string, fileName: string, format: string) {
    const fileBlob = this.getFileBlob(filePath, fileName, format);
    return window.URL.createObjectURL(fileBlob);
  }
  /**
   * 获取文件file对象
   * */
  getFile(filePath: string, fileName: string, format: string) {
    const localPath = `${fileName}.${format}`;
    const fileBuffer = this.getFileBuffer(filePath, fileName, format);
    return new File([fileBuffer], localPath, { type: FileTypeMap[format as keyof typeof FileTypeMap] });
  }
  // 音频合成
  async mergeAudio(start: number, trackList: TrackItem[], trackAttrMap: Record<string, any>, fileName: string, filePath: string) {
    const { commands } = this.baseCommand.mergeAudio(this.pathConfig, start, trackList, trackAttrMap);
    if (this.audioCache.indexOf(commands.join('')) > -1) {
      return false;
    }
    this.audioCache = [commands.join('')];
    if (this.fileExist(this.pathConfig.audioPath, fileName)) {
      this.rmFile(filePath); // 重新生成前删除
    }
    return this.run(commands);
  }
  /**
   * 从视频中分离音频
   * */
  async splitAudio(videoName: string, format: string, force = false) {
    const { commands, audioPath, audioName } = this.baseCommand.splitAudio(this.pathConfig.resourcePath, videoName, format);
    const isFileExist = this.fileExist(this.pathConfig.resourcePath, audioName);
    if (force || !isFileExist) {
      await this.run(commands);
    }
    return { audioPath, audioName };
  }
  // 生成音波
  async genWave(sourceName: string, frameCount: number, format = 'aac', force = false) {
    let audioPath = Command.genVideoAAC(this.pathConfig.resourcePath, sourceName);
    if (format !== 'aac') {
      audioPath = `${this.pathConfig.resourcePath}${sourceName}.${format}`;
    }
    const { commands, fileName } = this.baseCommand.genWave(audioPath, sourceName, this.pathConfig.wavePath, frameCount);
    const isFileExist = this.fileExist(this.pathConfig.wavePath, fileName);
    if (force || !isFileExist) {
      await this.run(commands);
    }
    return { audioPath, wavePath: fileName };
  }
  /**
   * 视频/gif 抽帧（全量，用于轨道）
   * */
  async genFrame(fileName: string, format: string, size: { w: number, h: number }) {
    const framePath = `${this.pathConfig.framePath}${fileName}`;
    const filePath = `${fileName}.${format}`;
    const isResourceExist = this.fileExist(this.pathConfig.resourcePath, filePath);
    if (!isResourceExist) {
      return { framePath };
    }
    const isFrameExist = this.fileExist(this.pathConfig.framePath, fileName);
    if (isFrameExist) {
      return { framePath }
    };
    this.mkdir([framePath]);
    const { commands } = this.baseCommand.genFrame(`${this.pathConfig.resourcePath}${filePath}`, framePath, size, format);
    console.log('command: ', commands);
    await this.run(commands);
    return { framePath };
  }
  /**
   * 视频抽帧指定时间（用于播放）
   * */
  async genPlayFrame(videoName: string, format: string, size: { w: number, h: number }, time: number) {
    return new Promise((resolve) => {
      const framePath = `${this.pathConfig.playFrame}${videoName}`;
      const videoFilePath = `${videoName}.${format}`;
      const fileName = `pic-${time}-1.jpg`;
      const genCache = this.playTimeCache.get(videoName) || []; // 缓存已加载时间
      if (genCache.indexOf(time) > -1) {
        resolve({ framePath });
        return;
      }
      const isResourceExist = this.fileExist(this.pathConfig.resourcePath, videoFilePath);
      if (!isResourceExist) {
        resolve({ framePath });
        return;
      }
      const isPlayFrameVideoExist = this.fileExist(this.pathConfig.playFrame, videoName);
      if (!isPlayFrameVideoExist) {
        this.mkdir([framePath]);
      }
      const isPlayFrameFileExist = this.fileExist(this.pathConfig.playFrame, fileName);
      if (!isPlayFrameFileExist) { // 不重复抽帧
        const { commands } = this.baseCommand.genPlayFrame(`${this.pathConfig.resourcePath}${videoFilePath}`, framePath, size, time);
        this.run(commands).then(() => {
          genCache.push(time);
          this.playTimeCache.set(videoName, genCache);
          resolve({ framePath });
        });
      } else {
        resolve({ framePath });
      }
    });
  }
  // 获取视频帧图片
  getFrame(videoName: string, frameIndex: number) {
    const framePath = `${this.pathConfig.framePath}${videoName}`;
    const fileName = `/pic-${frameIndex}`;
    return this.getFileBlob(framePath, fileName, 'jpg');
  }
  // 获取播放视频帧图片
  getPFrame(videoName: string, frameIndex: number) {
    let time = Math.floor(frameIndex / 30);
    let frame = frameIndex % 30;
    if (frame === 0) {
      if (frameIndex === 0) {
        frame = 1;
      } else {
        time--;
        frame = 30;
      }
    }
    const framePath = `${this.pathConfig.playFrame}${videoName}`;
    const fileName = `/pic-${time}-${frame}`;
    return this.getFileBlob(framePath, fileName, 'jpg');
  }
  // 获取Gif图片
  getGifFrame(gifName: string, frameIndex: number) {
    const framePath = `${this.pathConfig.framePath}${gifName}`;
    const fileName = `/gif-${frameIndex}`;
    return this.getFileBlob(framePath, fileName, 'png');
  }
  // 获取指定的某一帧
  async getPIFrame(videoName: string, format: string, size: { w: number, h: number }, start: number) {
    const fileName = `/pic`;
    const framePath = `${this.pathConfig.playFrame}${videoName}`;
    const videoFilePath = `${videoName}.${format}`;
    const isVideoFilePathExist = this.fileExist(this.pathConfig.resourcePath, videoFilePath);
    if (!isVideoFilePathExist) {
      return false;
    }
    const isVideoNameExist = this.fileExist(this.pathConfig.playFrame, videoName);
    if (!isVideoNameExist) {
      this.mkdir([framePath]);
    }
    const { commands } = this.baseCommand.genPlayIFrame(`${this.pathConfig.resourcePath}${videoFilePath}`, framePath, size, start);
    await this.run(commands);
    const fileBuffer = this.getFileBuffer(framePath, fileName, 'jpg');
    console.log('file', fileBuffer);
    return this.getFileBlob(framePath, fileName, 'jpg');
  }
  // 获取波形
  getWavePng(sourceName: string) {
    return this.getFileUrl(this.pathConfig.wavePath, sourceName, 'png');
  }
  // 获取音频
  async getAudio(trackList: TrackItem[], trackAttrMap: Record<string, any>) {
    const fileName = `audio.mp3`;
    const filePath = `${this.pathConfig.audioPath}/${fileName}`;
    let start = 0;
    let end = 0;
    trackList.forEach(trackItem => {
      start = Math.min(trackItem.start, start);
      end = Math.max(trackItem.end, end);
    });
    await this.mergeAudio(start, trackList, trackAttrMap, fileName, filePath);
    const isAudioExist = this.fileExist(this.pathConfig.audioPath, fileName);
    if (!isAudioExist) {
      return {
        start, end,
        audioUrl: ''
      };
    }
    const audioUrl = this.getFileUrl(this.pathConfig.audioPath, 'audio', 'mp3');
    return {
      start, end, audioUrl
    };
  }
}

export default FFmpegManager;
