import type { Locale } from '../i18n';
import { t } from '../i18n';

interface UpdateBannerProps {
  locale: Locale;
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdateBanner({ locale, onUpdate, onDismiss }: UpdateBannerProps) {
  return (
    <aside className="update-banner" role="status" aria-live="polite">
      <span className="update-banner-icon" aria-hidden="true">↻</span>
      <div>
        <strong>{t('update.available', locale)}</strong>
        <p>{t('update.description', locale)}</p>
      </div>
      <div className="update-banner-actions">
        <button className="secondary-button" onClick={onDismiss}>{t('update.dismiss', locale)}</button>
        <button className="primary-button" onClick={onUpdate}>{t('update.action', locale)}</button>
      </div>
    </aside>
  );
}


