import { useEffect, useRef, type ComponentProps } from 'react';
import type { ButtonIcon as MduiButtonIcon } from 'mdui/components/button-icon.js';
import type { TextField as MduiTextField } from 'mdui/components/text-field.js';

export function IconButton(props: ComponentProps<'mdui-button-icon'>) {
  const ref = useRef<MduiButtonIcon>(null);
  const label = props['aria-label'] ?? '';
  useEffect(() => {
    let active = true;
    const element = ref.current!;
    // mdui 2 不会把宿主上的 aria-label 传递到 Shadow DOM 内的可聚焦按钮。
    element.updateComplete.then(() => {
      if (active) element.shadowRoot?.querySelector('button')?.setAttribute('aria-label', label);
    });
    return () => { active = false; };
  }, [label]);
  return <mdui-button-icon {...props} ref={ref} />;
}

export function TextField(props: ComponentProps<'mdui-text-field'>) {
  const ref = useRef<HTMLElement>(null);
  const label = props.label ?? '';
  useEffect(() => {
    let active = true;
    const element = ref.current! as unknown as MduiTextField;
    element.updateComplete.then(() => {
      if (active) element.shadowRoot?.querySelector('input')?.setAttribute('aria-label', label);
    });
    return () => { active = false; };
  }, [label]);
  return <mdui-text-field {...props} ref={ref} />;
}
