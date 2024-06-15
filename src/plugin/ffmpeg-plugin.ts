import { App } from 'vue';
import FFmpegManager from '../components/track-timeline/utils/ffmpeg-manager';

export default {
  install(app: App) {
    const ffmpegIns = new FFmpegManager({
      Hooks: {
        beforeInit: () => {
          app.config.globalProperties.$ElLoading.visible.value = true;
        },
        afterInit: () => {
          app.config.globalProperties.$ElLoading.visible.value = false;
        }
      }
    });
    ffmpegIns.init();
    app.provide('ffmpeg', ffmpegIns);
  }
};
