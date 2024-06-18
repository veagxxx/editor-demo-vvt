import Mock from 'mockjs';
import apis from './apis';
import { MockParams } from './types';
const API_BASE_URL = '/mock'
const mocks = [...apis]
export const useMock = () => {
  for (const key in mocks) {
    const api: MockParams = mocks[key];
    Mock.mock(API_BASE_URL + api.url, api.type || 'get', api.response);
  }
}
