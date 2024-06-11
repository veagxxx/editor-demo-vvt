// 节点名称
export enum NodeName {
  Default = 'paragraph',
  Motion = 'motionNode',
  Camera = 'cameraNode',
  Pause = 'pauseNode',
  Speak = 'speakNode'
}

// 生成的标签名
export enum SegmentTag {
  Motion = 'hmotion',
  Camera = 'camera',
  Pause = 'break',
  Speak = 'speak'
}

// 工具栏实例symbol标识
export const EditorToolbarInstance = Symbol('EditorToolbarInstance');
