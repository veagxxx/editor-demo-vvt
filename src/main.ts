import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import 'virtual:svg-icons-register';
import SvgIcon from './components/svg-icon/index.vue';
import 'element-plus/es/components/message/style/css';
import 'element-plus/es/components/loading/style/css';
import { createPinia } from 'pinia';
import installFFmpeg from './plugin/ffmpeg-plugin'; // ffmpeg 集成
import { ElLoading } from 'element-plus';

const app = createApp(App);
app.config.globalProperties.$ElLoading = ElLoading.service({
  text: '核心加载中...'
});
const pinia = createPinia();
app.use(pinia);
app.use(installFFmpeg);
app.component('SvgIcon', SvgIcon);
app.mount('#app');
