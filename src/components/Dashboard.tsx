import { METRICS, formatMetricValue } from '../config/metrics';
import type { HealthRecord, MetricType, UserProfile } from '../types';

interface DashboardProps {
  records: HealthRecord[];
  profile: UserProfile;
  onAdd: (type: MetricType) => void;
  onOpenHistory: (type: MetricType) => void;
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));
}

export function Dashboard({ records, profile, onAdd, onOpenHistory }: DashboardProps) {
  const latest = new Map<MetricType, HealthRecord>();
  for (const record of records) if (!latest.has(record.type)) latest.set(record.type, record);
  const todayKey = new Date().toLocaleDateString('sv-SE');
  const todayCount = records.filter((record) => new Date(record.measuredAt).toLocaleDateString('sv-SE') === todayKey).length;

  return (
    <main className="page dashboard-page" id="main-content">
      <section className="hero-card">
        <div>
          <span className="eyebrow">今日健康摘要</span>
          <h1>{profile.displayName || '本人'}，照顧自己從記錄開始</h1>
          <p>所有資料都儲存在這台裝置，不會自動上傳。</p>
        </div>
        <div className="today-ring" aria-label={`今日已完成 ${todayCount} 筆記錄`}>
          <strong>{todayCount}</strong><span>今日記錄</span>
        </div>
      </section>

      <div className="section-heading">
        <div><span className="pill-label">總覽</span><h2>最新健康數據</h2></div>
        <span className="muted">點卡片查看紀錄</span>
      </div>

      <section className="metric-grid" aria-label="各項健康指標最新數據">
        {METRICS.map((metric) => {
          const record = latest.get(metric.type);
          return (
            <article className="metric-card" key={metric.type} style={{ '--metric-color': metric.color, '--metric-soft': metric.softColor } as React.CSSProperties}>
              <button className="metric-card-main" onClick={() => onOpenHistory(metric.type)} aria-label={`查看${metric.label}歷史`}>
                <span className="metric-icon" aria-hidden="true">{metric.icon}</span>
                <span className="metric-label"><strong>{metric.label}</strong><small>{metric.english}</small></span>
                <span className={`metric-value ${record ? '' : 'empty'}`}>{record ? formatMetricValue(metric.type, record.values) : '尚無記錄'}</span>
                {record && <time>{formatDateTime(record.measuredAt)}</time>}
              </button>
              <button className="quick-add" onClick={() => onAdd(metric.type)} aria-label={`新增${metric.label}紀錄`}>＋</button>
            </article>
          );
        })}
      </section>

      <aside className="medical-notice">
        <span aria-hidden="true">⚠️</span>
        <p><strong>重要提醒：</strong>本工具僅供個人健康追蹤，不作為醫療診斷依據。若數值異常或身體不適，請儘速就醫並由專業醫護人員評估。</p>
      </aside>
    </main>
  );
}
