import { METRICS, METRIC_MAP } from '../config/metrics';
import type { HealthRecord, MetricField, MetricType, Period } from '../types';

const BASE_HEADERS = ['type', 'metricLabel', 'measuredAt', 'period', 'note'];
const FIELD_HEADERS = [...new Set(METRICS.flatMap((metric) => metric.fields.map((field) => field.key)))];

const DATE_ALIASES = ['measuredat', 'datetime', 'date', '測量時間', '測量日期', '檢查日期', '日期', '時間'];
const PERIOD_ALIASES = ['period', '時段'];
const NOTE_ALIASES = ['note', '備註', '說明'];
const TYPE_ALIASES = ['type', 'metrictype', '類型', '項目', '檢查項目'];

const FIELD_ALIASES: Partial<Record<MetricType, Record<string, string[]>>> = {
  bloodPressure: { systolic: ['sbp', '收縮壓', '高壓'], diastolic: ['dbp', '舒張壓', '低壓'], pulse: ['pulse', '脈搏'] },
  heartRate: { bpm: ['heartrate', '心率', '脈搏'] },
  bloodGlucose: { glucose: ['fastingglucose', 'bloodglucose', '血糖', '空腹血糖'] },
  weight: { kg: ['weight', '體重'] },
  temperature: { celsius: ['temperature', 'bodytemperature', '體溫'] },
  oxygen: { spo2: ['oxygen', 'bloodoxygen', '血氧', '血氧飽和度'] },
  steps: { count: ['steps', 'stepcount', '步數'] },
  sleep: { hours: ['sleep', 'sleephours', '睡眠', '睡眠時數'] },
  hba1c: { percent: ['hba1c', '糖化血色素'] },
  bloodLipids: {
    totalCholesterol: ['tc', 'totalcholesterol', '總膽固醇'],
    triglycerides: ['tg', 'triglyceride', 'triglycerides', '三酸甘油酯'],
    ldl: ['ldl', 'ldlc', '低密度脂蛋白膽固醇'],
    hdl: ['hdl', 'hdlc', '高密度脂蛋白膽固醇'],
  },
  liverFunction: { ast: ['ast', 'got'], alt: ['alt', 'gpt'], bilirubin: ['totalbilirubin', '總膽紅素'], albumin: ['albumin', '白蛋白'] },
  renalFunction: { bun: ['bun', '血中尿素氮'], creatinine: ['creatinine', '肌酸酐'], egfr: ['egfr', '估計絲球體過濾率'], uricAcid: ['uricacid', '尿酸'] },
  cbc: { hemoglobin: ['hb', 'hemoglobin', '血紅素'], hematocrit: ['hct', 'hematocrit', '紅血球容積比'], wbc: ['wbc', '白血球'], platelets: ['platelet', 'platelets', '血小板'] },
  urinalysis: { protein: ['protein', '尿蛋白'], glucose: ['urineglucose', '尿糖'], occultBlood: ['occultblood', '潛血'], leukocytes: ['leukocytes', '白血球酯酶'], nitrites: ['nitrites', '亞硝酸鹽'] },
};

export interface CsvImportResult {
  records: HealthRecord[];
  errors: string[];
  duplicateCount: number;
  totalRows: number;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s_\-–—/\\()[\]（）％%°·.:：]+/g, '');
}

function escapeCsv(value: string | number | undefined) {
  const text = value === undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const source = text.replace(/^\uFEFF/, '');

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') { cell += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"' && !cell) quoted = true;
    else if (char === ',') { row.push(cell); cell = ''; }
    else if (char === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (char !== '\r') cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((candidate) => candidate.some((value) => value.trim()));
}

export function recordsToCsv(records: HealthRecord[]) {
  const headers = [...BASE_HEADERS, ...FIELD_HEADERS];
  const rows = [...records]
    .sort((a, b) => a.measuredAt.localeCompare(b.measuredAt))
    .map((record) => {
      const base: Record<string, string | number | undefined> = {
        type: record.type,
        metricLabel: METRIC_MAP[record.type].label,
        measuredAt: record.measuredAt,
        period: record.period,
        note: record.note,
        ...record.values,
      };
      return headers.map((header) => escapeCsv(base[header])).join(',');
    });
  return `\uFEFF${headers.join(',')}\r\n${rows.join('\r\n')}\r\n`;
}

export function metricTemplateCsv(type: MetricType) {
  const metric = METRIC_MAP[type];
  const headers = ['日期', '時段', '備註', ...metric.fields.map((field) => field.label)];
  return `\uFEFF${headers.map(escapeCsv).join(',')}\r\n`;
}

function findColumn(headers: string[], aliases: string[]) {
  const normalizedAliases = aliases.map(normalizeHeader);
  return headers.findIndex((header) => normalizedAliases.includes(normalizeHeader(header)));
}

function resolveType(raw: string, fallbackType: MetricType): MetricType | undefined {
  if (!raw.trim()) return fallbackType;
  const normalized = normalizeHeader(raw);
  return METRICS.find((metric) => [metric.type, metric.label, metric.english].map(normalizeHeader).includes(normalized))?.type;
}

