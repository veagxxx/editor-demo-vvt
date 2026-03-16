import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import 'virtual:svg-icons-register';
import SvgIcon from './components/svg-icon/index.vue';
import 'element-plus/theme-chalk/src/message.scss'
import 'element-plus/theme-chalk/src/message-box.scss'
import router from './router';
import { createPinia } from 'pinia';
import directives from './directives';
// import installFFmpeg from './plugin/ffmpeg-plugin'; // ffmpeg 集成
// import { ElLoading } from 'element-plus';
import { useMock } from './mock';
if (process.env.NODE_ENV === 'development') {
  useMock();
}

const app = createApp(App);
// app.config.globalProperties.$ElLoading = ElLoading.service({
//   text: '核心加载中...'
// });
directives(app);
const pinia = createPinia();
app.use(pinia).use(router);
// app.use(installFFmpeg);
app.component('SvgIcon', SvgIcon);
app.mount('#app');
