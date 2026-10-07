# Self-Care v0.1 → v1.0 資料遷移邊界

## 不變的 v0.1 資料契約

- IndexedDB 名稱：`health-record-pwa`
- 目前資料庫版本：`1`
- `records` store：`keyPath = id`，索引為 `measuredAt`、`type`
- `settings` store：保留 `profile` 與 `appSettings`
- `HealthRecord.id`、`type`、`measuredAt`、`period`、`values`、`note`、`createdAt`、`updatedAt` 不修改
- CSV 匯入、匯出與去重規則保持相容

Phase 1 不升級 IndexedDB version、不建立新 store、不重寫既有紀錄，也不清除任何 LocalStorage、IndexedDB 或 Cache Storage 以外的資料。

## v1.0 新模型策略

後續 Phase 只在需要時以獨立 store 加入 `TrackingPreference`、`LabBatch`、`LabResult`、`MigraineAttack`、`MenstrualCycle`、`SymptomLog`、`Medication`、`MedicationEvent`、`Assessment`、`NutritionLog`、`ExerciseLog`、`FallEvent`、`VisionRecord`、`EyeCondition`、`HearingRecord`、`PreventiveCare`、`Vaccination`、`VaccineDose`、`Appointment` 與 `Reminder`。

新模型不得塞入 `HealthRecord.type`。跨模組 Timeline 只聚合查詢，不複製原始資料。共用 Reminder 與 PreventiveCare 只保存一份來源資料。

每次 IndexedDB 升級必須：

1. 僅提高一個明確版本。
2. `onupgradeneeded` 只新增缺少的 store／index。
3. 不刪除舊 store、不改變既有 keyPath、不重建既有 ID。
4. 先使用 v0.1 fixture 執行 migration test，再進入下一 Phase。

## Rollback

- 程式碼：由 `v0.1` tag 或 `backup-v0.1` 回復。
- 部署：以 v0.1 commit `edbd47747a010e138979b6a3497f5a80cac65650` 重新部署同一 GitHub Pages URL。
- 資料：v0.1 store 保持原樣，因此回復程式碼後仍可讀取原 HealthRecord／Profile／Settings。
- 注意：未來 v1.0 新 store 在 rollback 時保留但不由 v0.1 讀取；不得以 rollback 為由刪除它們。


