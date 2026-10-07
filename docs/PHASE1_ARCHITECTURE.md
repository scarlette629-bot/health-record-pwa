# Phase 1：版本、品牌、Localization 與 PWA 更新策略

## 版本架構

- GitHub 正式基準：`v0.1`
- v1.0 開發分支：`upgrade/v1.0`
- App 顯示版本集中於 `src/config/version.ts`
- App release version 與 IndexedDB schema version 分離，避免為了 UI 版本任意升級資料庫
- Phase 10 才移除「開發中」並建立 `v1.0` tag／Release

## 品牌

- Navbar 使用透明背景精簡標誌，保持手機高度與觸控工具列空間
- 完整 Self-Care Logo 保留為首頁、Splash 或 About 可用資產
- 不改動既有主要配色與資訊架構

## Localization

- 預設 `zh-TW`
- 預留 `en`
- 新增 UI 必須使用 localization key
- Phase 1 先遷移 App Shell、Header、Primary Navigation、Footer、版本與更新提示；各健康 domain 文案在進入該 domain Phase 時同步遷移
- 使用者輸入內容不翻譯

## PWA 更新策略

- 保持 `/health-record-pwa/` start URL、scope 與 GitHub Pages URL
- static cache 使用 `self-care-static-*` 命名空間
- activate 只清理同命名空間的舊靜態 cache
- Cache Storage 與 IndexedDB 完全分離
- 新 Service Worker 安裝後顯示「有新版本可用」，由使用者按鈕觸發 `SKIP_WAITING`
- controller 變更後重新載入；不要求重新安裝 PWA
- navigation 採 network-first＋離線 shell fallback；同源靜態資源採 cache-first 並背景更新


