import type { TradeItem } from '../types';

let database: Promise<IDBDatabase> | undefined;

function openDatabase() {
  if (!database) {
    database = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('exchange-board', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('board');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Database upgrade blocked'));
    });
    database.catch(() => { database = undefined; });
  }
  return database;
}

export async function loadItems(): Promise<TradeItem[] | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction('board').objectStore('board').get('items');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveItems(items: TradeItem[]) {
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('board', 'readwrite');
    transaction.objectStore('board').put(items, 'items');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error ?? new Error('Save aborted'));
  });
}

export async function preparePhoto(file: File): Promise<Blob> {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    throw new Error('请选择 JPG、PNG、WebP 或 GIF 图片 / Please choose an image.');
  }
  if (file.size > 20 * 1024 * 1024) throw new Error('图片不能超过 20 MB / Image must be under 20 MB.');
  const bitmap = await createImageBitmap(file);
  try {
    const ratio = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('无法处理图片 / Could not process image.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('无法处理图片 / Could not process image.')),
      'image/webp', 0.86,
    ));
  } finally {
    bitmap.close();
  }
}
