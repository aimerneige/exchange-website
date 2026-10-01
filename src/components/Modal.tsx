import { useEffect, useRef, type ReactNode } from 'react';
import type { Dialog } from 'mdui/components/dialog.js';
import Icon from './Icon';
import { IconButton } from './AccessibleControls';

export default function Modal({ title, subtitle, onClose, children, className = '' }: {
  title: string; subtitle?: string; onClose: () => void; children: ReactNode; className?: string;
}) {
  const ref = useRef<Dialog>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.addEventListener('closed', onClose);
    return () => dialog.removeEventListener('closed', onClose);
  }, [onClose]);
  return <mdui-dialog ref={ref} open close-on-esc close-on-overlay-click className={className} role="dialog" aria-modal="true" aria-label={title}>
    <div className="modal-heading">
      <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
      <IconButton aria-label="关闭 / 閉じる / Close" onClick={onClose}><Icon name="close" /></IconButton>
    </div>
    {children}
  </mdui-dialog>;
}
