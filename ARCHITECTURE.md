# 個人健康資料管理 PWA — 產品與技術架構

## 參考圖片盤點

共分析 3 張手機截圖。可確認的設計語言包括：高辨識度亮綠色、醫療十字識別、中文主標搭配英文副標、本人／新增／深色／更多／字級工具列，以及「總覽、記錄、追蹤」三分頁。記錄區採分類清單與搜尋；血壓表單具有日期、上午／下午／晚上、可選精確時間、收縮壓與舒張壓欄位及參考資訊；總覽採大型卡片並附非醫療診斷用途提醒。

## 1. Screen List

1. 總覽 Dashboard：摘要、最近紀錄、各指標最新值、快速新增。
2. 記錄類型：8 類核心指標搜尋與選擇。
3. 新增／編輯紀錄：依資料類型顯示欄位、日期、時段、精確時間與備註。
4. 歷史紀錄：依指標篩選、編輯、刪除。
5. 追蹤趨勢：7／30／90 天區間、指標切換、折線圖與期間摘要。
6. 個人基本資料：暱稱、出生年、性別（可不填）、身高。
7. PWA 安裝／離線說明。

## 2. Feature List

- 血壓、心率、血糖、體重、體溫、血氧、步數、睡眠。
- HbA1c、血脂、肝功能、腎功能、全血球計數與尿液常規檢查；數值型項目支援趨勢，質性尿液結果支援歷史追蹤。
- 完整 CRUD 與 IndexedDB 持久化。
- Dashboard 最新值與今日活動摘要。
- 歷史篩選、修改、刪除。
- 7／30／90 天趨勢與統計摘要。
- 深色模式、三級字級、響應式版面。
- PWA Manifest、Service Worker、安裝提示、基本離線能力。
- Repository 資料介面，日後可換成 API／Supabase／Firebase／HIS adapter。

## 3. User Flow

總覽 → 快速新增／記錄頁選類型 → 填寫數值與測量時間 → 儲存 → Dashboard 與歷史同步 → 編輯／刪除 → 趨勢同步更新。個人資料與顯示設定從頂部工具列進入。

## 4. Navigation Structure

- 全域 Header：品牌、本人、安裝、深色模式、字級、更多／個人資料。
- 主導覽：總覽／記錄／追蹤。
- 記錄頁次導覽：指標選擇／歷史紀錄。
- Modal：新增／編輯、個人資料、安裝說明、刪除確認。

## 5. Data Model

- `HealthRecord`: `id`, `type`, `measuredAt`, `period`, `values`, `note`, `createdAt`, `updatedAt`。
- `values` 依類型使用設定檔定義，例如血壓為 `systolic`, `diastolic`, `pulse`。
- `UserProfile`: `displayName`, `birthYear?`, `sex?`, `heightCm?`。
- `AppSettings`: `theme`, `fontScale`, `seeded`。
- IndexedDB stores：`records`（以 `measuredAt`、`type` 建索引）、`settings`。

## 6. UI Component Structure

`AppShell` → `Header` + `PrimaryNav` + Page；Page 包含 `Dashboard`, `RecordWorkspace`（`MetricPicker`, `HistoryList`）, `TrackingPage`（`TrendChart`）；全域 overlays 包含 `RecordForm`, `ProfileDialog`, `InstallDialog`, `ConfirmDialog`, `Toast`。

## 待確認

- 參考圖中的「批次輸入」實際欄位與送出規則。
- 血脂、肝功能、腎功能、尿酸等非本次核心項目的資料規格。
- 個別院所檢驗方法、參考區間、適用族群與更新版本；介面僅呈現常見參考值，正式判讀以原始檢驗報告及醫師說明為準。
- 與院方帳號、儀器或 HIS 的登入、授權、同步及審核流程。

本 MVP 不提供診斷，不將任何參考值視為醫療判定；所有開發與測試資料均為虛構資料。
