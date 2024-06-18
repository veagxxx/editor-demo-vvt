import { MockParams } from "./types";
import pkg from 'mockjs';
const { Random } = pkg;
const apis: MockParams[] = [{
  url: '/mock/tracks',
  type: 'get',
  response: () => {
    return {
      code: 200,
      message: '操作成功',
      totalCount: 100,
      "data|10": [{
        "id|+1": 1,
        "name": "@name",
        "title": "",
        "age|1-100": 1,
        "gender|0-1": 0,
        "date": "@date('yyyy-MM-dd')",
        "email": /[a-z]{2,6}@(126|163|qq)\.(com|cn|net)/,
        "avatar": Random.image('50×50', '#626aef', '#fff', "@name")
      }]
    }
  }
}];

export default apis;
