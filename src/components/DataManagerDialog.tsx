import { useState } from 'react';
import { METRICS } from '../config/metrics';
import type { HealthRecord, MetricType } from '../types';
import { importRecordsFromCsv, metricTemplateCsv, recordsToCsv, type CsvImportResult } from '../utils/csv';

function downloadText(content: string, fileName: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportFileName(prefix = 'health-records') {
  const date = new Date();
  const stamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return `${prefix}-${stamp}.csv`;
}

interface Props {
  records: HealthRecord[];
  onClose: () => void;
  onImport: (records: HealthRecord[]) => Promise<void>;
}

export function DataManagerDialog({ records, onClose, onImport }: Props) {
  const [importType, setImportType] = useState<MetricType>('bloodLipids');
  const [preview, setPreview] = useState<CsvImportResult>();
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState('');
  const [importing, setImporting] = useState(false);

  async function shareToDrive() {
    const file = new File([recordsToCsv(records)], exportFileName(), { type: 'text/csv;charset=utf-8' });
    const shareNavigator = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
    try {
      if (navigator.share && (!shareNavigator.canShare || shareNavigator.canShare({ files: [file] }))) {
        await navigator.share({ title: '健康資料 CSV 備份', text: '請在分享選單選擇 Google 雲端硬碟。', files: [file] });
        setMessage('分享完成。若已選擇 Google 雲端硬碟，檔案會出現在你的雲端硬碟。');
      } else {
        downloadText(await file.text(), file.name);
        setMessage('此瀏覽器不支援檔案分享，已改為下載 CSV；請再上傳至 Google 雲端硬碟。');
      }
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') setMessage('無法開啟分享選單，請改用「下載全部 CSV」。');
    }
  }

  async function selectFile(file?: File) {
    if (!file) return;
    setFileName(file.name);
    setMessage('');
    try { setPreview(importRecordsFromCsv(await file.text(), importType, records)); }
    catch { setPreview({ records: [], errors: ['CSV 讀取失敗，請確認檔案編碼為 UTF-8。'], duplicateCount: 0, totalRows: 0 }); }
  }

  return (
    <div className="modal-backdrop centered" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog data-dialog" role="dialog" aria-modal="true" aria-labelledby="data-title">
        <div className="dialog-header"><div><span className="pill-label">資料</span><h2 id="data-title">CSV 備份與匯入</h2></div><button className="icon-button" onClick={onClose} aria-label="關閉">×</button></div>
        <div className="dialog-form data-manager-content">
          <section className="data-section">
            <div><h3>備份到 Google 雲端硬碟</h3><p>建立包含全部健康紀錄的 CSV。手機上請在系統分享選單選擇 Google 雲端硬碟。</p></div>
            <div className="data-actions">
              <button className="primary-button" disabled={!records.length} onClick={shareToDrive}>☁️ 分享至 Google Drive</button>
              <button className="secondary-button" disabled={!records.length} onClick={() => { downloadText(recordsToCsv(records), exportFileName()); setMessage('CSV 已下載。'); }}>下載全部 CSV</button>
            </div>
            <small>目前共有 {records.length} 筆紀錄可備份。</small>
          </section>

          <section className="data-section">
            <div><h3>匯入自己的 CSV</h3><p>App 匯出的 CSV 會自動判斷類型；一般 CSV 請先選擇資料類型，系統會辨識常見中英文欄位。</p></div>
            <label className="field"><span>CSV 主要資料類型</span><select value={importType} onChange={(event) => { setImportType(event.target.value as MetricType); setPreview(undefined); setFileName(''); }}>
              {METRICS.map((metric) => <option key={metric.type} value={metric.type}>{metric.label} · {metric.english}</option>)}
            </select></label>
            <div className="data-actions">
              <label className="primary-button file-button">選擇 CSV<input type="file" accept=".csv,text/csv" onChange={(event) => selectFile(event.target.files?.[0])} /></label>
              <button className="secondary-button" onClick={() => downloadText(metricTemplateCsv(importType), `${importType}-template.csv`)}>下載欄位範本</button>
            </div>
            {fileName && <small>已選擇：{fileName}</small>}
          </section>

          {preview && <section className="import-preview" aria-live="polite">
            <h3>匯入預覽</h3>
            <div className="preview-stats"><span><strong>{preview.totalRows}</strong>資料列</span><span className="success"><strong>{preview.records.length}</strong>可匯入</span><span><strong>{preview.duplicateCount}</strong>重複略過</span><span className={preview.errors.length ? 'error' : ''}><strong>{preview.errors.length}</strong>錯誤</span></div>
            {preview.errors.length > 0 && <ul className="import-errors">{preview.errors.slice(0, 6).map((error) => <li key={error}>{error}</li>)}{preview.errors.length > 6 && <li>另有 {preview.errors.length - 6} 筆錯誤未顯示。</li>}</ul>}
            <p>匯入只會新增通過驗證且未重複的紀錄，不會覆寫原有資料。</p>
            <button className="primary-button wide" disabled={!preview.records.length || importing} onClick={async () => { setImporting(true); await onImport(preview.records); }}>{importing ? '匯入中…' : `確認匯入 ${preview.records.length} 筆`}</button>
          </section>}

          {message && <p className="success-box" role="status">{message}</p>}
          <p className="privacy-note">🔒 CSV 含有健康資料。請只儲存到你自己的私人 Google 雲端硬碟，避免使用公開分享連結。</p>
        </div>
      </section>
    </div>
  );
}

