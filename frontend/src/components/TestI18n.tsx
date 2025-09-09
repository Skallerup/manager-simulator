"use client";

import { useTranslation } from 'react-i18next';

export function TestI18n() {
  const { t, i18n } = useTranslation('common');

  if (!i18n.isInitialized) {
    return <div className="p-4 border rounded">i18n not initialized yet...</div>;
  }

  return (
    <div className="p-4 border rounded bg-green-50">
      <h3 className="font-bold text-green-800">✅ i18n Test - Working!</h3>
      <p>Current language: <strong>{i18n.language}</strong></p>
      <p>Loading text: <strong>{t('loading')}</strong></p>
      <p>Error text: <strong>{t('error')}</strong></p>
      <p>Success text: <strong>{t('success')}</strong></p>
      <p>User text: <strong>{t('user')}</strong></p>
      <button 
        onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'da' : 'en')}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
      >
        Switch to {i18n.language === 'en' ? t('danish') : t('english')}
      </button>
    </div>
  );
}
