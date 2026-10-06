import type { MetricDefinition, MetricType, Period } from '../types';

export const METRICS: MetricDefinition[] = [
  {
    type: 'bloodPressure', label: '血壓', english: 'Blood Pressure', icon: '🩺', color: '#ef5966', softColor: '#fff0f2', category: 'vitals',
    fields: [
      { key: 'systolic', label: '收縮壓 SBP', unit: 'mmHg', min: 50, max: 260, step: 1, placeholder: '例如 118', required: true, reference: '一般正常值 < 120 mmHg' },
      { key: 'diastolic', label: '舒張壓 DBP', unit: 'mmHg', min: 30, max: 180, step: 1, placeholder: '例如 76', required: true, reference: '一般正常值 < 80 mmHg' },
      { key: 'pulse', label: '脈搏 Pulse', unit: 'bpm', min: 25, max: 240, step: 1, placeholder: '例如 72' },
    ],
    reference: '請依醫護人員提供的個人目標範圍追蹤。',
  },
  {
    type: 'heartRate', label: '心率', english: 'Heart Rate', icon: '❤️', color: '#ef5966', softColor: '#fff0f2', category: 'vitals',
    fields: [{ key: 'bpm', label: '心率', unit: 'bpm', min: 25, max: 240, step: 1, placeholder: '例如 72' }],
    reference: '活動、情緒與用藥可能影響數值。',
  },
  {
    type: 'bloodGlucose', label: '血糖', english: 'Blood Glucose', icon: '🩸', color: '#ee5968', softColor: '#fff0f3', category: 'metabolic',
    fields: [{ key: 'glucose', label: '空腹血糖', unit: 'mg/dL', min: 20, max: 700, step: 1, placeholder: '例如 96', required: true, reference: '空腹一般參考 70–99 mg/dL' }],
    reference: '空腹需依檢查要求禁食；診斷需由醫師依正式檢驗與臨床狀況判定。',
  },
  {
    type: 'weight', label: '體重', english: 'Weight', icon: '⚖️', color: '#5570d8', softColor: '#eef1ff', category: 'vitals',
    fields: [{ key: 'kg', label: '體重', unit: 'kg', min: 2, max: 400, step: 0.1, placeholder: '例如 62.5' }],
    reference: '固定時間與相近條件量測，更適合觀察變化。',
  },
  {
    type: 'temperature', label: '體溫', english: 'Body Temperature', icon: '🌡️', color: '#ec7d42', softColor: '#fff3ea', category: 'vitals',
    fields: [{ key: 'celsius', label: '體溫', unit: '°C', min: 30, max: 45, step: 0.1, placeholder: '例如 36.6' }],
    reference: '量測部位與工具不同，結果可能有差異。',
  },
  {
    type: 'oxygen', label: '血氧', english: 'Blood Oxygen', icon: '🫁', color: '#2898d5', softColor: '#eaf6fd', category: 'vitals',
    fields: [{ key: 'spo2', label: '血氧飽和度', unit: '%', min: 50, max: 100, step: 1, placeholder: '例如 98' }],
    reference: '手指溫度、動作與裝置配戴可能影響量測。',
  },
  {
    type: 'steps', label: '步數', english: 'Steps', icon: '👟', color: '#13a184', softColor: '#e6f8f2', category: 'vitals',
    fields: [{ key: 'count', label: '今日步數', unit: '步', min: 0, max: 100000, step: 1, placeholder: '例如 7200' }],
    reference: '可手動記錄手機或穿戴裝置顯示的步數。',
  },
  {
    type: 'sleep', label: '睡眠', english: 'Sleep', icon: '🌙', color: '#5269d4', softColor: '#eef1ff', category: 'vitals',
    fields: [{ key: 'hours', label: '睡眠時數', unit: '小時', min: 0, max: 24, step: 0.1, placeholder: '例如 7.5' }],
    reference: '記錄總睡眠時間；睡眠品質評分為待確認功能。',
  },
  {
    type: 'hba1c', label: '糖化血色素', english: 'HbA1c', icon: '🧪', color: '#d95979', softColor: '#fceef3', category: 'metabolic',
    fields: [{ key: 'percent', label: 'HbA1c', unit: '%', min: 2, max: 20, step: 0.1, placeholder: '例如 5.4', required: true, reference: '一般參考：< 5.7%；5.7–6.4% 為風險區間' }],
    reference: 'HbA1c 反映一段期間的平均血糖；檢驗方法與個人狀況可能影響判讀。',
  },
  {
    type: 'bloodLipids', label: '血脂', english: 'Blood Lipids', icon: '💧', color: '#5271dc', softColor: '#eef2ff', category: 'metabolic',
    fields: [
      { key: 'totalCholesterol', label: '總膽固醇', unit: 'mg/dL', min: 30, max: 800, step: 1, placeholder: '例如 182', reference: '一般理想值 < 200 mg/dL' },
      { key: 'triglycerides', label: '三酸甘油酯', unit: 'mg/dL', min: 10, max: 2000, step: 1, placeholder: '例如 96', reference: '一般參考 < 150 mg/dL' },
      { key: 'ldl', label: 'LDL-C', unit: 'mg/dL', min: 10, max: 600, step: 1, placeholder: '例如 110', reference: '一般參考 < 130 mg/dL；個人目標依風險而異' },
      { key: 'hdl', label: 'HDL-C', unit: 'mg/dL', min: 5, max: 200, step: 1, placeholder: '例如 55', reference: '男性 ≥ 40、女性 ≥ 50 mg/dL' },
    ],
    reference: '血脂目標會依心血管風險與治療狀況調整，請以醫師設定的個人目標為準。',
  },
  {
    type: 'liverFunction', label: '肝功能', english: 'Liver Function', icon: '🟢', color: '#26a85d', softColor: '#eaf8ef', category: 'laboratory',
    fields: [
      { key: 'ast', label: 'AST / GOT', unit: 'U/L', min: 0, max: 2000, step: 1, placeholder: '例如 26', reference: '常見上限約 31–34 U/L，依實驗室而異' },
      { key: 'alt', label: 'ALT / GPT', unit: 'U/L', min: 0, max: 2000, step: 1, placeholder: '例如 28', reference: '常見上限約 36–42 U/L，依實驗室而異' },
      { key: 'bilirubin', label: '總膽紅素', unit: 'mg/dL', min: 0, max: 50, step: 0.1, placeholder: '例如 0.8', reference: '常見參考 0.3–1.2 mg/dL' },
      { key: 'albumin', label: '白蛋白', unit: 'g/dL', min: 0, max: 10, step: 0.1, placeholder: '例如 4.3', reference: '常見參考 3.5–5.4 g/dL' },
    ],
    reference: '肝功能參考區間會因檢驗方法與實驗室不同，請以原始檢驗報告為準。',
  },
  {
    type: 'renalFunction', label: '腎功能', english: 'Renal Function', icon: '🫘', color: '#b45b83', softColor: '#faeef4', category: 'laboratory',
    fields: [
      { key: 'bun', label: '血中尿素氮 BUN', unit: 'mg/dL', min: 0, max: 300, step: 0.1, placeholder: '例如 14', reference: '常見參考 7–20 mg/dL' },
      { key: 'creatinine', label: '肌酸酐 Creatinine', unit: 'mg/dL', min: 0, max: 30, step: 0.01, placeholder: '例如 0.8', reference: '男性約 0.7–1.2、女性約 0.5–0.9 mg/dL' },
      { key: 'egfr', label: 'eGFR', unit: 'mL/min/1.73m²', min: 0, max: 200, step: 1, placeholder: '例如 95', reference: '一般參考 ≥ 60；須結合持續時間與臨床判讀' },
      { key: 'uricAcid', label: '尿酸', unit: 'mg/dL', min: 0, max: 30, step: 0.1, placeholder: '例如 5.2', reference: '男性約 4.0–7.0、女性約 2.5–6.0 mg/dL' },
    ],
    reference: '腎功能需綜合年齡、肌酸酐、eGFR、尿液與既往變化判讀。',
  },
  {
    type: 'cbc', label: '全血球計數', english: 'Complete Blood Count', icon: '🔬', color: '#397fc2', softColor: '#edf5fc', category: 'laboratory',
    fields: [
      { key: 'hemoglobin', label: '血紅素 Hb', unit: 'g/dL', min: 0, max: 30, step: 0.1, placeholder: '例如 14.2', reference: '男性約 13.5–17.5、女性約 12.0–15.5 g/dL' },
      { key: 'hematocrit', label: '紅血球容積比 Hct', unit: '%', min: 0, max: 80, step: 0.1, placeholder: '例如 42', reference: '男性約 40–50%、女性約 36–45%' },
      { key: 'wbc', label: '白血球 WBC', unit: '/μL', min: 0, max: 100000, step: 1, placeholder: '例如 6500', reference: '常見參考 4,000–11,000 /μL' },
      { key: 'platelets', label: '血小板 Platelets', unit: '/μL', min: 0, max: 2000000, step: 1000, placeholder: '例如 250000', reference: '常見參考 150,000–400,000 /μL' },
    ],
    reference: '血球數值需搭配年齡、性別、症狀與實驗室參考區間判讀。',
  },
  {
    type: 'urinalysis', label: '尿液常規', english: 'Urinalysis', icon: '🧫', color: '#d19a21', softColor: '#fff7df', category: 'urine',
    fields: [
      { key: 'protein', label: '尿蛋白 Protein', unit: '', inputType: 'select', placeholder: '', reference: '一般為陰性或微量', options: [{ value: 'negative', label: '陰性' }, { value: 'trace', label: '微量' }, { value: 'positive1', label: '1+' }, { value: 'positive2', label: '2+' }, { value: 'positive3', label: '3+' }] },
      { key: 'glucose', label: '尿糖 Glucose', unit: '', inputType: 'select', placeholder: '', reference: '一般為陰性', options: [{ value: 'negative', label: '陰性' }, { value: 'positive1', label: '1+' }, { value: 'positive2', label: '2+' }, { value: 'positive3', label: '3+' }] },
      { key: 'occultBlood', label: '潛血 Occult Blood', unit: '', inputType: 'select', placeholder: '', reference: '一般為陰性', options: [{ value: 'negative', label: '陰性' }, { value: 'trace', label: '微量' }, { value: 'positive1', label: '1+' }, { value: 'positive2', label: '2+' }, { value: 'positive3', label: '3+' }] },
      { key: 'leukocytes', label: '白血球酯酶', unit: '', inputType: 'select', placeholder: '', reference: '一般為陰性', options: [{ value: 'negative', label: '陰性' }, { value: 'positive', label: '陽性' }] },
      { key: 'nitrites', label: '亞硝酸鹽 Nitrites', unit: '', inputType: 'select', placeholder: '', reference: '一般為陰性', options: [{ value: 'negative', label: '陰性' }, { value: 'positive', label: '陽性' }] },
    ],
    reference: '尿液結果可能受採檢方式、月經、運動、藥物或感染影響；陽性結果應由醫師評估。',
  },
];

