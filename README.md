# 個人健康資料管理 PWA

依 3 張參考 App 截圖重新設計的可操作健康紀錄 PWA。介面採繁體中文、手機直向優先，並保留亮綠主色、雙語標示、卡片資訊、三大主導覽與時段式輸入等參考特色。

## 已完成

- 血壓、心率、血糖、體重、體溫、血氧、步數、睡眠等日常資料。
- HbA1c、血脂、肝功能、腎功能、全血球計數與尿液常規檢查。
- 新增、讀取、修改、刪除與本機 IndexedDB 持久化。
- Dashboard 最新值、完整歷史與 7／30／90 天趨勢。
- 個人基本資料、深色模式、三級字級。
- Web App Manifest、192／512 圖示、Service Worker 與基本離線能力。
- iPhone／Android 安裝引導與可用時的瀏覽器原生安裝提示。
- Repository 資料層，日後可替換成 API、Supabase、Firebase 或 HIS adapter。

第一次開啟會產生清楚標記為「示範資料」的虛構紀錄，方便檢視圖表與操作。

## 啟動

```bash
npm install
npm run dev
```

正式建置：

```bash
npm run build
npm run preview
```

PWA Service Worker 僅在正式建置模式註冊，因此請使用 `npm run build` 後的 preview 測試安裝與離線。

## 資料與隱私

本版沒有後端；資料只存在使用者目前瀏覽器的 IndexedDB。清除網站資料或移除瀏覽器儲存空間會刪除紀錄。此工具不提供醫療診斷，也不應取代專業醫療意見。

完整畫面、流程、資料模型與待確認項目請見 `ARCHITECTURE.md`。