function resolvePeriod(raw: string, hour: number): Period {
  const normalized = normalizeHeader(raw);
  if (['morning', '上午', '早上', '早餐前'].includes(normalized)) return 'morning';
  if (['afternoon', '下午', '中午'].includes(normalized)) return 'afternoon';
  if (['evening', '晚上', '晚間'].includes(normalized)) return 'evening';
  return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
}

function parseDate(raw: string, period: Period) {
  const compact = raw.trim().replace(/\./g, '/').replace(/-/g, '/');
  const match = compact.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (match) {
    const [, year, month, day, hour, minute, second] = match;
    const fallbackHour = period === 'morning' ? 8 : period === 'afternoon' ? 14 : 20;
    const date = new Date(Number(year), Number(month) - 1, Number(day), hour === undefined ? fallbackHour : Number(hour), Number(minute ?? 0), Number(second ?? 0));
    if (date.getFullYear() === Number(year) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day)) return date;
    return undefined;
  }
  const parsed = new Date(raw.trim());
  return Number.isFinite(parsed.getTime()) ? parsed : undefined;
}

function parseSelectValue(field: MetricField, raw: string) {
  const normalized = normalizeHeader(raw);
  return field.options?.find((option) => [option.value, option.label].map(normalizeHeader).includes(normalized))?.value;
}

function fingerprint(record: Pick<HealthRecord, 'type' | 'measuredAt' | 'values'>) {
  return `${record.type}|${record.measuredAt}|${Object.entries(record.values).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}:${value}`).join('|')}`;
}

export function importRecordsFromCsv(text: string, fallbackType: MetricType, existingRecords: HealthRecord[]): CsvImportResult {
  const rows = parseCsv(text);
  if (rows.length < 2) return { records: [], errors: ['CSV 沒有可匯入的資料列。'], duplicateCount: 0, totalRows: 0 };

  const headers = rows[0];
  const dateIndex = findColumn(headers, DATE_ALIASES);
  const periodIndex = findColumn(headers, PERIOD_ALIASES);
  const noteIndex = findColumn(headers, NOTE_ALIASES);
  const typeIndex = findColumn(headers, TYPE_ALIASES);
  if (dateIndex < 0) return { records: [], errors: ['找不到日期欄位，請使用「日期」或 measuredAt。'], duplicateCount: 0, totalRows: rows.length - 1 };

  const errors: string[] = [];
  const records: HealthRecord[] = [];
  const fingerprints = new Set(existingRecords.map(fingerprint));
  let duplicateCount = 0;

  rows.slice(1).forEach((row, rowOffset) => {
    const rowNumber = rowOffset + 2;
    const type = resolveType(typeIndex >= 0 ? row[typeIndex] ?? '' : '', fallbackType);
    if (!type) { errors.push(`第 ${rowNumber} 列：無法辨識健康資料類型。`); return; }
    const metric = METRIC_MAP[type];
    const rawPeriod = periodIndex >= 0 ? row[periodIndex] ?? '' : '';
    const preliminaryPeriod = resolvePeriod(rawPeriod, 8);
    const date = parseDate(row[dateIndex] ?? '', preliminaryPeriod);
    if (!date) { errors.push(`第 ${rowNumber} 列：日期格式無法辨識。`); return; }
    const period = resolvePeriod(rawPeriod, date.getHours());
    const values: Record<string, number | string> = {};

    for (const field of metric.fields) {
      const aliases = [field.key, field.label, ...(FIELD_ALIASES[type]?.[field.key] ?? [])];
      const columnIndex = findColumn(headers, aliases);
      const raw = columnIndex >= 0 ? (row[columnIndex] ?? '').trim() : '';
      if (!raw) {
        if (field.required) errors.push(`第 ${rowNumber} 列：缺少「${field.label}」。`);
        continue;
      }
      if (field.inputType === 'select') {
        const selected = parseSelectValue(field, raw);
        if (!selected) errors.push(`第 ${rowNumber} 列：「${field.label}」的結果無法辨識。`);
        else values[field.key] = selected;
      } else {
        const numeric = Number(raw.replace(/,/g, ''));
        if (!Number.isFinite(numeric) || numeric < (field.min ?? -Infinity) || numeric > (field.max ?? Infinity)) errors.push(`第 ${rowNumber} 列：「${field.label}」超出輸入範圍。`);
        else values[field.key] = numeric;
      }
    }

    if (!Object.keys(values).length || errors.some((error) => error.startsWith(`第 ${rowNumber} 列：`))) return;
    const now = new Date().toISOString();
    const record: HealthRecord = {
      id: crypto.randomUUID(), type, measuredAt: date.toISOString(), period, values,
      note: noteIndex >= 0 ? (row[noteIndex] ?? '').trim().slice(0, 120) : '', createdAt: now, updatedAt: now,
    };
    const key = fingerprint(record);
    if (fingerprints.has(key)) { duplicateCount += 1; return; }
    fingerprints.add(key);
    records.push(record);
  });

  return { records, errors, duplicateCount, totalRows: rows.length - 1 };
}

