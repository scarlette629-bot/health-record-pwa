import type { Locale, TranslationKey } from '../i18n';
import { t } from '../i18n';

export type AppView = 'dashboard' | 'record' | 'tracking';

const ITEMS: Array<{ id: AppView; labelKey: TranslationKey; icon: string }> = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: '▥' },
  { id: 'record', labelKey: 'nav.record', icon: '✎' },
  { id: 'tracking', labelKey: 'nav.tracking', icon: '⌁' },
];

export function PrimaryNav({ view, locale, onChange }: { view: AppView; locale: Locale; onChange: (view: AppView) => void }) {
  return (
    <nav className="primary-nav" aria-label={t('nav.main', locale)}>
      {ITEMS.map((item) => (
        <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => onChange(item.id)} aria-current={view === item.id ? 'page' : undefined}>
          <span className="nav-icon" aria-hidden="true">{item.icon}</span><span>{t(item.labelKey, locale)}</span>
        </button>
      ))}
    </nav>
  );
}

