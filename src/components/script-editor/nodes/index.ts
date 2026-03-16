export { SpeakNode } from './speak/SpeakNode';
export { CameraNode } from './camera/CameraNode';
export { HMotionNode } from './hmotion/HMotionNode';
export { BreakNode } from './break/BreakNode';

export interface INodeAttrs
{
  id?: string;
  name?: string;
  code?: string;
  disabled?: number;
  'err-msg'?: string;
}
