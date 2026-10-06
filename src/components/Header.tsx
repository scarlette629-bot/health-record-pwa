import type { AppSettings, UserProfile } from '../types';

interface HeaderProps {
  profile: UserProfile;
  settings: AppSettings;
  installAvailable: boolean;
  onProfile: () => void;
  onInstall: () => void;
  onToggleTheme: () => void;
  onChangeFont: (direction: -1 | 1) => void;
}

export function Header({ profile, settings, installAvailable, onProfile, onInstall, onToggleTheme, onChangeFont }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="brand-row">
        <div className="brand-mark" aria-hidden="true"><span>+</span></div>
        <div className="brand-copy">
          <strong>個人健康資料管理</strong>
          <span>Personal Health Data Manager</span>
        </div>
        <div className="online-badge" title="資料僅儲存在此裝置"><span className="status-dot" /> 本機儲存</div>
      </div>
      <div className="utility-row" aria-label="應用程式工具">
        <button className="profile-chip" onClick={onProfile} aria-label="編輯個人資料">
          <span aria-hidden="true">👤</span><span>{profile.displayName || '本人'}</span>
        </button>
        <button className={`square-button install-button ${installAvailable ? 'has-update' : ''}`} onClick={onInstall} aria-label="安裝應用程式" title="安裝 PWA">＋</button>
        <button className="square-button" onClick={onToggleTheme} aria-label={settings.theme === 'dark' ? '切換淺色模式' : '切換深色模式'} title="深色模式">
          {settings.theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="font-controls" aria-label="字級調整">
          <button onClick={() => onChangeFont(-1)} aria-label="縮小字級">A−</button>
          <button onClick={() => onChangeFont(1)} aria-label="放大字級">A＋</button>
        </div>
      </div>
    </header>
  );
}
