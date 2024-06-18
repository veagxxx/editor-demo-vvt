import { IEffect } from './effect-track';

export interface ITrackClip
{
  id: string;
  name: string;
  type: string;
  mediaURL: string;
  mediaId: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  adaptMode?: 'Contain' | 'Cover' | 'Fill';
  in?: number;
  out?: number;
  maxOut?: number;
  duration?: number;
  timelineIn?: number;
  timelineOut?: number;
  speed?: number;
  opacity?: number;
  effects?: IEffect[];
  fps?: number;
}

export interface ITrackClipInComponent extends ITrackClip
{
  name: string;
  format: string;
  inFrame: number;
  outFrame: number;
  frameCount: number;
  offsetLeft: number;
  offsetRight: number;
}

export interface ITimeline
{
  type: string;
  mainTrack?: boolean;
  trackClips: ITrackClip[];
}

export interface ITimelineInComponent
{
  type: string;
  mainTrack?: boolean;
  trackClips: ITrackClipInComponent[];
}
