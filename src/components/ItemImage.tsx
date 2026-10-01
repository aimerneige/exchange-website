import { useEffect, useState } from 'react';
import type { TradeItem } from '../types';
import Icon from './Icon';

export default function ItemImage({ item, className = '' }: { item: Pick<TradeItem, 'image' | 'photo' | 'characterName'>; className?: string }) {
  const [source, setSource] = useState(item.image);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const url = item.photo ? URL.createObjectURL(item.photo) : item.image;
    setSource(url);
    setFailed(false);
    return () => { if (item.photo) URL.revokeObjectURL(url); };
  }, [item.image, item.photo]);

  return source && !failed
    ? <img src={source} alt={item.characterName} className={className} onError={() => setFailed(true)} />
    : <div className={`image-fallback ${className}`}><Icon name="image" size={32} /><span>{item.characterName || '选择图片 / Select image'}</span>{failed && <small>图片暂不可用 / Image unavailable</small>}</div>;
}
