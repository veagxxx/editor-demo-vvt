import axios from '@/utils/request';
export const testApi = (mock = false) => {
  return axios.get('/tracks', mock ? { baseURL: '/mock' } : {});
}
