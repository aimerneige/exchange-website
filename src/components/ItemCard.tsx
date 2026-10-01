import type { CSSProperties } from 'react';
import { characterGroups } from '../data/characters';
import type { TradeItem } from '../types';
import Icon from './Icon';
import ItemImage from './ItemImage';
import { IconButton } from './AccessibleControls';

export default function ItemCard({ item, display, demo, busy, first, last, onPreview, onEdit, onTrade, onToggle, onMove, onDelete, onAdjust }: {
  item: TradeItem; display: boolean; demo: boolean; busy: boolean; first: boolean; last: boolean;
  onPreview: () => void; onEdit: () => void; onTrade: () => void; onToggle: () => void;
  onMove: (direction: -1 | 1) => void; onDelete: () => void;
  onAdjust?: (delta: -1 | 1) => void;
}) {
  const group = characterGroups.find(g => g.id === item.groupId);
  const character = group?.characters.find(c => c.id === item.characterId);
  return <mdui-card variant="outlined" className={`item-card ${item.status}`} data-testid={`item-${item.id}`}>
    <button className={`item-picture ${item.photo ? 'photo' : ''}`} style={{ '--character-color': character?.color ?? '#a1bab1' } as CSSProperties} onClick={onPreview} aria-label={`查看 ${item.characterName} / View item`}>
      <span className="group-label">{group?.name ?? '原创 / Custom'}</span>
      <ItemImage item={item} />
      <span className="zoom-cue"><Icon name="expand" size={15} /></span>
      {item.status === 'traded' && <span className="traded-overlay"><Icon name="check" size={22} /><strong>交換済み</strong><small>已交换 · TRADED</small></span>}
    </button>
    <div className="item-details"><div className="item-title-row"><h3>{item.characterName}</h3><span className="quantity">×{item.quantity}</span></div><p className="item-name">{item.itemName || '周边 / グッズ / Merchandise'}</p>{item.note && <p className="item-note">{item.note}</p>}</div>
    {display && onAdjust && !demo && <div className="display-stepper">
      <button className="display-step-btn" disabled={busy} onClick={() => onAdjust(-1)} aria-label={`减少 ${item.characterName} 数量`}><Icon name="minus" size={16} /></button>
      <span className="display-step-qty">×{item.quantity}</span>
      <button className="display-step-btn" disabled={busy || item.quantity >= 999} onClick={() => onAdjust(1)} aria-label={`增加 ${item.characterName} 数量`}><Icon name="plus" size={16} /></button>
    </div>}
    {!display && !demo && <div className="card-actions">
      <IconButton aria-label={`编辑 ${item.characterName}`} disabled={busy} onClick={onEdit}><Icon name="edit" size={16} /></IconButton>
      <IconButton aria-label={`上移 ${item.characterName}`} disabled={busy || first} onClick={() => onMove(-1)}><Icon name="up" size={16} /></IconButton>
      <IconButton aria-label={`下移 ${item.characterName}`} disabled={busy || last} onClick={() => onMove(1)}><Icon name="down" size={16} /></IconButton>
      <IconButton className="delete-action" aria-label={`删除 ${item.characterName}`} disabled={busy} onClick={onDelete}><Icon name="trash" size={16} /></IconButton>
      {item.type === 'have' && <div className="trade-actions">
        <mdui-button variant="text" className="trade-button" disabled={busy} onClick={onToggle}>{item.status === 'traded' ? '恢复 / 戻す / Restore' : '已交换 / 交換済み / Traded'}</mdui-button>
        {item.status === 'available' && <IconButton aria-label={`交换一件 ${item.characterName}`} disabled={busy || item.quantity === 0} onClick={onTrade}><Icon name="minus" size={16} /></IconButton>}
      </div>}
    </div>}
  </mdui-card>;
}
