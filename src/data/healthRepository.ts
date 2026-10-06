import type { AppSettings, HealthRecord, MetricType, UserProfile } from '../types';

const DB_NAME = 'health-record-pwa';
const DB_VERSION = 1;
const RECORDS_STORE = 'records';
const SETTINGS_STORE = 'settings';

export interface HealthRepository {
  listRecords(type?: MetricType): Promise<HealthRecord[]>;
  getRecord(id: string): Promise<HealthRecord | undefined>;
  saveRecord(record: HealthRecord): Promise<void>;
  deleteRecord(id: string): Promise<void>;
  getProfile(): Promise<UserProfile>;
  saveProfile(profile: UserProfile): Promise<void>;
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
  ensureDemoData(): Promise<void>;
}

function requestAsPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

class IndexedDbHealthRepository implements HealthRepository {
  private dbPromise: Promise<IDBDatabase>;
  private seedPromise?: Promise<void>;

  constructor() {
    this.dbPromise = this.openDatabase();
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(RECORDS_STORE)) {
          const records = db.createObjectStore(RECORDS_STORE, { keyPath: 'id' });
          records.createIndex('measuredAt', 'measuredAt');
          records.createIndex('type', 'type');
        }
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async listRecords(type?: MetricType): Promise<HealthRecord[]> {
    const db = await this.dbPromise;
    const transaction = db.transaction(RECORDS_STORE, 'readonly');
    const store = transaction.objectStore(RECORDS_STORE);
    const records = type
      ? await requestAsPromise(store.index('type').getAll(type))
      : await requestAsPromise(store.getAll());
    return (records as HealthRecord[]).sort((a, b) => b.measuredAt.localeCompare(a.measuredAt));
  }

  async getRecord(id: string): Promise<HealthRecord | undefined> {
    const db = await this.dbPromise;
    const transaction = db.transaction(RECORDS_STORE, 'readonly');
    return requestAsPromise(transaction.objectStore(RECORDS_STORE).get(id));
  }

  async saveRecord(record: HealthRecord): Promise<void> {
    const db = await this.dbPromise;
    const transaction = db.transaction(RECORDS_STORE, 'readwrite');
    transaction.objectStore(RECORDS_STORE).put(record);
    await transactionDone(transaction);
  }

  async deleteRecord(id: string): Promise<void> {
    const db = await this.dbPromise;
    const transaction = db.transaction(RECORDS_STORE, 'readwrite');
    transaction.objectStore(RECORDS_STORE).delete(id);
    await transactionDone(transaction);
  }

  async getProfile(): Promise<UserProfile> {
    const db = await this.dbPromise;
    const transaction = db.transaction(SETTINGS_STORE, 'readonly');
    return (await requestAsPromise(transaction.objectStore(SETTINGS_STORE).get('profile'))) ?? { displayName: '本人', sex: '' };
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    const db = await this.dbPromise;
    const transaction = db.transaction(SETTINGS_STORE, 'readwrite');
    transaction.objectStore(SETTINGS_STORE).put(profile, 'profile');
    await transactionDone(transaction);
  }

  async getSettings(): Promise<AppSettings> {
    const db = await this.dbPromise;
    const transaction = db.transaction(SETTINGS_STORE, 'readonly');
    return (await requestAsPromise(transaction.objectStore(SETTINGS_STORE).get('appSettings'))) ?? {
      theme: 'light', fontScale: 'normal', seeded: false,
    };
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    const db = await this.dbPromise;
    const transaction = db.transaction(SETTINGS_STORE, 'readwrite');
    transaction.objectStore(SETTINGS_STORE).put(settings, 'appSettings');
    await transactionDone(transaction);
  }

  ensureDemoData(): Promise<void> {
    if (!this.seedPromise) this.seedPromise = this.ensureDemoDataInternal();
    return this.seedPromise;
  }

  private async ensureDemoDataInternal(): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.seeded) {
      const now = new Date();
      const samples: Array<[number, MetricType, Record<string, number | string>, 'morning' | 'afternoon' | 'evening']> = [
        [0, 'bloodPressure', { systolic: 118, diastolic: 76, pulse: 71 }, 'morning'],
        [1, 'steps', { count: 6840 }, 'evening'],
        [1, 'sleep', { hours: 7.3 }, 'morning'],
        [2, 'weight', { kg: 62.4 }, 'morning'],
        [3, 'oxygen', { spo2: 98 }, 'afternoon'],
        [4, 'bloodGlucose', { glucose: 96 }, 'morning'],
        [5, 'temperature', { celsius: 36.6 }, 'evening'],
        [6, 'heartRate', { bpm: 72 }, 'afternoon'],
        [8, 'bloodPressure', { systolic: 121, diastolic: 79, pulse: 73 }, 'morning'],
        [14, 'bloodPressure', { systolic: 116, diastolic: 75, pulse: 69 }, 'evening'],
        [20, 'weight', { kg: 62.8 }, 'morning'],
        [7, 'hba1c', { percent: 5.4 }, 'morning'],
        [10, 'bloodLipids', { totalCholesterol: 182, triglycerides: 96, ldl: 110, hdl: 55 }, 'morning'],
        [12, 'liverFunction', { ast: 26, alt: 28, bilirubin: 0.8, albumin: 4.3 }, 'morning'],
        [15, 'renalFunction', { bun: 14, creatinine: 0.8, egfr: 95, uricAcid: 5.2 }, 'morning'],
        [18, 'cbc', { hemoglobin: 14.2, hematocrit: 42, wbc: 6500, platelets: 250000 }, 'morning'],
        [21, 'urinalysis', { protein: 'negative', glucose: 'negative', occultBlood: 'negative', leukocytes: 'negative', nitrites: 'negative' }, 'morning'],
      ];
      for (const [daysAgo, type, values, period] of samples) {
        const measured = new Date(now);
        measured.setDate(measured.getDate() - daysAgo);
        measured.setHours(period === 'morning' ? 8 : period === 'afternoon' ? 14 : 21, 0, 0, 0);
        const iso = measured.toISOString();
        await this.saveRecord({
          id: crypto.randomUUID(), type, values, period, measuredAt: iso, note: '示範資料', createdAt: iso, updatedAt: iso,
        });
      }
      await this.saveSettings({ ...settings, seeded: true });
    }
    await this.dedupeDemoData();
  }

  private async dedupeDemoData(): Promise<void> {
    const records = await this.listRecords();
    const seen = new Set<string>();
    for (const record of records) {
      if (record.note !== '示範資料') continue;
      const key = `${record.type}|${record.measuredAt}|${JSON.stringify(record.values)}`;
      if (seen.has(key)) await this.deleteRecord(record.id);
      else seen.add(key);
    }
  }
}

export const healthRepository: HealthRepository = new IndexedDbHealthRepository();
