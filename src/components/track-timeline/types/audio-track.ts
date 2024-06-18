import { IEffect } from './effect-track';
import { IBaseTrackClip } from './index';

export interface IAudioTrackClip extends IBaseTrackClip
{
  LoopMode?: boolean;
}
// 音频轨素材直接由文字转化生成
export interface IAITTSAudioTrackClip
{
  Type: 'AI_TTS';
  Voice?: string;
  CustomizedVoice?: string;
  Format?: string;
  TimelineIn?: number;
  TimelineOut?: number;
  SpeechRate?: number;
  PitchRate?: number;
  Effects?: IEffect[];
  ClipId?: string;
  ReferenceClipId?: string;
}

export type IAudioTrackClipUnion = IAITTSAudioTrackClip | IBaseTrackClip;

export interface IAudioTrack
{
  MainTrack?: Boolean;
  TrackShortenMode?: string;
  TrackExpandMode?: string;
  AudioTrackClips: IAudioTrackClipUnion[];
}
