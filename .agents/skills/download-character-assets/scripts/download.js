#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../..');
const publicCharactersDir = path.join(projectRoot, 'public/characters');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://www.lovelive-anime.jp/',
  'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
};

export const GROUPS = {
  muse: {
    name: 'μ’s',
    files: Array.from({ length: 9 }, (_, i) => `o${String(i + 1).padStart(2, '0')}.webp`),
  },
  aqours: {
    name: 'Aqours',
    files: Array.from({ length: 9 }, (_, i) => `u${String(i + 1).padStart(2, '0')}.webp`),
  },
  nijigasaki: {
    name: '虹ヶ咲学園スクールアイドル同好会',
    files: Array.from({ length: 13 }, (_, i) => `n${String(i + 1).padStart(2, '0')}.webp`),
  },
  liella: {
    name: 'Liella!',
    files: Array.from({ length: 11 }, (_, i) => `y${String(i + 1).padStart(2, '0')}.webp`),
  },
  hasunosora: {
    name: '蓮ノ空女学院スクールアイドルクラブ',
    files: Array.from({ length: 11 }, (_, i) => `h${String(i + 1).padStart(2, '0')}.webp`),
  },
  ikizulive: {
    name: 'イキヅライブ！',
    files: Array.from({ length: 10 }, (_, i) => `bb${String(i + 1).padStart(2, '0')}.webp`),
  },
  musical: {
    name: 'スクールアイドルミュージカル',
    files: Array.from({ length: 10 }, (_, i) => `m${String(i + 1).padStart(2, '0')}.webp`),
  },
  yohane: {
    name: '幻日のヨハネ',
    files: Array.from({ length: 10 }, (_, i) => `yohane${String(i + 1).padStart(2, '0')}.webp`),
  },
};

async function downloadGroup(groupId) {
  const groupConfig = GROUPS[groupId];
  if (!groupConfig) {
    throw new Error(`Unknown group: ${groupId}. Available groups: ${Object.keys(GROUPS).join(', ')}`);
  }

  const targetDir = path.join(publicCharactersDir, groupId);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log(`Downloading ${groupConfig.name} (${groupId}) -> ${targetDir}...`);
  for (const file of groupConfig.files) {
    const url = `https://www.lovelive-anime.jp/images/members/${file}`;
    const dest = path.join(targetDir, file);
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
      throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    console.log(`  Saved ${file} (${buf.length} bytes)`);
  }
}

async function main() {
  const args = process.argv.slice(2).filter(arg => !arg.startsWith('-'));
  const targetGroups = args.length > 0 ? args : Object.keys(GROUPS);

  for (const group of targetGroups) {
    await downloadGroup(group);
  }
  console.log('All requested downloads completed successfully!');
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch(err => {
    console.error('Download error:', err.message);
    process.exit(1);
  });
}
