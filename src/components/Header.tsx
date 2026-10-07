import type { AppSettings, UserProfile } from '../types';
import type { Locale } from '../i18n';
import { t } from '../i18n';

interface HeaderProps {
  profile: UserProfile;
  settings: AppSettings;
  locale: Locale;
  installAvailable: boolean;
  onProfile: () => void;
  onDataManager: () => void;
  onInstall: () => void;
  onToggleTheme: () => void;
  onChangeFont: (direction: -1 | 1) => void;
}

export function Header({ profile, settings, locale, installAvailable, onProfile, onDataManager, onInstall, onToggleTheme, onChangeFont }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="brand-row">
        <img className="brand-mark-image" src={`${import.meta.env.BASE_URL}brand/self-care-mark.png`} alt="" aria-hidden="true" />
        <div className="brand-copy">
          <strong>{t('app.name', locale)}</strong>
          <span>{t('app.subtitle', locale)}</span>
        </div>
        <div className="online-badge" title={t('header.localStorageTitle', locale)}><span className="status-dot" /> {t('header.localStorage', locale)}</div>
      </div>
      <div className="utility-row" aria-label={t('header.tools', locale)}>
        <button className="profile-chip" onClick={onProfile} aria-label={t('header.profile', locale)}>
          <span aria-hidden="true">👤</span><span>{profile.displayName || '本人'}</span>
        </button>
        <button className="square-button" onClick={onDataManager} aria-label={t('header.dataManager', locale)} title="CSV 與 Google Drive">☁️</button>
        <button className={`square-button install-button ${installAvailable ? 'has-update' : ''}`} onClick={onInstall} aria-label={t('header.install', locale)} title="PWA">＋</button>
        <button className="square-button" onClick={onToggleTheme} aria-label={t(settings.theme === 'dark' ? 'header.lightMode' : 'header.darkMode', locale)} title={t('header.darkMode', locale)}>
          {settings.theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="font-controls" aria-label={t('header.fontSize', locale)}>
          <button onClick={() => onChangeFont(-1)} aria-label={t('header.fontSmaller', locale)}>A−</button>
          <button onClick={() => onChangeFont(1)} aria-label={t('header.fontLarger', locale)}>A＋</button>
        </div>
      </div>
    </header>
  );
}


