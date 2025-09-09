import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations from JSON files
import enCommon from '../locales/en/common.json';
import daCommon from '../locales/da/common.json';
import enNavigation from '../locales/en/navigation.json';
import daNavigation from '../locales/da/navigation.json';
import enDashboard from '../locales/en/dashboard.json';
import daDashboard from '../locales/da/dashboard.json';
import enAuth from '../locales/en/auth.json';
import daAuth from '../locales/da/auth.json';
import enLeagues from '../locales/en/leagues.json';
import daLeagues from '../locales/da/leagues.json';
import enAccount from '../locales/en/account.json';
import daAccount from '../locales/da/account.json';
import enMatch from '../locales/en/match.json';
import daMatch from '../locales/da/match.json';
import enTeam from '../locales/en/team.json';
import daTeam from '../locales/da/team.json';
import enTransfers from '../locales/en/transfers.json';
import daTransfers from '../locales/da/transfers.json';

// Create i18next instance
const i18n = createInstance();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        navigation: enNavigation,
        dashboard: enDashboard,
        auth: enAuth,
        leagues: enLeagues,
        account: enAccount,
        match: enMatch,
        team: enTeam,
        transfers: enTransfers
      },
      da: {
        common: daCommon,
        navigation: daNavigation,
        dashboard: daDashboard,
        auth: daAuth,
        leagues: daLeagues,
        account: daAccount,
        match: daMatch,
        team: daTeam,
        transfers: daTransfers
      }
    },
    fallbackLng: 'da', // Set Danish as fallback
    lng: 'da', // Set Danish as default language
    debug: false,
    
    supportedLngs: ['da', 'en'], // Prioritize Danish
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      convertDetectedLanguage: (lng: string) => {
        // Convert da-DK to da, en-US to en, etc.
        if (lng.startsWith('da')) return 'da';
        if (lng.startsWith('en')) return 'en';
        // Default to Danish if language is not recognized
        return 'da';
      },
    },
    
    ns: ['common', 'navigation', 'dashboard', 'auth', 'leagues', 'account', 'match', 'team', 'transfers'],
    defaultNS: 'common',
  });

export default i18n;