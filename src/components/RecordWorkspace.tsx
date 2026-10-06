import { useMemo, useState } from 'react';
import { METRICS, METRIC_MAP, PERIOD_LABELS, formatMetricValue } from '../config/metrics';
import type { HealthRecord, MetricType } from '../types';

const CATEGORIES = [
  { id: 'vitals', label: '日常健康監測', icon: '⌁' },
  { id: 'metabolic', label: '代謝與三高檢查', icon: '🧪' },
  { id: 'laboratory', label: '血液與器官功能', icon: '🔬' },
  { id: 'urine', label: '尿液檢查', icon: '🧫' },
] as const;

interface Props {
  records: HealthRecord[];
  initialType?: MetricType;
  initialMode?: 'picker' | 'history';
  onAdd: (type: MetricType) => void;
  onEdit: (record: HealthRecord) => void;
  onDelete: (record: HealthRecord) => void;
}

function longDate(iso: string) {
  return new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));
}

export function RecordWorkspace({ records, initialType, initialMode = 'picker', onAdd, onEdit, onDelete }: Props) {
  const [mode, setMode] = useState<'picker' | 'history'>(initialMode);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<MetricType | 'all'>(initialType ?? 'all');
  const filteredMetrics = METRICS.filter((metric) => `${metric.label} ${metric.english}`.toLowerCase().includes(query.trim().toLowerCase()));
  const filteredRecords = useMemo(() => filterType === 'all' ? records : records.filter((record) => record.type === filterType), [filterType, records]);

  return (
    <main className="page record-page" id="main-content">
      <section className="workspace-card">
        <div className="workspace-heading">
          <div><span className="pill-label">記錄</span><h1>記錄健康數據</h1></div>
          <div className="segmented compact">
            <button className={mode === 'picker' ? 'active' : ''} onClick={() => setMode('picker')}>新增</button>
            <button className={mode === 'history' ? 'active' : ''} onClick={() => setMode('history')}>歷史</button>
          </div>
        </div>

        {mode === 'picker' ? (
          <>
            <label className="search-field">
              <span aria-hidden="true">⌕</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋指標（中文／英文）" aria-label="搜尋健康指標" />
              {query && <button onClick={() => setQuery('')} aria-label="清除搜尋">×</button>}
            </label>
            {CATEGORIES.map((category) => {
              const categoryMetrics = filteredMetrics.filter((metric) => metric.category === category.id);
              if (!categoryMetrics.length) return null;
              return (
                <section className="metric-category" key={category.id}>
                  <div className="category-header"><span>{category.icon}</span><strong>{category.label}</strong><small>{categoryMetrics.length} 項</small></div>
                  <div className="metric-picker-grid">
                    {categoryMetrics.map((metric) => (
                      <button key={metric.type} className="picker-item" onClick={() => onAdd(metric.type)} style={{ '--metric-color': metric.color, '--metric-soft': metric.softColor } as React.CSSProperties}>
                        <span className="picker-icon" aria-hidden="true">{metric.icon}</span>
                        <span><strong>{metric.label}</strong><small>{metric.english}</small></span>
                        <span className="picker-add">＋</span>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
            {!filteredMetrics.length && <div className="empty-state"><span>⌕</span><strong>找不到符合的指標</strong><p>請改用其他關鍵字。</p></div>}
            <div className="pending-note"><strong>檢驗提醒：</strong>畫面顯示的是常見參考區間；不同實驗室、檢驗方法與個人疾病風險可能使用不同範圍，請以原始檢驗報告及醫師判讀為準。</div>
          </>
        ) : (
          <>
            <div className="filter-strip" role="group" aria-label="歷史紀錄篩選">
              <button className={filterType === 'all' ? 'active' : ''} onClick={() => setFilterType('all')}>全部</button>
              {METRICS.map((metric) => <button key={metric.type} className={filterType === metric.type ? 'active' : ''} onClick={() => setFilterType(metric.type)}>{metric.icon} {metric.label}</button>)}
            </div>
            <div className="history-list">
              {filteredRecords.map((record) => {
                const metric = METRIC_MAP[record.type];
                return (
                  <article className="history-item" key={record.id}>
                    <span className="history-icon" style={{ background: metric.softColor }} aria-hidden="true">{metric.icon}</span>
                    <div className="history-copy">
                      <div><strong>{metric.label}</strong><span>{formatMetricValue(record.type, record.values)}</span></div>
                      <time>{longDate(record.measuredAt)} · {PERIOD_LABELS[record.period]}</time>
                      {metric.fields.length > 1 && <div className="history-value-grid">
                        {metric.fields.filter((field) => record.values[field.key] !== undefined).map((field) => {
                          const raw = record.values[field.key];
                          const display = typeof raw === 'string' ? (field.options?.find((option) => option.value === raw)?.label ?? raw) : raw?.toLocaleString('zh-TW');
                          return <span key={field.key}><small>{field.label}</small><b>{display} {field.unit}</b></span>;
                        })}
                      </div>}
                      {record.note && <small>{record.note}</small>}
                    </div>
                    <div className="history-actions">
                      <button onClick={() => onEdit(record)} aria-label={`編輯${metric.label}紀錄`}>編輯</button>
                      <button className="danger" onClick={() => onDelete(record)} aria-label={`刪除${metric.label}紀錄`}>刪除</button>
                    </div>
                  </article>
                );
              })}
              {!filteredRecords.length && <div className="empty-state"><span>🗂️</span><strong>尚無紀錄</strong><p>新增資料後會顯示在這裡。</p></div>}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
