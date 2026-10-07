export const translations = {
  'zh-TW': {
    'app.name': 'Self-Care',
    'app.subtitle': '個人健康資料管理',
    'app.loading': '正在準備健康紀錄…',
    'a11y.skipToContent': '跳至主要內容',
    'header.localStorage': '本機儲存',
    'header.localStorageTitle': '資料僅儲存在此裝置',
    'header.tools': '應用程式工具',
    'header.profile': '編輯個人資料',
    'header.dataManager': '資料匯入與備份',
    'header.install': '安裝應用程式',
    'header.lightMode': '切換淺色模式',
    'header.darkMode': '切換深色模式',
    'header.fontSize': '字級調整',
    'header.fontSmaller': '縮小字級',
    'header.fontLarger': '放大字級',
    'nav.main': '主要功能',
    'nav.dashboard': '首頁',
    'nav.record': '紀錄',
    'nav.tracking': '趨勢',
    'footer.localOnly': '🔒 資料僅儲存在此裝置',
    'footer.notDiagnosis': '本工具不提供醫療診斷',
    'update.available': 'Self-Care 有新版本可用',
    'update.description': '更新不會刪除裝置上的健康紀錄。',
    'update.action': '更新至 1.0',
    'update.dismiss': '稍後',
    'toast.recordUpdated': '紀錄已更新，趨勢同步完成',
    'toast.recordSaved': '紀錄已儲存，總覽同步完成',
    'toast.recordDeleted': '紀錄已刪除，趨勢同步完成',
    'toast.profileSaved': '個人資料已儲存',
    'toast.installComplete': '安裝完成',
    'toast.importComplete': '已匯入 {count} 筆紀錄，圖表同步完成',
  },
  en: {
    'app.name': 'Self-Care',
    'app.subtitle': 'Personal Health Data Manager',
    'app.loading': 'Preparing your health records…',
    'a11y.skipToContent': 'Skip to main content',
    'header.localStorage': 'On-device',
    'header.localStorageTitle': 'Data is stored only on this device',
    'header.tools': 'App tools',
    'header.profile': 'Edit profile',
    'header.dataManager': 'Import and back up data',
    'header.install': 'Install app',
    'header.lightMode': 'Switch to light mode',
    'header.darkMode': 'Switch to dark mode',
    'header.fontSize': 'Text size',
    'header.fontSmaller': 'Decrease text size',
    'header.fontLarger': 'Increase text size',
    'nav.main': 'Primary navigation',
    'nav.dashboard': 'Home',
    'nav.record': 'Record',
    'nav.tracking': 'Trends',
    'footer.localOnly': '🔒 Data is stored only on this device',
    'footer.notDiagnosis': 'This tool does not provide a medical diagnosis',
    'update.available': 'A new Self-Care version is available',
    'update.description': 'Updating will not delete health records on this device.',
    'update.action': 'Update to 1.0',
    'update.dismiss': 'Later',
    'toast.recordUpdated': 'Record updated and trends refreshed',
    'toast.recordSaved': 'Record saved and dashboard refreshed',
    'toast.recordDeleted': 'Record deleted and trends refreshed',
    'toast.profileSaved': 'Profile saved',
    'toast.installComplete': 'Installation complete',
    'toast.importComplete': 'Imported {count} records and refreshed charts',
  },
} as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof translations['zh-TW'];
export const DEFAULT_LOCALE: Locale = 'zh-TW';

export function t(key: TranslationKey, locale: Locale = DEFAULT_LOCALE, values?: Record<string, string | number>): string {
  const template: string = translations[locale][key] ?? translations[DEFAULT_LOCALE][key];
  return Object.entries(values ?? {}).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    template,
  );
}