export const METRIC_MAP = Object.fromEntries(METRICS.map((metric) => [metric.type, metric])) as Record<MetricType, MetricDefinition>;

export const PERIOD_LABELS: Record<Period, string> = {
  morning: '上午',
  afternoon: '下午',
  evening: '晚上',
};

export function formatMetricValue(type: MetricType, values: Record<string, number | string>, compact = false): string {
  const metric = METRIC_MAP[type];
  if (type === 'bloodPressure') {
    const systolic = typeof values.systolic === 'number' ? Math.round(values.systolic) : '–';
    const diastolic = typeof values.diastolic === 'number' ? Math.round(values.diastolic) : '–';
    return `${systolic}/${diastolic}${compact ? '' : ' mmHg'}`;
  }
  if (metric.fields.length > 1) {
    const resultCount = metric.fields.filter((field) => values[field.key] !== undefined && values[field.key] !== '').length;
    return resultCount ? `${resultCount} 項結果` : '尚無記錄';
  }
  const field = metric.fields[0];
  const raw = values[field.key];
  if (raw === undefined) return '尚無記錄';
  if (typeof raw === 'string') return field.options?.find((option) => option.value === raw)?.label ?? raw;
  const digits = (field.step ?? 1) < 1 ? ((field.step ?? 1) < 0.1 ? 2 : 1) : 0;
  return `${raw.toLocaleString('zh-TW', { minimumFractionDigits: digits, maximumFractionDigits: digits })}${compact ? '' : ` ${field.unit}`}`;
}
