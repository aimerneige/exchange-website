import { useCallback, useRef, useState } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Modal from './Modal';
import Icon from './Icon';

const ASPECTS = [
  { label: '自由', labelEn: 'Free', value: undefined },
  { label: '1:1', labelEn: '1:1', value: 1 },
  { label: '3:4', labelEn: '3:4', value: 3 / 4 },
  { label: '4:3', labelEn: '4:3', value: 4 / 3 },
  { label: '9:16', labelEn: '9:16', value: 9 / 16 },
] as const;

function initCrop(width: number, height: number, aspect?: number): Crop {
  if (aspect) {
    const isNarrow = (width / height) < aspect;
    return centerCrop(
      makeAspectCrop(
        isNarrow ? { unit: '%', height: 80 } : { unit: '%', width: 80 },
        aspect,
        width,
        height,
      ),
      width,
      height,
    );
  }
  return { unit: '%', x: 5, y: 5, width: 90, height: 90 };
}

async function applyCrop(img: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const scaleX = img.naturalWidth / img.width;
  const scaleY = img.naturalHeight / img.height;
  const srcX = Math.round(crop.x * scaleX);
  const srcY = Math.round(crop.y * scaleY);
  const srcW = Math.round(crop.width * scaleX);
  const srcH = Math.round(crop.height * scaleY);
  // 同 preparePhoto：最大边限制 1200px
  const ratio = Math.min(1, 1200 / Math.max(srcW, srcH));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(srcW * ratio));
  canvas.height = Math.max(1, Math.round(srcH * ratio));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法处理图片 / Could not process image.');
  ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('无法处理图片 / Could not process image.'))),
      'image/webp',
      0.86,
    ),
  );
}

export default function ImageCropper({ src, onConfirm, onCancel }: {
  src: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(initCrop(width, height, undefined));
  }, []);

  function changeAspect(next: number | undefined) {
    setAspect(next);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(initCrop(width, height, next));
      setCompletedCrop(undefined);
    }
  }

  async function confirm() {
    if (!imgRef.current || !completedCrop || completedCrop.width === 0 || completedCrop.height === 0) return;
    setBusy(true);
    setError('');
    try {
      const blob = await applyCrop(imgRef.current, completedCrop);
      onConfirm(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : '裁切失败 / Crop failed.');
      setBusy(false);
    }
  }

  const canConfirm = !busy && !!completedCrop && completedCrop.width > 0 && completedCrop.height > 0;

  return (
    <Modal title="裁切图片" subtitle="画像をトリミング / Crop image" onClose={onCancel} className="cropper-dialog">
      <div className="cropper-aspect-row" role="group" aria-label="裁切比例 / Aspect ratio">
        {ASPECTS.map(opt => (
          <button
            key={String(opt.value)}
            type="button"
            className={`cropper-aspect-btn${aspect === opt.value ? ' selected' : ''}`}
            aria-pressed={aspect === opt.value}
            onClick={() => changeAspect(opt.value)}
          >
            {opt.label}
            {opt.labelEn !== opt.label && <small>{opt.labelEn}</small>}
          </button>
        ))}
      </div>
      <div className="cropper-wrap">
        <ReactCrop
          crop={crop}
          onChange={c => setCrop(c)}
          onComplete={c => setCompletedCrop(c)}
          aspect={aspect}
          minWidth={20}
          minHeight={20}
          keepSelection
        >
          <img
            ref={imgRef}
            src={src}
            alt="裁切预览"
            className="cropper-img"
            onLoad={onImageLoad}
          />
        </ReactCrop>
      </div>
      <p className="cropper-hint">
        <Icon name="info" size={13} />
        拖动选区移动，拖动角点缩放
        <small> · ドラッグで範囲調整 / Drag to adjust crop</small>
      </p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions">
        <mdui-button variant="text" onClick={onCancel} disabled={busy}>取消 / Cancel</mdui-button>
        <mdui-button disabled={!canConfirm} onClick={() => void confirm()}>
          <Icon name="check" slot="icon" />
          {busy ? '处理中…' : '确认裁切 / Crop'}
        </mdui-button>
      </div>
    </Modal>
  );
}
