export interface IVideoInfo
{
  url: string;
  fileName: string;
  resolution: string;
  fps: number;
}

export interface ITrackState
{
  in: number;
  start: number;
  end: number;
  duration: number;
}
