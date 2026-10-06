import { useMemo, useState } from 'react';
import { METRIC_MAP, PERIOD_LABELS } from '../config/metrics';
import type { HealthRecord, MetricType, Period } from '../types';

function localDate(iso?: string) {
  const date = iso ? new Date(iso) : new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function localTime(iso?: string) {
  const date = iso ? new Date(iso) : new Date();
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function inferPeriod() : Period {
  const hour = new Date().getHours();
  return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
}

interface Props {
  type: MetricType;
  existing?: HealthRecord;
  onClose: () => void;
  onSave: (record: HealthRecord) => Promise<void>;
}

export function RecordForm({ type, existing, onClose, onSave }: Props) {
  const metric = METRIC_MAP[type];
  const [date, setDate] = useState(localDate(existing?.measuredAt));
  const [period, setPeriod] = useState<Period>(existing?.period ?? inferPeriod());
  const [useExactTime, setUseExactTime] = useState(Boolean(existing));
  const [time, setTime] = useState(localTime(existing?.measuredAt));
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(metric.fields.map((field) => [field.key, existing?.values[field.key]?.toString() ?? ''])));
  const [note, setNote] = useState(existing?.note ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const title = existing ? `修改${metric.label}紀錄` : `新增${metric.label}紀錄`;
  const isValid = useMemo(() => {
    const filledFields = metric.fields.filter((field) => values[field.key] !== '');
    if (!filledFields.length) return false;
    return metric.fields.every((field) => {
      const raw = values[field.key];
      if (!raw) return !field.required;
      if (field.inputType === 'select') return Boolean(field.options?.some((option) => option.value === raw));
      const value = Number(raw);
      return Number.isFinite(value) && value >= (field.min ?? -Infinity) && value <= (field.max ?? Infinity);
    });
  }, [metric.fields, values]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValid) { setError('請檢查必填欄位與輸入範圍。'); return; }
    setSaving(true);
    setError('');
    try {
      const fallbackTimes: Record<Period, string> = { morning: '08:00', afternoon: '14:00', evening: '20:00' };
      const measuredAt = new Date(`${date}T${useExactTime ? time : fallbackTimes[period]}`).toISOString();
      const now = new Date().toISOString();
      await onSave({
        id: existing?.id ?? crypto.randomUUID(),
        type,
        measuredAt,
        period,
        values: Object.fromEntries(metric.fields.flatMap((field) => {
          const value = values[field.key];
          if (!value) return [];
          return [[field.key, field.inputType === 'select' ? value : Number(value)]];
        })),
        note: note.trim(),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      });
    } catch {
      setSaving(false);
      setError('儲存失敗，請稍後再試。');
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="record-sheet" role="dialog" aria-modal="true" aria-labelledby="record-form-title">
        <div className="sheet-handle" />
        <div className="sheet-header">
          <button className="icon-button" onClick={onClose} aria-label="關閉">×</button>
          <div className="record-title"><span className="metric-icon" style={{ background: metric.softColor }}>{metric.icon}</span><div><small>{existing ? '編輯紀錄' : '記錄健康數據'}</small><h2 id="record-form-title">{title}</h2></div></div>
          <span className="header-spacer" />
        </div>
        <form onSubmit={submit} className="record-form">
          <div className="date-period-grid">
            <label className="field"><span>日期 <small>Date</small></span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
            <fieldset className="period-field"><legend>時段 <small>Period</small></legend><div className="segmented">{(Object.keys(PERIOD_LABELS) as Period[]).map((key) => <button type="button" key={key} className={period === key ? 'active' : ''} onClick={() => setPeriod(key)}>{PERIOD_LABELS[key]}</button>)}</div></fieldset>
          </div>
          <label className="checkbox-row"><input type="checkbox" checked={useExactTime} onChange={(event) => setUseExactTime(event.target.checked)} /><span><strong>指定時間</strong><small>不勾選時僅記錄時段</small></span></label>
          {useExactTime && <label className="field exact-time"><span>測量時間 <small>Time</small></span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} required /></label>}
          <div className="form-divider"><span>{metric.label}</span><small>{metric.english}</small></div>
          {metric.fields.map((field) => (
            <div className="value-field-block" key={field.key}>
              <label className="field value-field"><span>{field.label} {field.unit && <b>({field.unit})</b>} {!field.required && <small>選填</small>}</span><div>
                {field.inputType === 'select' ? (
                  <select value={values[field.key]} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}>
                    <option value="">請選擇結果</option>
                    {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                ) : (
                  <input type="number" inputMode="decimal" min={field.min} max={field.max} step={field.step} value={values[field.key]} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} placeholder={field.placeholder} required={field.required} />
                )}
                {field.unit && <em>{field.unit}</em>}
              </div></label>
              <p className="range-hint">{field.reference ? `參考：${field.reference}` : `輸入範圍 ${field.min}–${field.max} ${field.unit}`}</p>
            </div>
          ))}
          <label className="field"><span>備註 <small>Note（選填）</small></span><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={120} placeholder="例如：早餐前、運動後、感覺不適…" /><small className="char-count">{note.length}/120</small></label>
          <aside className="form-reference"><strong>📊 記錄提醒</strong><p>{metric.reference} 本工具不提供醫療診斷。</p></aside>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="form-actions"><button type="button" className="secondary-button" onClick={onClose}>取消</button><button type="submit" className="primary-button" disabled={!isValid || saving}>{saving ? '儲存中…' : existing ? '儲存修改' : '新增紀錄'}</button></div>
        </form>
      </section>
    </div>
  );
}
