export type TradeItem = {
  id: string;
  characterName: string;
  characterId?: string;
  groupId?: string;
  itemName: string;
  image: string;
  photo?: Blob;
  type: 'have' | 'want';
  quantity: number;
  status: 'available' | 'traded';
  note: string;
};

export type Character = { id: string; name: string; image: string; color: string };
export type CharacterGroup = { id: string; franchise: string; name: string; characters: Character[] };
