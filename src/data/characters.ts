import type { CharacterGroup, TradeItem } from '../types.ts';

const museNames = [
  ['honoka', '高坂穂乃果', '#f5a65b'], ['eli', '絢瀬絵里', '#84bfdd'],
  ['kotori', '南ことり', '#a4b1ad'], ['umi', '園田海未', '#6994c7'],
  ['rin', '星空凛', '#dac563'], ['maki', '西木野真姫', '#d77b84'],
  ['nozomi', '東條希', '#aa91c5'], ['hanayo', '小泉花陽', '#8eb483'],
  ['nico', '矢澤にこ', '#dd97ba'],
];
const aqoursNames = [
  ['chika', '高海千歌', '#efa276'], ['riko', '桜内梨子', '#d58a9e'],
  ['kanan', '松浦果南', '#76bfb5'], ['daiya', '黒澤ダイヤ', '#d68083'],
  ['you', '渡辺曜', '#7bb8d3'], ['youshiko', '津島善子', '#9991b6'],
  ['hanamaru', '国木田花丸', '#d8b775'], ['mari', '小原鞠莉', '#b29ac9'],
  ['ruby', '黒澤ルビィ', '#d98fab'],
];

export const characterGroups: CharacterGroup[] = [
  {
    id: 'muse', franchise: 'LoveLive!', name: 'μ’s',
    characters: museNames.map(([id, name, color], i) => ({
      id, name, color,
      image: `./characters/muse/member${String(i + 1).padStart(2, '0')}.png`,
    })),
  },
  {
    id: 'aqours', franchise: 'LoveLive!', name: 'Aqours',
    characters: aqoursNames.map(([id, name, color], i) => ({
      id, name, color,
      image: `./characters/aqours/thumb${String(i + 1).padStart(2, '0')}.png`,
    })),
  },
];

const legacyImagePrefixes: Record<string, string> = {
  muse: 'https://www.lovelive-anime.jp/otonokizaka/member/member_top.hyperesources/member',
  aqours: 'https://www.lovelive-anime.jp/uranohoshi/img/member/thumb',
};
const legacyImages = new Map<string, string>(characterGroups.flatMap(group => {
  const prefix = legacyImagePrefixes[group.id];
  return prefix ? group.characters.map((character, i) => [
    `${prefix}${String(i + 1).padStart(2, '0')}.png`, character.image,
  ] as const) : [];
}));

export function resolveCharacterImage(image: string): string {
  // 旧交换板保留原始数据，只在显示时将已知默认外链映射到本地资源。
  return legacyImages.get(image) ?? image;
}

const examples = [
  ['muse', 'honoka', 'have', '缶バッジ / 徽章', 2],
  ['muse', 'kotori', 'have', 'アクリルスタンド / 亚克力立牌', 1],
  ['aqours', 'you', 'have', 'ラバーストラップ / 橡胶挂件', 1],
  ['muse', 'maki', 'want', '缶バッジ / 徽章', 1],
  ['aqours', 'riko', 'want', 'アクリルスタンド / 亚克力立牌', 1],
  ['aqours', 'ruby', 'want', 'ラバーストラップ / 橡胶挂件', 1],
] as const;

export const demoItems: TradeItem[] = examples.map(([groupId, characterId, type, itemName, quantity], i) => {
  const character = characterGroups.find(g => g.id === groupId)!.characters.find(c => c.id === characterId)!;
  return {
    id: `demo-${i}`, groupId, characterId, characterName: character.name,
    image: character.image, itemName, type, quantity, status: 'available', note: '',
  };
});
