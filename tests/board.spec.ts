import { expect, test, type Page } from '@playwright/test';

const button = (page: Page, text: string) => page.locator('mdui-button').filter({ hasText: text });
const field = (page: Page, label: string) => page.locator(`mdui-text-field[label^="${label}"] input`);

async function openBoard(page: Page) {
  await page.goto('/');
  await expect(page.getByText('示例预览', { exact: true })).toBeVisible();
}

async function addPreset(page: Page, type: 'have' | 'want', character: string, quantity = 1) {
  await page.locator(`mdui-button-icon[aria-label="${type === 'have' ? '添加可换出商品' : '添加想要商品'}"]`).click();
  await page.getByRole('button', { name: `选择 ${character}`, exact: true }).click();
  await field(page, '商品名称').fill('测试徽章 / 缶バッジ');
  await field(page, '数量 /').fill(String(quantity));
  await button(page, '保存 / 保存 / Save').click();
  await expect(page.locator('mdui-dialog')).toHaveCount(0);
}

test('add, edit, decrement, restore, filter, reorder, and delete items', async ({ page }) => {
  await openBoard(page);
  await addPreset(page, 'have', '高坂穂乃果', 2);
  await expect(page.getByText('示例预览', { exact: true })).toHaveCount(0);
  await expect(page.locator('mdui-card')).toHaveCount(1);
  await addPreset(page, 'have', '南ことり');
  await addPreset(page, 'want', '西木野真姫');
  await expect(page.locator('.have .item-title-row h3')).toHaveText(['高坂穂乃果', '南ことり']);
  await page.locator('mdui-button-icon[aria-label="上移 南ことり"]').click();
  await expect(page.locator('.have .item-title-row h3')).toHaveText(['南ことり', '高坂穂乃果']);
  await page.locator('mdui-button-icon[aria-label="编辑 高坂穂乃果"]').click();
  await field(page, '备注').fill('只换同款 / 同種のみ');
  await button(page, '保存 / 保存 / Save').click();
  await expect(page.getByText('只换同款 / 同種のみ')).toBeVisible();
  await page.locator('mdui-button-icon[aria-label="交换一件 高坂穂乃果"]').click();
  const honoka = page.locator('mdui-card').filter({ has: page.locator('h3', { hasText: '高坂穂乃果' }) });
  await expect(honoka.locator('.quantity')).toHaveText('×1');
  await page.locator('mdui-button-icon[aria-label="交换一件 高坂穂乃果"]').click();
  await expect(honoka.locator('.quantity')).toHaveText('×0');
  await expect(honoka).toHaveClass(/traded/);
  await page.locator('mdui-switch').click();
  await expect(honoka).toHaveCount(0);
  await expect(page.locator('.want mdui-card')).toHaveCount(1);
  await page.locator('mdui-switch').click();
  await honoka.locator('mdui-button').filter({ hasText: 'Restore' }).click();
  await expect(honoka.locator('.quantity')).toHaveText('×1');
  await expect(honoka).not.toHaveClass(/traded/);
  await page.reload();
  await expect(page.locator('.have .item-title-row h3')).toHaveText(['南ことり', '高坂穂乃果']);
  await expect(page.getByText('只换同款 / 同種のみ')).toBeVisible();
  await page.locator('mdui-button-icon[aria-label="删除 南ことり"]').click();
  await button(page, '取消 / Cancel').click();
  await expect(page.locator('mdui-card')).toHaveCount(3);
  await page.locator('mdui-button-icon[aria-label="删除 南ことり"]').click();
  await button(page, '删除 / 削除 / Delete').click();
  await expect(page.locator('mdui-card')).toHaveCount(2);
  await page.locator('select').selectOption('aqours');
  await expect(page.locator('mdui-card')).toHaveCount(0);
  await page.locator('select').selectOption('all');
  await expect(page.locator('mdui-card')).toHaveCount(2);
});

