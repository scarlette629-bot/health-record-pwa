import { useMemo, useState } from 'react';
import { METRICS, METRIC_MAP, formatMetricValue } from '../config/metrics';
import type { HealthRecord, MetricType } from '../types';
import { getTrendRangeBounds, type TrendRange } from '../utils/trendRange';

const RANGE_OPTIONS: Array<{ value: TrendRange; label: string; summary: string }> = [
  { value: '7d', label: '7 天', summary: '最近 7 天' },
  { value: '30d', label: '30 天', summary: '最近 30 天' },
  { value: '90d', label: '90 天', summary: '最近 90 天' },
  { value: '1y', label: '1 年', summary: '最近 1 年' },
  { value: '2y', label: '2 年', summary: '最近 2 年' },
];

const SERIES_COLORS = ['#119da4', '#ef5966', '#2898d5', '#ec8b35', '#5269d4', '#26a85d'];

function TrendChart({ records, type, range }: { records: HealthRecord[]; type: MetricType; range: TrendRange }) {
  const definition = METRIC_MAP[type];
  const points = [...records].sort((a, b) => a.measuredAt.localeCompare(b.measuredAt));
  const fields = definition.fields.filter((field) => field.inputType !== 'select' && points.some((record) => typeof record.values[field.key] === 'number'));
  const allValues = points.flatMap((record) => fields.map((field) => record.values[field.key])).filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  if (!points.length) return <div className="chart-empty"><span>⌁</span><strong>這個期間尚無資料</strong><p>新增紀錄後即可看到趨勢。</p></div>;
  if (!fields.length || !allValues.length) return <div className="chart-empty"><span>🧫</span><strong>質性檢查不繪製數值趨勢</strong><p>請至歷史紀錄查看每次陰性／陽性結果。</p></div>;

  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const padding = Math.max((max - min) * 0.18, max * 0.035, 1);
  const yMin = Math.max(0, min - padding);
  const yMax = max + padding;
  const width = 720;
  const height = 300;
  const plot = { left: 56, top: 24, right: 18, bottom: 52 };
  const x = (index: number) => plot.left + (points.length === 1 ? (width - plot.left - plot.right) / 2 : index * (width - plot.left - plot.right) / (points.length - 1));
  const y = (value: number) => plot.top + (yMax - value) * (height - plot.top - plot.bottom) / Math.max(yMax - yMin, 1);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => yMax - ratio * (yMax - yMin));

  return (
    <div className="chart-wrap">
      <svg className="trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${definition.label}趨勢圖`}>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={plot.left} y1={y(tick)} x2={width - plot.right} y2={y(tick)} className="grid-line" />
            <text x={plot.left - 10} y={y(tick) + 4} textAnchor="end" className="axis-text">{tick.toFixed((fields[0]?.step ?? 1) < 1 ? 1 : 0)}</text>
          </g>
        ))}
        {fields.map((field, fieldIndex) => {
          const fieldPoints = points.map((record, index) => ({ record, index, value: record.values[field.key] })).filter((point): point is { record: HealthRecord; index: number; value: number } => typeof point.value === 'number' && Number.isFinite(point.value));
          const path = fieldPoints.map((point, index) => `${index ? 'L' : 'M'} ${x(point.index)} ${y(point.value)}`).join(' ');
          return (
            <g key={field.key}>
              <path d={path} fill="none" stroke={SERIES_COLORS[fieldIndex]} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {fieldPoints.map((point) => <circle key={point.record.id} cx={x(point.index)} cy={y(point.value)} r="5" fill={SERIES_COLORS[fieldIndex]} stroke="var(--surface)" strokeWidth="3"><title>{`${field.label}: ${point.value} ${field.unit}`}</title></circle>)}
            </g>
          );
        })}
        {points.map((record, index) => {
          const show = points.length <= 7 || index === 0 || index === points.length - 1 || index % Math.ceil(points.length / 5) === 0;
          const dateFormat = range.endsWith('y')
            ? { year: '2-digit', month: 'numeric' } as const
            : { month: 'numeric', day: 'numeric' } as const;
          return show ? <text key={record.id} x={x(index)} y={height - 18} textAnchor="middle" className="axis-text">{new Intl.DateTimeFormat('zh-TW', dateFormat).format(new Date(record.measuredAt))}</text> : null;
        })}
      </svg>
      <div className="chart-legend">
        {fields.map((field, index) => <span key={field.key}><i style={{ background: SERIES_COLORS[index] }} />{field.label}（{field.unit}）</span>)}
      </div>
    </div>
  );
}

export function TrackingPage({ records }: { records: HealthRecord[] }) {
  const [type, setType] = useState<MetricType>('bloodPressure');
  const [range, setRange] = useState<TrendRange>('30d');
  const typeRecords = useMemo(() => records.filter((record) => record.type === type), [records, type]);
  const periodRecords = useMemo(() => {
    const { start, end } = getTrendRangeBounds(typeRecords.map((record) => record.measuredAt), range);
    return typeRecords.filter((record) => {
      const measuredAt = new Date(record.measuredAt);
      return measuredAt >= start && measuredAt <= end;
    });
  }, [typeRecords, range]);
  const definition = METRIC_MAP[type];
  const rangeSummary = RANGE_OPTIONS.find((option) => option.value === range)?.summary ?? '';
  const numericFields = definition.fields.filter((field) => field.inputType !== 'select');
  const average = periodRecords.length && numericFields.length
    ? Object.fromEntries(numericFields.flatMap((field) => {
      const values = periodRecords.map((record) => record.values[field.key]).filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
      return values.length ? [[field.key, values.reduce((sum, value) => sum + value, 0) / values.length]] : [];
    }))
    : undefined;

  return (
    <main className="page tracking-page" id="main-content">
      <section className="workspace-card">
        <div className="workspace-heading tracking-heading">
          <div><span className="pill-label">追蹤</span><h1>健康趨勢</h1></div>
          <div className="segmented range-control" aria-label="趨勢期間">
            {RANGE_OPTIONS.map((option) => <button key={option.value} className={range === option.value ? 'active' : ''} onClick={() => setRange(option.value)}>{option.label}</button>)}
          </div>
        </div>
        <div className="tracking-layout">
          <aside className="metric-rail" aria-label="選擇健康指標">
            {METRICS.map((metric) => <button key={metric.type} className={type === metric.type ? 'active' : ''} onClick={() => setType(metric.type)}><span>{metric.icon}</span><span>{metric.label}</span></button>)}
          </aside>
          <div className="trend-panel">
            <div className="trend-summary">
              <div><span className="metric-icon" style={{ background: definition.softColor }}>{definition.icon}</span><div><small>{rangeSummary}</small><h2>{definition.label}趨勢</h2></div></div>
              <div className="average-card"><small>{numericFields.length ? '期間平均' : '結果類型'}</small><strong>{numericFields.length ? (average ? formatMetricValue(type, average) : '—') : '質性檢查'}</strong><span>{periodRecords.length} 筆紀錄</span></div>
            </div>
            <TrendChart records={periodRecords} type={type} range={range} />
            <div className="reference-box"><strong>追蹤提示</strong><p>{definition.reference} 圖表僅呈現個人紀錄變化，不提供診斷。</p></div>
          </div>
        </div>
      </section>
    </main>
  );
}
