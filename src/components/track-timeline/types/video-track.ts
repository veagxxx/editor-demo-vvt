import { IBaseTrackClip } from './index';

export interface IVideoTrackClip extends IBaseTrackClip
{
  X?: number;
  Y?: number;
  Width?: number;
  Height?: number;
  AdaptMode?: string;
  MaxOut?: number;
  Duration?: number;
  DyncFrames?: number;
  Opacity?: number;
  MaskVideoUrl?: string;
}
// 视频轨素材由数字人（AI_Avatar）功能生成
export interface IAIAvatarClip
{
  Type: 'AI_Avatar';
  MediaId?: string;
  MediaURL?: string;
  Content?: string;
  AvatarId?: string;
  Voice?: string;
  CustomizedVoice?: string;
  LoopMotion?: boolean;
  SpeechRate?: number;
  PitchRate?: number;
}

export type IVideoTrackClipUnion = IAIAvatarClip | IVideoTrackClip;

export interface IVideoTrack
{
  Type?: string;
  MainTrack?: Boolean;
  TrackShortenMode?: string;
  TrackExpandMode?: string;
  VideoTrackClips: IVideoTrackClipUnion[];
}