test('uploaded image persists and board remains editable after offline reload', async ({ page, context }) => {
  await openBoard(page);
  await button(page, '开始我的交换板').click();
  await expect(page.locator('mdui-card')).toHaveCount(0);
  await page.locator('mdui-button-icon[aria-label="添加可换出商品"]').click();
  const imageData = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1200;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#dc92b8';
    context.fillRect(0, 0, 1600, 1200);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  const png = Buffer.from(imageData, 'base64');
  await page.locator('input[type=file]').setInputFiles({ name: 'badge.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('.editor-preview img')).toBeVisible();
  await field(page, '角色名称').fill('后藤ひとり');
  await field(page, '商品名称').fill('自定义徽章');
  await field(page, '数量 /').fill('2');
  await button(page, '保存 / 保存 / Save').click();
  await expect(page.locator('mdui-dialog')).toHaveCount(0);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(page.locator('.item-picture img')).toBeVisible();
  await expect.poll(() => page.locator('.item-picture img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth)).toBe(1200);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.item-title-row h3')).toHaveText('后藤ひとり');
  await expect.poll(() => page.locator('.item-picture img').evaluate((image: HTMLImageElement) => image.naturalWidth > 0)).toBe(true);
  await page.locator('mdui-button-icon[aria-label="交换一件 后藤ひとり"]').click();
  await expect(page.locator('.quantity')).toHaveText('×1');
  await addPreset(page, 'want', '南ことり');
  await page.locator('mdui-button-icon[aria-label="编辑 后藤ひとり"]').click();
  await expect(field(page, '商品名称')).toHaveValue('自定义徽章');
  await field(page, '商品名称').fill('离线修改');
  await expect(field(page, '商品名称')).toHaveValue('离线修改');
  await button(page, '保存 / 保存 / Save').click();
  await expect(page.getByText('离线修改', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('离线修改', { exact: true })).toBeVisible();
  await expect(page.locator('.want mdui-card')).toHaveCount(1);
});

test('display mode, image preview, theme persistence, responsive layout, and links', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await openBoard(page);
  await expect(page.locator('a[aria-label="GitHub 代码仓库"]')).toHaveAttribute('href', 'https://github.com/aimerneige/exchange-website');
  await expect(page.locator('.disclaimer')).toContainText('与 LoveLive! 官方无关');
  await page.getByRole('button', { name: '切换暗色主题', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(24, 30, 27)');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('mdui-button-icon[aria-label="切换亮色主题"]').click();
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });
  await button(page, '展示模式').click();
  await expect(page.locator('.display-mode')).toBeVisible();
  await expect(page.locator('.card-actions')).toHaveCount(0);
  await expect(page.locator('.board-toolbar')).toHaveCount(0);
  await expect(page.getByText('Would you like to trade?', { exact: false })).toBeVisible();
  await page.locator('.item-picture').first().click();
  await expect(page.locator('.preview-picture')).toBeVisible();
  await page.locator('.preview-picture').click();
  await expect(page.locator('mdui-dialog')).toHaveCount(0);
  await page.locator('mdui-button-icon.exit-display').click();
  await expect(page.locator('.display-mode')).toHaveCount(0);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
  await page.locator('mdui-button-icon[aria-label="添加可换出商品"]').click();
  await expect(page.locator('.editor-dialog')).toBeVisible();
  await expect(page.getByRole('textbox', { name: '角色名称 / キャラクター / Character *', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/mobile-editor.png', fullPage: true });
  await page.keyboard.press('Escape');
  await expect(page.locator('mdui-dialog')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('failed persistence keeps the editor open and the saved board unchanged', async ({ page }) => {
  await openBoard(page);
  await addPreset(page, 'have', '高坂穂乃果');
  await page.evaluate(() => {
    IDBObjectStore.prototype.put = () => { throw new DOMException('No space', 'QuotaExceededError'); };
  });
  await page.locator('mdui-button-icon[aria-label="编辑 高坂穂乃果"]').click();
  await field(page, '角色名称').fill('不应保存');
  await button(page, '保存 / 保存 / Save').click();
  await expect(page.locator('.editor-dialog')).toBeVisible();
  await page.locator('mdui-button-icon[aria-label="关闭 / 閉じる / Close"]').click();
  await expect(page.locator('.item-title-row h3')).toHaveText('高坂穂乃果');
  await expect(page.getByRole('alert')).toContainText('保存失败');
  await page.reload();
  await expect(page.locator('.item-title-row h3')).toHaveText('高坂穂乃果');
});

test('failed initial read prevents overwriting an existing saved board', async ({ page }) => {
  await openBoard(page);
  await addPreset(page, 'have', '高坂穂乃果');
  const fault = await page.addInitScript(() => {
    IDBObjectStore.prototype.get = () => { throw new DOMException('Storage denied', 'SecurityError'); };
  });
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('无法读取本地数据');
  await page.locator('mdui-button-icon[aria-label="添加想要商品"]').click();
  await page.getByRole('button', { name: '选择 南ことり', exact: true }).click();
  await button(page, '保存 / 保存 / Save').click();
  await expect(page.locator('.editor-dialog')).toBeVisible();
  await expect(page.locator('.error-banner')).toContainText('无法保存');
  await fault.dispose();
  await page.reload();
  await expect(page.locator('.item-title-row h3')).toHaveText('高坂穂乃果');
});
