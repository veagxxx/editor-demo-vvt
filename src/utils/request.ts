import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import errorCode, { ErrorCode } from './error-code';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';

// 是否显示重新登录
export let isRelogin = { show: false };

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || '/api',
  timeout: 5000,
});

// 请求拦截
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig<any>) => {
    return config;
  },
  (error: Error) => {
    return Promise.reject(error);
  }
);

// 响应拦截
service.interceptors.response.use(
  (res: AxiosResponse) => {
    const code: number = Number(res.data.code || 200)
    // console.log('响应拦截', res)
    // 获取错误信息
    const msg: string = errorCode[code] || res.data.msg || errorCode[ErrorCode.DEFAULT]
    // 二进制数据则直接返回
    if(res.request.responseType ===  'blob' || res.request.responseType ===  'arraybuffer'){
      return res.data;
    }
    if (code === 401) {
      if (!isRelogin.show) {
        isRelogin.show = true;
        ElMessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          isRelogin.show = false;
          // store.dispatch('LogOut').then(() => {
          //   location.href = '/index';
          // })
        }).catch(() => {
          isRelogin.show = false;
        });
      }
      return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
    } else if (code === 500) {
      ElMessage({
        message: msg,
        type: 'error'
      });
      return Promise.reject(new Error(msg));
    } else if (code !== 200) {
      ElNotification.error({
        title: msg
      });
      return Promise.reject('error');
    } else {
      return res.data;
    }
  }, 
  (error: Error) => {
    return Promise.reject(error);
  }
);

export default service;
