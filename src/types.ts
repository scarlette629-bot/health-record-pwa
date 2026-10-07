import type { Locale } from './i18n';

export type MetricType =
  | 'bloodPressure'
  | 'heartRate'
  | 'bloodGlucose'
  | 'weight'
  | 'temperature'
  | 'oxygen'
  | 'steps'
  | 'sleep'
  | 'hba1c'
  | 'bloodLipids'
  | 'liverFunction'
  | 'renalFunction'
  | 'cbc'
  | 'urinalysis';

export type Period = 'morning' | 'afternoon' | 'evening';

export interface HealthRecord {
  id: string;
  type: MetricType;
  measuredAt: string;
  period: Period;
  values: Record<string, number | string>;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  displayName: string;
  birthYear?: number;
  sex?: 'female' | 'male' | 'other' | '';
  heightCm?: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  fontScale: 'small' | 'normal' | 'large';
  seeded: boolean;
  locale?: Locale;
}

export interface MetricField {
  key: string;
  label: string;
  unit: string;
  inputType?: 'number' | 'select';
  min?: number;
  max?: number;
  step?: number;
  placeholder: string;
  required?: boolean;
  reference?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface MetricDefinition {
  type: MetricType;
  label: string;
  english: string;
  icon: string;
  color: string;
  softColor: string;
  category: 'vitals' | 'metabolic' | 'laboratory' | 'urine';
  fields: MetricField[];
  reference: string;
}

