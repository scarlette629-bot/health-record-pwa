export type AppView = 'dashboard' | 'record' | 'tracking';

const ITEMS: Array<{ id: AppView; label: string; icon: string }> = [
  { id: 'dashboard', label: '總覽', icon: '▥' },
  { id: 'record', label: '記錄', icon: '✎' },
  { id: 'tracking', label: '追蹤', icon: '⌁' },
];

export function PrimaryNav({ view, onChange }: { view: AppView; onChange: (view: AppView) => void }) {
  return (
    <nav className="primary-nav" aria-label="主要功能">
      {ITEMS.map((item) => (
        <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => onChange(item.id)} aria-current={view === item.id ? 'page' : undefined}>
          <span className="nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
