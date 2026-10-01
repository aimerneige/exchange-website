---
name: download-character-assets
description: >-
  Use this skill to fetch official character avatar and portrait assets (WebP format)
  from the LoveLive! official portal (lovelive-anime.jp), organize them in public/characters,
  and update character dataset configurations.
---

# Download Character Assets Skill

This skill documents and automates downloading official character images from the Love Live! official portal (`lovelive-anime.jp`) and integrating them into this exchange board application.

## Overview

The LoveLive! official portal serves character portraits with standard naming schemes across groups at:
`https://www.lovelive-anime.jp/images/members/{filename}`

Each member page is located at:
`https://www.lovelive-anime.jp/members/?group={group_id}`

### Known Group Image Schemes

| Group ID | Franchise / Group Name | File Pattern | File Count | Image Resolution |
| :--- | :--- | :--- | :--- | :--- |
| `muse` | μ’s | `o01.webp` ~ `o09.webp` | 9 | 640×840 |
| `aqours` | Aqours | `u01.webp` ~ `u09.webp` | 9 | 640×840 |
| `nijigasaki` | 虹ヶ咲学園スクールアイドル同好会 | `n01.webp` ~ `n13.webp` | 13 | 640×840 |
| `liella` | Liella! | `y01.webp` ~ `y11.webp` | 11 | 640×840 |
| `hasunosora` | 蓮ノ空女学院スクールアイドルクラブ | `h01.webp` ~ `h11.webp` | 11 | 640×840 |
| `ikizulive` | イキヅライブ！ | `bb01.webp` ~ `bb10.webp` | 10 | 640×840 |
| `musical` | スクールアイドルミュージカル | `m01.webp` ~ `m10.webp` | 10 | 640×840 |
| `yohane` | 幻日のヨハネ | `yohane01.webp` ~ `yohane10.webp` | 10 | 640×840 |

## Network Requirements

When fetching images or HTML from `lovelive-anime.jp`, include browser headers:
- `User-Agent`: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`
- `Referer`: `https://www.lovelive-anime.jp/`
- `Accept`: `image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8`

## Helper Script

An executable download script is provided at:
[scripts/download.js](./scripts/download.js)

### Usage

Download all character groups:
```bash
node .agents/skills/download-character-assets/scripts/download.js
```

Download specific group(s):
```bash
node .agents/skills/download-character-assets/scripts/download.js musical yohane
```

## Adding a New Group to the Codebase

1. Run the download helper to save images into `public/characters/<group_id>/`.
2. Update `src/data/characters.ts`:
   - Define character name tuples `[id, japaneseName, colorHex]`.
   - Add entry to `characterGroups` array with `id`, `franchise`, `name`, and mapped `characters`.
3. Update `tests/board.spec.ts`:
   - In `all bundled character images are available before opening the editor offline`, add the chip click and `checkCharacters('<group_id>', <count>)` verification.
4. Verify the changes:
   ```bash
   npm run build
   npx playwright test
   ```
