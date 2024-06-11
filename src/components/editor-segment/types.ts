import { Ref } from "vue";
import EditorToolbar from "./EditorToolbar.vue";
import { NodeName } from "./editor.enum";

export interface ISpeak
{
  volumn?: number;
  rate?: number;
}

export interface IBreak
{
  time: string;
}

export interface IHMotion
{
  code: string;
  duration?: number;
  text?: string;
}

export interface ICamera
{
  code: string;
  duration?: number;
  text?: string;
}

export interface IHMotionMap
{
  [code: string]: string;
}

export type SegmentNodeType = NodeName.Motion | NodeName.Camera; 

export type SegmentType = IHMotion | ICamera;

export type EditorToolbarRef = Ref<InstanceType<typeof EditorToolbar>>;

export type Output = 'xml' | 'text';
