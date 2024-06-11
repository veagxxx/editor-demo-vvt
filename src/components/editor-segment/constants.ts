import { ICamera, IHMotion, IHMotionMap, SegmentType } from './types';

export const HMotionList: IHMotion[] = [
  { duration: 1, code: 'man001_protocol_welcome', text: '礼仪-双手欢迎' },
  { duration: 2, code: 'man001_protocol_nod', text: '礼仪-轻轻点头俯身' },
  { duration: 3, code: 'man001_attitude_point_myself', text: '态度-指自己' },
  { duration: 1, code: 'man001_attitude_elongate', text: '态度-拉长' },
  { duration: 2, code: 'man001_indicate_low_right', text: '指示-低手势-示意屏幕右侧' },
  { duration: 3, code: 'man001_indicate_low_left', text: '指示-低手势-示意屏幕左侧' },
  { duration: 1, code: 'man001_idle_breath', text: '待机-呼吸状态' },
  { duration: 1, code: 'man001_idle_breath2', text: '待机-呼吸状态2' },
  { duration: 1, code: 'man001_idle_breath1_2', text: '待机-呼吸状态1过渡为状态2' },
  { duration: 1, code: 'man001_idle_breath2_1', text: '待机-呼吸状态2过渡为状态1' },
  { duration: 1, code: 'woman001_attitude_reduce', text: '态度-降低' },
  { duration: 1, code: 'woman001_attitude_steady', text: '态度-平稳' },
  { duration: 1, code: 'woman001_attitude_exchange', text: '态度-交易交流' },
  { duration: 1, code: 'woman001_indicate_low_right', text: '指示-低手势-示意屏幕右侧' },
  { duration: 1, code: 'woman001_idle_walk', text: '待机-人物走动' },
  { duration: 1, code: 'woman001_idle_breath', text: '待机-呼吸状态' },
];

export const CameraList: ICamera[] = [
  { 
    duration: 1, 
    code: 'panorama_down_start', 
    text: '全景-下移-开场' 
  },
  {
    duration: 1,
    code: 'panorama_right_start',
    text: '全景-右推-开场'
  },
  {
    duration: 1,
    code: 'panorama_left_down_start',
    text: '全景-左俯-开场'
  },
  {
    duration: 1,
    code: 'panorama_right_down_start',
    text: '全景-右俯-开场'
  },
  {
    duration: 1,
    code: 'panorama_up_start',
    text: '全景-仰推-开场'
  },
  {
    duration: 1,
    code: 'panorama_downward_start',
    text: '全景-俯冲-开场'
  },
  {
    duration: 1,
    code: 'panorama_slow_push_start',
    text: '全景-缓推-开场'
  },
  {
    duration: 1,
    code: 'panorama_slow_pull_end',
    text: '全景-缓拉-结尾'
  },
  {
    duration: 1,
    code: 'panorama_right_up',
    text: '全景-右仰-环绕'
  },
  {
    duration: 1,
    code: 'panorama_left_up',
    text: '全景-左仰-环绕'
  },
  {
    duration: 1,
    code: 'panorama_front',
    text: '全景-正面-缓推'
  },
  {
    duration: 1,
    code: 'panorama_around_right',
    text: '全景-环绕-右起'
  },
  {
    duration: 1,
    code: 'panorama_around_left',
    text: '全景-环绕-左起'
  },
  {
    duration: 1,
    code: 'full_screen_left',
    text: '全屏-角色左侧'
  },
  {
    duration: 1,
    code: 'full_screen_left_center',
    text: '全屏-角色居左'
  },
  {
    duration: 1,
    code: 'full_screen_center',
    text: '全屏'
  },
  {
    duration: 1,
    code: 'middle_screen_right',
    text: '中景-角色居右-固定'
  },
  {
    duration: 1,
    code: 'middle_screen_left',
    text: '中景-角色居左-固定'
  },
  {
    duration: 1,
    code: 'middle_screen_front',
    text: '中景-正面-固定'
  },
  {
    duration: 1,
    code: 'middle_screen_right_around',
    text: '中景-右侧-环绕'
  },
  {
    duration: 1,
    code: 'middle_screen_left_around',
    text: '中景-左侧-环绕'
  },
  {
    duration: 1,
    code: 'middle_screen_follow',
    text: '中景-跟随'
  },
  {
    duration: 1,
    code: 'close_shot_screen_front',
    text: '近景-正面-固定'
  },
  {
    duration: 1,
    code: 'close_up_screen_front',
    text: '特写-正面-固定'
  }
]

export const SegmentMap = [
  ...HMotionList, 
  ...CameraList
].reduce((prev: IHMotionMap, curv: SegmentType) => {
  prev[curv.code] = curv.text || '';
  return prev;
}, {});
