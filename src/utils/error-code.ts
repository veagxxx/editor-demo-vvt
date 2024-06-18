export enum ErrorCode {
  NOTTOKEN = '401',
  NOAUTH = '403',
  NOTFOUND = '404',
  DEFAULT = 'default'
}
interface ErrorStatus<T> {
  [K: string]: T;
}
const errorCode: ErrorStatus<string> = {
  [ErrorCode.NOTTOKEN]: '认证失败，无法访问系统资源',
  [ErrorCode.NOAUTH]: '当前操作没有权限',
  [ErrorCode.NOTFOUND]: '访问资源不存在',
  [ErrorCode.DEFAULT]: '系统未知错误，请反馈给管理员'
}
export default errorCode;
