import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import 'virtual:svg-icons-register';
import SvgIcon from './components/svg-icon/index.vue';
import 'element-plus/es/components/message/style/css';
const app = createApp(App);
app.component('SvgIcon', SvgIcon);
app.mount('#app');
