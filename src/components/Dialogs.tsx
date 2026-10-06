import { useState } from 'react';
import type { HealthRecord, UserProfile } from '../types';
import { METRIC_MAP, formatMetricValue } from '../config/metrics';

export function ProfileDialog({ profile, onClose, onSave }: { profile: UserProfile; onClose: () => void; onSave: (profile: UserProfile) => Promise<void> }) {
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    await onSave({ ...draft, displayName: draft.displayName.trim() || '本人' });
  }
  return (
    <div className="modal-backdrop centered" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div className="dialog-header"><div><span className="pill-label">本人</span><h2 id="profile-title">個人基本資料</h2></div><button className="icon-button" onClick={onClose} aria-label="關閉">×</button></div>
        <form className="dialog-form" onSubmit={submit}>
          <label className="field"><span>顯示名稱</span><input value={draft.displayName} maxLength={20} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} required /></label>
          <div className="two-column-fields">
            <label className="field"><span>出生年份 <small>選填</small></span><input type="number" min="1900" max={new Date().getFullYear()} value={draft.birthYear ?? ''} onChange={(event) => setDraft({ ...draft, birthYear: event.target.value ? Number(event.target.value) : undefined })} placeholder="例如 1988" /></label>
            <label className="field"><span>身高 <small>cm，選填</small></span><input type="number" min="50" max="250" step="0.1" value={draft.heightCm ?? ''} onChange={(event) => setDraft({ ...draft, heightCm: event.target.value ? Number(event.target.value) : undefined })} placeholder="例如 165" /></label>
          </div>
          <label className="field"><span>性別 <small>選填</small></span><select value={draft.sex ?? ''} onChange={(event) => setDraft({ ...draft, sex: event.target.value as UserProfile['sex'] })}><option value="">不提供</option><option value="female">女性</option><option value="male">男性</option><option value="other">其他</option></select></label>
          <p className="privacy-note">🔒 個人資料與健康紀錄只保存在此瀏覽器的本機資料庫。</p>
          <div className="form-actions"><button type="button" className="secondary-button" onClick={onClose}>取消</button><button type="submit" className="primary-button" disabled={saving}>{saving ? '儲存中…' : '儲存資料'}</button></div>
        </form>
      </section>
    </div>
  );
}

export function InstallDialog({ canPrompt, installed, onClose, onInstall }: { canPrompt: boolean; installed: boolean; onClose: () => void; onInstall: () => Promise<void> }) {
  return (
    <div className="modal-backdrop centered" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog install-dialog" role="dialog" aria-modal="true" aria-labelledby="install-title">
        <button className="icon-button dialog-close" onClick={onClose} aria-label="關閉">×</button>
        <div className="install-visual"><div className="mini-phone"><span>＋</span></div><span className="download-arrow">↓</span></div>
        <h2 id="install-title">{installed ? '已加入主畫面' : '安裝健康紀錄 App'}</h2>
        <p>安裝後可從主畫面快速開啟，並支援基本離線使用。</p>
        {installed ? <div className="success-box">✓ 此應用程式目前以安裝模式執行。</div> : canPrompt ? <button className="primary-button wide" onClick={onInstall}>立即安裝</button> : (
          <div className="install-steps">
            <div><strong>iPhone／iPad Safari</strong><span>點選「分享」→「加入主畫面」→「新增」</span></div>
            <div><strong>Android Chrome</strong><span>點選瀏覽器選單 →「安裝應用程式」</span></div>
          </div>
        )}
      </section>
    </div>
  );
}

export function DeleteDialog({ record, onClose, onConfirm }: { record: HealthRecord; onClose: () => void; onConfirm: () => Promise<void> }) {
  const [deleting, setDeleting] = useState(false);
  const metric = METRIC_MAP[record.type];
  return (
    <div className="modal-backdrop centered" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
        <span className="warning-icon">!</span><h2 id="delete-title">刪除{metric.label}紀錄？</h2>
        <p>即將刪除 <strong>{formatMetricValue(record.type, record.values)}</strong>。刪除後無法復原。</p>
        <div className="form-actions"><button className="secondary-button" onClick={onClose}>保留紀錄</button><button className="danger-button" disabled={deleting} onClick={async () => { setDeleting(true); await onConfirm(); }}>{deleting ? '刪除中…' : '確認刪除'}</button></div>
      </section>
    </div>
  );
}
