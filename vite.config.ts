import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { characterGroups } from './src/data/characters.ts';

function offlineShell(): Plugin {
  return {
    name: 'offline-shell',
    apply: 'build',
    generateBundle(_, bundle) {
      const images = characterGroups.flatMap(group => group.characters.map(character => character.image));
      const assets = ['.', 'index.html', 'favicon.svg', 'qr-code.svg', 'manifest.webmanifest', ...images, ...Object.keys(bundle)];
      const template = readFileSync(new URL('./src/sw.js', import.meta.url), 'utf8');
      const hash = createHash('sha256').update(JSON.stringify(assets)).update(template)
        .update(readFileSync(new URL('./public/favicon.svg', import.meta.url)))
        .update(readFileSync(new URL('./public/qr-code.svg', import.meta.url)))
        .update(readFileSync(new URL('./public/manifest.webmanifest', import.meta.url)));
      for (const image of images) hash.update(readFileSync(new URL(`./public/${image}`, import.meta.url)));
      const version = hash.digest('hex').slice(0, 12);
      const source = template
        .replace('__ASSETS__', JSON.stringify(assets))
        .replace('__VERSION__', version);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), offlineShell()],
});
