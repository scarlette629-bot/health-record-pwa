import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { DataManagerDialog } from './components/DataManagerDialog';
import { DeleteDialog, InstallDialog, ProfileDialog } from './components/Dialogs';
import { Header } from './components/Header';
import { PrimaryNav, type AppView } from './components/PrimaryNav';
import { RecordForm } from './components/RecordForm';
import { RecordWorkspace } from './components/RecordWorkspace';
import { TrackingPage } from './components/TrackingPage';
import { UpdateBanner } from './components/UpdateBanner';
import { APP_DISPLAY_VERSION } from './config/version';
import { healthRepository } from './data/healthRepository';
import { DEFAULT_LOCALE, t } from './i18n';
import { activateServiceWorkerUpdate, PWA_UPDATE_AVAILABLE_EVENT, type PwaUpdateAvailableDetail } from './pwa/registerServiceWorker';
import type { AppSettings, HealthRecord, MetricType, UserProfile } from './types';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DEFAULT_SETTINGS: AppSettings = { theme: 'light', fontScale: 'normal', seeded: false, locale: DEFAULT_LOCALE };
const DEFAULT_PROFILE: UserProfile = { displayName: '本人', sex: '' };

function initialView(): AppView {
  const value = new URLSearchParams(window.location.search).get('view');
  return value === 'record' || value === 'tracking' ? value : 'dashboard';
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

export default function App() {
  const [view, setView] = useState<AppView>(initialView);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [formType, setFormType] = useState<MetricType>();
  const [editingRecord, setEditingRecord] = useState<HealthRecord>();
  const [deleteRecord, setDeleteRecord] = useState<HealthRecord>();
  const [showProfile, setShowProfile] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [showDataManager, setShowDataManager] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent>();
  const [toast, setToast] = useState('');
  const [recordInitialType, setRecordInitialType] = useState<MetricType>();
  const [recordInitialMode, setRecordInitialMode] = useState<'picker' | 'history'>('picker');
  const [updateRegistration, setUpdateRegistration] = useState<ServiceWorkerRegistration>();
  const locale = settings.locale ?? DEFAULT_LOCALE;

  const refreshRecords = useCallback(async () => setRecords(await healthRepository.listRecords()), []);

  useEffect(() => {
    async function boot() {
      const [loadedSettings, loadedProfile] = await Promise.all([healthRepository.getSettings(), healthRepository.getProfile()]);
      setSettings(loadedSettings);
      setProfile(loadedProfile);
      await healthRepository.ensureDemoData();
      await refreshRecords();
      setLoading(false);
    }
    boot().catch(() => setLoading(false));
  }, [refreshRecords]);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      setUpdateRegistration((event as CustomEvent<PwaUpdateAvailableDetail>).detail.registration);
    };
    window.addEventListener(PWA_UPDATE_AVAILABLE_EVENT, handleUpdate);
    return () => window.removeEventListener(PWA_UPDATE_AVAILABLE_EVENT, handleUpdate);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.dataset.font = settings.fontScale;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', settings.theme === 'dark' ? '#071820' : '#119da4');
  }, [settings]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const updateSettings = useCallback(async (next: AppSettings) => {
    setSettings(next);
    await healthRepository.saveSettings(next);
  }, []);

  function navigate(next: AppView) {
    setView(next);
    const url = new URL(window.location.href);
    if (next === 'dashboard') url.searchParams.delete('view'); else url.searchParams.set('view', next);
    window.history.replaceState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openAdd(type: MetricType) {
    setEditingRecord(undefined);
    setFormType(type);
  }

  function openHistory(type: MetricType) {
    setRecordInitialType(type);
    setRecordInitialMode('history');
    navigate('record');
  }

  async function saveRecord(record: HealthRecord) {
    await healthRepository.saveRecord(record);
    await refreshRecords();
    setFormType(undefined);
    setEditingRecord(undefined);
    setToast(t(editingRecord ? 'toast.recordUpdated' : 'toast.recordSaved', locale));
  }

  async function confirmDelete() {
    if (!deleteRecord) return;
    await healthRepository.deleteRecord(deleteRecord.id);
    await refreshRecords();
    setDeleteRecord(undefined);
    setToast(t('toast.recordDeleted', locale));
  }

  async function saveProfile(next: UserProfile) {
    await healthRepository.saveProfile(next);
    setProfile(next);
    setShowProfile(false);
    setToast(t('toast.profileSaved', locale));
  }

  async function importRecords(importedRecords: HealthRecord[]) {
    for (const record of importedRecords) await healthRepository.saveRecord(record);
    await refreshRecords();
    setShowDataManager(false);
    setToast(t('toast.importComplete', locale, { count: importedRecords.length }));
  }

  async function requestInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setInstallPrompt(undefined);
      setShowInstall(false);
      setToast(t('toast.installComplete', locale));
    }
  }

  const fontIndex = useMemo(() => ['small', 'normal', 'large'].indexOf(settings.fontScale), [settings.fontScale]);

  if (loading) return <div className="app-loading"><img src={`${import.meta.env.BASE_URL}brand/self-care-logo.png`} alt="Self-Care" /><strong>{t('app.loading')}</strong></div>;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">{t('a11y.skipToContent', locale)}</a>
      <Header
        profile={profile}
        settings={settings}
        locale={locale}
        installAvailable={Boolean(installPrompt)}
        onProfile={() => setShowProfile(true)}
        onDataManager={() => setShowDataManager(true)}
        onInstall={() => setShowInstall(true)}
        onToggleTheme={() => updateSettings({ ...settings, theme: settings.theme === 'light' ? 'dark' : 'light' })}
        onChangeFont={(direction) => {
          const options: AppSettings['fontScale'][] = ['small', 'normal', 'large'];
          const next = options[Math.max(0, Math.min(2, fontIndex + direction))];
          updateSettings({ ...settings, fontScale: next });
        }}
      />
      <PrimaryNav view={view} locale={locale} onChange={(next) => { setRecordInitialType(undefined); setRecordInitialMode('picker'); navigate(next); }} />
      {updateRegistration && <UpdateBanner locale={locale} onUpdate={() => activateServiceWorkerUpdate(updateRegistration)} onDismiss={() => setUpdateRegistration(undefined)} />}
      {view === 'dashboard' && <Dashboard records={records} profile={profile} onAdd={openAdd} onOpenHistory={openHistory} />}
      {view === 'record' && <RecordWorkspace key={`${recordInitialType ?? 'all'}-${recordInitialMode}`} records={records} initialType={recordInitialType} initialMode={recordInitialMode} onAdd={openAdd} onEdit={(record) => { setEditingRecord(record); setFormType(record.type); }} onDelete={setDeleteRecord} />}
      {view === 'tracking' && <TrackingPage records={records} />}
      <footer className="app-footer"><span>{t('footer.localOnly', locale)}</span><span>{t('footer.notDiagnosis', locale)}</span><span>Self-Care · {APP_DISPLAY_VERSION}</span></footer>

      {formType && <RecordForm type={formType} existing={editingRecord} onClose={() => { setFormType(undefined); setEditingRecord(undefined); }} onSave={saveRecord} />}
      {deleteRecord && <DeleteDialog record={deleteRecord} onClose={() => setDeleteRecord(undefined)} onConfirm={confirmDelete} />}
      {showProfile && <ProfileDialog profile={profile} onClose={() => setShowProfile(false)} onSave={saveProfile} />}
      {showInstall && <InstallDialog canPrompt={Boolean(installPrompt)} installed={isStandalone()} onClose={() => setShowInstall(false)} onInstall={requestInstall} />}
      {showDataManager && <DataManagerDialog records={records} onClose={() => setShowDataManager(false)} onImport={importRecords} />}
      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </div>
  );
}


