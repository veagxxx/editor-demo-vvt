// styled.ts
import { defineComponent, h } from 'vue';

const injectedStyles = new Set<string>();

function generateClassName() {
  return `sc-${Math.random().toString(36).substr(2, 9)}`;
}

function interpolateCSS(
  strings: TemplateStringsArray,
  ...exprs: Array<string | number | undefined>
): string {
  let css = '';
  strings.forEach((str, i) => {
    css += str + (exprs[i] !== undefined ? exprs[i] : '');
  });
  return css;
}

function injectStyle(css: string, key: string) {
  if (injectedStyles.has(key)) return;
  injectedStyles.add(key);

  const styleEl = document.createElement('style');
  styleEl.type = 'text/css';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);
}

export const styled = {
  div(strings: TemplateStringsArray, ...exprs: Array<string | number | undefined>) {
    const className = generateClassName();
    const rawCSS = interpolateCSS(strings, ...exprs);
    
    // ✅ 修复：先处理嵌套，再包裹
    const innerCSS = rawCSS.replace(/&/g, `.${className}`).trim();

    // 构造完整的 CSS 规则
    let finalCSS = innerCSS;

    // 如果 innerCSS 不是以 @ 开头（不是 @media/@keyframes 等），且不包含 { } 结构，则需要包裹
    if (!innerCSS.startsWith('@') && !innerCSS.includes('{')) {
      finalCSS = `.${className} { ${innerCSS} }`;
    } else if (innerCSS.startsWith('@')) {
      // 是 @ 规则，直接使用
      finalCSS = innerCSS;
    } else {
      // 包含 { }，但可能是嵌套结构，我们信任用户写了正确的结构
      // 为了安全，还是确保顶层有类名包裹
      if (!innerCSS.startsWith('.')) {
        finalCSS = `.${className} { ${innerCSS} }`.replace(new RegExp(`\\.${className}\\s*{\\s*\\.${className}`, 'g'), `.${className}`);
      }
    }

    // 使用 className + CSS 内容作为唯一 key
    const key = `${className}::${finalCSS}`;
    injectStyle(finalCSS, key);

    return defineComponent({
      name: 'StyledDiv',
      setup(props, { slots }) {
        return () => {
          return h('div', {
            class: [className], // 支持外部传入 class
            ...props
          }, slots.default?.() || []);
        };
      }
    });
  },

  button(strings: TemplateStringsArray, ...exprs: Array<string | number | undefined>) {
    const className = generateClassName();
    const rawCSS = interpolateCSS(strings, ...exprs);
    const innerCSS = rawCSS.replace(/&/g, `.${className}`).trim();

    let finalCSS = innerCSS;
    if (!innerCSS.startsWith('@') && !innerCSS.includes('{')) {
      finalCSS = `.${className} { ${innerCSS} }`;
    } else if (innerCSS.startsWith('@')) {
      finalCSS = innerCSS;
    } else {
      finalCSS = `.${className} { ${innerCSS} }`;
    }

    const key = `${className}::${finalCSS}`;
    injectStyle(finalCSS, key);

    return defineComponent({
      name: 'StyledButton',
      setup(props, { slots }) {
        return () => h('button', {
          class: [className],
          ...props
        }, slots.default?.() || []);
      }
    });
  }
};
