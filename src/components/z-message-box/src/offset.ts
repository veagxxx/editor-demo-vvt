type Scroll = 'scrollTop' | 'scrollLeft';
function getScroll(w: Window, top?: boolean): number {
  let ret = w[`page${top ? 'Y' : 'X'}Offset`];
  const method = `scroll${top ? 'Top' : 'Left'}`;
  // @ts-ignore
  if (typeof ret !== 'number') {
    const d = w.document;
    ret = d.documentElement[method as Scroll];
    if (typeof ret !== 'number') {
      ret = d.body[method as Scroll];
    }
  }
  return ret;
}
type CompatibleDocument = {
  parentWindow?: Window;
} & Document;

export function offset(el: Element) {
  const rect = el.getBoundingClientRect();
  const pos = {
    left: rect.left,
    top: rect.top,
  };
  const doc = el.ownerDocument as CompatibleDocument;
  const w = (doc.defaultView || doc.parentWindow) as Window;
  pos.left += getScroll(w);
  pos.top += getScroll(w, true);
  return pos;
}
