import { IBaseTrackClip } from '.';

type ImageBaseClip = Pick<IBaseTrackClip, 'MediaId' | 'MediaURL' | 'TimelineIn' | 'TimelineOut' | 'Effects'>;

export interface IImageTrackClip extends ImageBaseClip
{
  Type?: string;
  X?: number;
  Y?: number;
  Width?: number;
  Height?: number;
  DyncFrames?: number;
}

export interface IImageTrack
{
  MainTrack?: boolean;
  ImageTrackClips: IImageTrackClip[];
}
