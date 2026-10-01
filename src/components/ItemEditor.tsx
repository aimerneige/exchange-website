import { useRef, useState, type FormEvent } from 'react';
import type { TextField } from 'mdui/components/text-field.js';
import { characterGroups } from '../data/characters';
import { preparePhoto } from '../lib/storage';
import type { TradeItem } from '../types';
import Icon from './Icon';
import ItemImage from './ItemImage';
import Modal from './Modal';
import { TextField as AccessibleTextField } from './AccessibleControls';

export default function ItemEditor({ item, type, onClose, onSave, busy }: {
  item?: TradeItem; type: TradeItem['type']; onClose: () => void;
  onSave: (item: TradeItem) => Promise<boolean>; busy: boolean;
}) {
  const [draft, setDraft] = useState<TradeItem>(item ?? {
    id: crypto.randomUUID(), characterName: '', itemName: '', image: '',
    type, quantity: 1, status: 'available', note: '',
  });
  const [group, setGroup] = useState(item?.groupId ?? characterGroups[0].id);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const characters = characterGroups.find(g => g.id === group)!.characters;
  const update = (patch: Partial<TradeItem>) => setDraft(current => ({ ...current, ...patch }));

  async function upload(file?: File) {
    if (!file) return;
    setProcessing(true);
    setError('');
    try { update({ photo: await preparePhoto(file), image: '' }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : '图片处理失败 / Image processing failed.'); }
    finally { setProcessing(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || processing) return;
    if (!draft.characterName.trim()) { setError('请填写角色名称 / キャラクター名を入力 / Enter a character name.'); return; }
    if (!draft.image && !draft.photo) { setError('请选择角色图片或上传商品图片 / 画像を選択 / Choose an image.'); return; }
    if (!Number.isInteger(draft.quantity) || draft.quantity < (draft.type === 'want' ? 1 : 0) || draft.quantity > 999) {
      setError('数量须为整数，HAVE 为 0–999，WANT 为 1–999 / Please enter a valid quantity.'); return;
    }
    const saved = await onSave({
      ...draft, characterName: draft.characterName.trim(), itemName: draft.itemName.trim(), note: draft.note.trim(),
      status: draft.type === 'have' && draft.quantity === 0 ? 'traded' : draft.status,
    });
    if (saved) onClose();
    else setError('保存失败，请检查设备空间和存储权限后重试。 / 保存に失敗 / Could not save; please retry.');
  }

  return <Modal title={item ? '编辑商品' : '添加商品'} subtitle={item ? '商品を編集 / Edit item' : '商品を追加 / Add an item'} onClose={onClose} className="editor-dialog">
    <form onSubmit={submit} className="editor-form">
      <div className="type-picker" role="group" aria-label="商品分类 / Category">
        {(['have', 'want'] as const).map(value => <button type="button" key={value} className={`${value} ${draft.type === value ? 'selected' : ''}`} aria-pressed={draft.type === value} onClick={() => update({ type: value, status: 'available', quantity: Math.max(1, draft.quantity) })}>
          <Icon name={value === 'have' ? 'bag' : 'heart'} /><span>{value === 'have' ? '可换出 · 譲' : '想要 · 求'}<small>{value.toUpperCase()}</small></span><Icon name={draft.type === value ? 'check' : 'plus'} size={16} />
        </button>)}
      </div>
      <div className="editor-image-row">
        <div className="editor-preview"><ItemImage item={draft} /></div>
        <div><h3>用照片，让交换更清楚</h3><p>商品写真 / Item photo</p>
          <mdui-button variant="tonal" onClick={() => fileRef.current?.click()} disabled={processing || busy}><Icon name="upload" slot="icon" />{processing ? '正在处理…' : '上传图片 / Upload'}</mdui-button>
          <small>JPG · PNG · WebP · GIF，最大 20 MB<br />仅保存在此设备 / この端末のみ / On this device only</small>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden aria-label="上传商品图片" onChange={e => void upload(e.target.files?.[0])} />
        </div>
      </div>
      <div className="preset-heading"><span>或选择默认角色</span><span>キャラクター / Character</span></div>
      <div className="group-tabs" role="group" aria-label="选择团体">
        {characterGroups.map(g => <mdui-chip key={g.id} selectable selected={g.id === group} onClick={() => setGroup(g.id)}>{g.name}<span className="chip-franchise">{g.franchise}</span></mdui-chip>)}
      </div>
      <div className="character-picker">
        {characters.map(character => <button type="button" key={character.id} className={draft.characterId === character.id && draft.groupId === group ? 'chosen' : ''} aria-label={`选择 ${character.name}`} aria-pressed={draft.characterId === character.id && draft.groupId === group} onClick={() => update({ characterId: character.id, groupId: group, characterName: character.name, image: character.image, photo: undefined })}>
          <ItemImage item={{ image: character.image, characterName: character.name }} /><span>{character.name}</span>
        </button>)}
      </div>
      <div className="form-fields">
        <AccessibleTextField label="角色名称 / キャラクター / Character *" value={draft.characterName} maxlength={80} onInput={e => update({ characterName: (e.currentTarget as unknown as TextField).value })} />
        <div className="field-row">
          <AccessibleTextField label="商品名称 / 商品名 / Item" value={draft.itemName} maxlength={100} onInput={e => update({ itemName: (e.currentTarget as unknown as TextField).value })} />
          <AccessibleTextField label="数量 / Qty" type="number" min={draft.type === 'have' ? 0 : 1} max={999} step={1} value={String(draft.quantity)} onInput={e => update({ quantity: Number((e.currentTarget as unknown as TextField).value) })} />
        </div>
        <AccessibleTextField label="备注（可选）/ メモ / Note" value={draft.note} maxlength={200} onInput={e => update({ note: (e.currentTarget as unknown as TextField).value })} />
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions"><mdui-button variant="text" onClick={onClose} disabled={busy}>取消 / Cancel</mdui-button><mdui-button type="submit" disabled={busy || processing}><Icon name="check" slot="icon" />{busy ? '保存中…' : '保存 / 保存 / Save'}</mdui-button></div>
    </form>
  </Modal>;
}
