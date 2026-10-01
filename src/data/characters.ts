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

const nijigasakiNames = [
  ['yu', '高咲 侑', '#737b84'], ['ayumu', '上原歩夢', '#ed7d95'],
  ['kasumi', '中須かすみ', '#e7d600'], ['shizuku', '桜坂しずく', '#01b7ed'],
  ['karin', '朝香果林', '#485ec6'], ['ai', '宮下 愛', '#ff5800'],
  ['kanata', '近江彼方', '#a664a0'], ['setsuna', '優木せつ菜', '#d81c2f'],
  ['emma', 'エマ・ヴェルデ', '#84c36e'], ['rina', '天王寺璃奈', '#9aa3aa'],
  ['shioriko', '三船栞子', '#37b484'], ['mia', 'ミア・テイラー', '#a2a0a2'],
  ['lanzhu', '鐘 嵐珠', '#f0959c'],
];

const liellaNames = [
  ['kanon', '澁谷かのん', '#ff7e1d'], ['keke', '唐 可可', '#a0e6ff'],
  ['chisato', '嵐 千砂都', '#ff6a97'], ['sumire', '平安名すみれ', '#74e263'],
  ['ren', '葉月 恋', '#1a2f7c'], ['kinako', '桜小路きな子', '#fff442'],
  ['mei', '米女メイ', '#c81f32'], ['shiki', '若菜四季', '#5cd6a5'],
  ['natsumi', '鬼塚夏美', '#fe4a77'], ['margarete', 'ウィーン・マルガレーテ', '#6162a8'],
  ['tomari', '鬼塚冬鞠', '#5097bc'],
];

const hasunosoraNames = [
  ['kaho', '日野下花帆', '#f8b500'], ['sayaka', '村野さやか', '#5383c3'],
  ['kozue', '乙宗 梢', '#68be8d'], ['tsuzuri', '夕霧綴理', '#ba2636'],
  ['rurino', '大沢瑠璃乃', '#e7609e'], ['megu', '藤島 慈', '#c5c56a'],
  ['ginko', '百生 吟子', '#a2d7dd'], ['kosuzu', '徒町 小鈴', '#fad667'],
  ['hime', '安養寺 姫芽', '#9d8de2'], ['cerise', 'セラス 柳田 リリエンフェルト', '#e9546b'],
  ['izumi', '桂城 泉', '#7b90d2'],
];

const ikizuliveNames = [
  ['polka', '高橋ポルカ', '#e85298'], ['mai', '麻布 麻衣', '#2ca9e1'],
  ['rei', '五桐 玲', '#e9bc00'], ['hanabi', '駒形 花火', '#ea5506'],
  ['kiseki', '金澤 奇跡', '#89c997'], ['noriko', '調布のりこ', '#8f77b5'],
  ['yukuri', '春宮ゆくり', '#e6b422'], ['kaguya', '此花 輝夜', '#165e83'],
  ['midori', '山田 真緑', '#007b43'], ['shion', '佐々木翔音', '#b44c97'],
];

export const characterGroups: CharacterGroup[] = [
  {
    id: 'muse', franchise: 'LoveLive!', name: 'μ’s',
    characters: museNames.map(([id, name, color], i) => ({
      id, name, color,
      image: `./characters/muse/o${String(i + 1).padStart(2, '0')}.webp`,
    })),
  },
  {
    id: 'aqours', franchise: 'LoveLive!', name: 'Aqours',
    characters: aqoursNames.map(([id, name, color], i) => ({
      id, name, color,
      image: `./characters/aqours/u${String(i + 1).padStart(2, '0')}.webp`,
    })),
  },
  {
    id: 'nijigasaki', franchise: 'LoveLive!', name: '虹ヶ咲',
    characters: nijigasakiNames.map(([id, name, color], i) => ({
      id, name, color,
      image: `./characters/nijigasaki/n${String(i + 1).padStart(2, '0')}.webp`,
    })),
  },
  {
    id: 'liella', franchise: 'LoveLive!', name: 'Liella!',
    characters: liellaNames.map(([id, name, color], i) => ({
      id, name, color,
      image: `./characters/liella/y${String(i + 1).padStart(2, '0')}.webp`,
    })),
  },
  {
    id: 'hasunosora', franchise: 'LoveLive!', name: '蓮ノ空',
    characters: hasunosoraNames.map(([id, name, color], i) => ({
      id, name, color,
      image: `./characters/hasunosora/h${String(i + 1).padStart(2, '0')}.webp`,
    })),
  },
  {
    id: 'ikizulive', franchise: 'LoveLive!', name: 'イキヅライブ！',
    characters: ikizuliveNames.map(([id, name, color], i) => ({
      id, name, color,
      image: `./characters/ikizulive/bb${String(i + 1).padStart(2, '0')}.webp`,
    })),
  },
];

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
