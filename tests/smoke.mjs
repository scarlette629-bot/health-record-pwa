import { chromium } from 'playwright';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const cdpURL = process.env.CDP_URL;
const browser = cdpURL
  ? await chromium.connectOverCDP(cdpURL)
  : await chromium.launch({ channel: 'chrome', headless: true });
const context = cdpURL
  ? await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'zh-TW' })
  : await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'zh-TW' });
const page = await context.newPage();

function check(value, message) {
  if (!value) throw new Error(message);
}

async function countText(text) {
  return page.getByText(text, { exact: false }).count();
}

try {
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /照顧自己從記錄開始/ }).waitFor();

  // Create
  await page.getByRole('button', { name: '新增體溫紀錄' }).click();
  await page.getByLabel('體溫 (°C)').fill('37.2');
  await page.getByPlaceholder('例如：早餐前、運動後、感覺不適…').fill('端到端測試');
  await page.getByRole('button', { name: '新增紀錄', exact: true }).click();
  await page.getByText('紀錄已儲存，總覽同步完成').waitFor();
  check(await countText('37.2 °C'), '新增後 Dashboard 未同步顯示體溫');

  // Read in history
  await page.getByRole('button', { name: '查看體溫歷史' }).click();
  const createdRow = page.locator('.history-item').filter({ hasText: '37.2 °C' });
  await createdRow.waitFor();
  check(await createdRow.getByText('端到端測試').isVisible(), '歷史紀錄未顯示新增資料');

  // Update
  await createdRow.getByRole('button', { name: '編輯體溫紀錄' }).click();
  await page.getByLabel('體溫 (°C)').fill('37.4');
  await page.getByRole('button', { name: '儲存修改' }).click();
  await page.getByText('紀錄已更新，趨勢同步完成').waitFor();
  check(await countText('37.4 °C'), '修改後歷史紀錄未更新');

  // Trend update
  await page.getByRole('button', { name: '追蹤' }).click();
  await page.getByRole('button', { name: '90 天', exact: true }).click();
  await page.getByRole('button', { name: '1 年', exact: true }).click();
  await page.getByRole('button', { name: '2 年', exact: true }).click();
  await page.locator('.metric-rail').getByRole('button', { name: /體溫/ }).click();
  await page.getByRole('img', { name: '體溫趨勢圖' }).waitFor();
  check(await page.locator('.average-card').getByText(/筆紀錄/).isVisible(), '趨勢摘要未顯示');

  // Delete
  await page.getByRole('button', { name: '記錄' }).click();
  await page.getByRole('button', { name: '歷史', exact: true }).click();
  await page.getByRole('button', { name: /體溫/ }).click();
  const updatedRow = page.locator('.history-item').filter({ hasText: '37.4 °C' });
  await updatedRow.getByRole('button', { name: '刪除體溫紀錄' }).click();
  await page.getByRole('button', { name: '確認刪除' }).click();
  await page.getByText('紀錄已刪除，趨勢同步完成').waitFor();
  check(await page.locator('.history-item').filter({ hasText: '37.4 °C' }).count() === 0, '刪除後紀錄仍存在');

  // Persistence after reopen/reload
  await page.getByRole('button', { name: '總覽' }).click();
  await page.getByRole('button', { name: '新增體重紀錄' }).click();
  await page.getByLabel('體重 (kg)').fill('77.7');
  await page.getByRole('button', { name: '新增紀錄', exact: true }).click();
  await page.getByText('紀錄已儲存，總覽同步完成').waitFor();
  await page.reload({ waitUntil: 'networkidle' });
  check(await countText('77.7 kg'), '重新開啟後 IndexedDB 資料未保留');

  // Manifest and service worker / offline shell
  const manifestResponse = await page.request.get(`${baseURL}/manifest.webmanifest`);
  check(manifestResponse.ok(), 'Manifest 無法讀取');
  await page.evaluate(async () => Boolean(await navigator.serviceWorker?.ready));
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: /照顧自己從記錄開始/ }).waitFor();
  check(await countText('77.7 kg'), '離線重新開啟後資料未顯示');

  console.log('PASS create → dashboard → history → update → trend → delete → persistence → offline');
} finally {
  await context.close();
  await browser.close();
}
