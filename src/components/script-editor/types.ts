import { InjectionKey, UnwrapNestedRefs } from 'vue';
import { Node } from '@tiptap/pm/model';
import { Range } from '@tiptap/vue-3';
import { ICameraAttrs } from '@/components/script-editor/nodes/camera/CameraNode';
import { IHMotionAttrs } from '@/components/script-editor/nodes/hmotion/HMotionNode';
import { IBreakNodeAttrs } from '@/components/script-editor/nodes/break/BreakNode';

export interface IScriptEditorContext
{
  onNodeClick: (node: NodeInst, options?: {
    action: 'preview' | 'delete';
  }) => void;
}

export const ScriptEditorContextInjectKey: InjectionKey<UnwrapNestedRefs<IScriptEditorContext>> = Symbol('scriptEditorContext');

export type NodeAttrs = ICameraAttrs | IHMotionAttrs | IBreakNodeAttrs | Record<string, any>;

export type NodeInst = Node;

export type SelectionRange = number | Range;
