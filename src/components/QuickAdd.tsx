import { useRef, useState } from 'react';
import { characterGroups } from '../data/characters';
import type { TradeItem } from '../types';
import Icon from './Icon';
import ImageCropper from './ImageCropper';
import ItemImage from './ItemImage';

export default function QuickAdd({ type, onSave, busy }: {
  type: TradeItem['type'];
  onSave: (item: TradeItem) => Promise<boolean>;
  busy: boolean;
}) {
  const [group, setGroup] = useState(characterGroups[0].id);
  const [selectedChar, setSelectedChar] = useState<{ characterId: string; groupId: string; name: string; image: string }>();
  const [quantity, setQuantity] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [itemName, setItemName] = useState('');
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<Blob>();
  const [cropSrc, setCropSrc] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const characters = characterGroups.find(g => g.id === group)!.characters;
  const min = type === 'have' ? 0 : 1;

  function selectCharacter(charId: string, grpId: string) {
    const character = characterGroups.find(g => g.id === grpId)!.characters.find(c => c.id === charId)!;
    setSelectedChar({ characterId: charId, groupId: grpId, name: character.name, image: character.image });
    setPhoto(undefined);
    setError('');
  }

  function upload(file?: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('请选择 JPG、PNG、WebP 或 GIF 图片');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('图片不能超过 20 MB');
      return;
    }
    setError('');
    if (fileRef.current) fileRef.current.value = '';
    setCropSrc(URL.createObjectURL(file));
  }

  function closeCropper() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(undefined);
  }

  function handleCropConfirm(blob: Blob) {
    setPhoto(blob);
    closeCropper();
  }

  async function save() {
    if (busy || saving) return;
    if (!selectedChar) { setError('请先选择角色'); return; }
    if (!Number.isInteger(quantity) || quantity < min || quantity > 999) {
      setError('数量无效'); return;
    }
    setSaving(true);
    setError('');
    const item: TradeItem = {
      id: crypto.randomUUID(),
      characterId: selectedChar.characterId,
      groupId: selectedChar.groupId,
      characterName: selectedChar.name,
      image: photo ? '' : selectedChar.image,
      photo,
      itemName: itemName.trim(),
      type,
      quantity,
      status: type === 'have' && quantity === 0 ? 'traded' : 'available',
      note: note.trim(),
    };
    const ok = await onSave(item);
    setSaving(false);
    if (ok) {
      setSuccess(`${selectedChar.name} ×${quantity} ✓`);
      setSelectedChar(undefined);
      setQuantity(1);
      setItemName('');
      setNote('');
      setPhoto(undefined);
      setExpanded(false);
      setTimeout(() => setSuccess(''), 2500);
    } else {
      setError('保存失败，请重试');
    }
  }

  return <>
    <div className="quick-add">
      <div className="quick-add-header">
        <div className="quick-add-title">
          <Icon name={type === 'have' ? 'bag' : 'heart'} size={16} />
          <span>快速添加 {type === 'have' ? '可换出' : '想要'}<small>{type === 'have' ? 'Quick add HAVE' : 'Quick add WANT'}</small></span>
        </div>
        {success && <span className="quick-add-success"><Icon name="check" size={14} />{success}</span>}
      </div>

      <div className="quick-group-tabs" role="group" aria-label="选择团体">
        {characterGroups.map(g => <button key={g.id} className={g.id === group ? 'active' : ''} onClick={() => setGroup(g.id)}>{g.name}</button>)}
      </div>

      <div className="quick-character-picker">
        {characters.map(character => <button key={character.id}
          className={selectedChar?.characterId === character.id && selectedChar?.groupId === group ? 'chosen' : ''}
          aria-label={`选择 ${character.name}`}
          aria-pressed={selectedChar?.characterId === character.id && selectedChar?.groupId === group}
          onClick={() => selectCharacter(character.id, group)}>
          <ItemImage item={{ image: character.image, characterName: character.name }} />
          <span>{character.name}</span>
        </button>)}
      </div>

      <div className="quick-quantity-row">
        <div className="quick-preview-mini">
          {selectedChar
            ? <ItemImage item={{ image: photo ? '' : selectedChar.image, photo, characterName: selectedChar.name }} />
            : <div className="quick-preview-placeholder"><Icon name="image" size={20} /><small>选角色</small></div>}
        </div>
        <div className="quick-quantity-control">
          <span className="quick-quantity-label">{selectedChar?.name ?? '未选择角色'}</span>
          <div className="quick-stepper">
            <button className="quick-step-btn" disabled={quantity <= min} onClick={() => setQuantity(q => Math.max(min, q - 1))} aria-label="减少数量">
              <Icon name="minus" size={18} />
            </button>
            <span className="quick-quantity-value">×{quantity}</span>
            <button className="quick-step-btn" disabled={quantity >= 999} onClick={() => setQuantity(q => Math.min(999, q + 1))} aria-label="增加数量">
              <Icon name="plus" size={18} />
            </button>
          </div>
        </div>
        <mdui-button className="quick-save-btn" disabled={busy || saving || !selectedChar} onClick={save}>
          <Icon name="check" slot="icon" />{saving ? '保存中…' : '保存'}
        </mdui-button>
      </div>

      <button className="quick-expand-toggle" onClick={() => setExpanded(!expanded)}>
        <Icon name={expanded ? 'up' : 'down'} size={14} />
        {expanded ? '收起额外信息' : '展开额外信息（商品名、备注、上传图片）'}
      </button>

      {expanded && <div className="quick-extra-fields">
        <div className="quick-extra-row">
          <div className="quick-upload-area">
            <mdui-button variant="tonal" onClick={() => fileRef.current?.click()} disabled={busy || saving || !!cropSrc}>
              <Icon name="upload" slot="icon" />{photo ? '重新上传' : '上传图片'}
            </mdui-button>
            <small>商品实物照 · JPG/PNG/WebP/GIF</small>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden aria-label="上传商品图片" onChange={e => upload(e.target.files?.[0])} />
          </div>
          <div className="quick-text-fields">
            <input className="quick-input" placeholder="商品名称（可选）" value={itemName} maxLength={100} onChange={e => setItemName(e.target.value)} />
            <input className="quick-input" placeholder="备注（可选）" value={note} maxLength={200} onChange={e => setNote(e.target.value)} />
          </div>
        </div>
      </div>}

      {error && <p className="quick-error" role="alert"><Icon name="info" size={13} />{error}</p>}
    </div>
    {cropSrc && <ImageCropper src={cropSrc} onConfirm={handleCropConfirm} onCancel={closeCropper} />}
  </>;
}
