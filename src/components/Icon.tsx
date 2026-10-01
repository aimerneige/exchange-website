const paths = {
  exchange: 'M4 7h16m-5-5 5 5-5 5M20 17H4m5-5-5 5 5 5',
  plus: 'M12 5v14M5 12h14',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  moon: 'M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z',
  expand: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5',
  close: 'm6 6 12 12M6 18 18 6',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  down: 'm6 9 6 6 6-6',
  up: 'm6 15 6-6 6 6',
  edit: 'm16 3 5 5-12 12-6 1 1-6L16 3Zm-3 3 5 5',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
  check: 'm5 12 4 4L19 6',
  minus: 'M5 12h14',
  upload: 'M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5',
  image: 'M3 3h18v18H3V3Zm0 14 5-5 4 4 4-6 5 7M9 7h.01',
  shield: 'm12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6l8-3Zm-4 9 3 3 5-6',
  help: 'M9.1 8a3 3 0 0 1 5.8 1c0 2-3 2-3 4m.1 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  bag: 'M5 7h14l2 14H3L5 7Zm3 1V6a4 4 0 0 1 8 0v2',
  wifi: 'M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0m-4 4h.01',
  info: 'M12 11v6m0-10h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
};

export type IconName = keyof typeof paths | 'github';

export default function Icon({ name, size = 20, className = '', slot }: { name: IconName; size?: number; className?: string; slot?: string }) {
  if (name === 'github') return <svg slot={slot} className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .8a11.4 11.4 0 0 0-3.6 22.2c.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.6-1.3-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.6 1.2 3.3.9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11.3 11.3 0 0 1 5.8 0C17 5.2 18 5.5 18 5.5c.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.1v3c0 .3.2.6.8.5A11.4 11.4 0 0 0 12 .8Z" /></svg>;
  return <svg slot={slot} className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
