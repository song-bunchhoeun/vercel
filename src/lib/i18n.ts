import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import kmTrans from '@/locales/km/trans.json';
import enTrans from '@/locales/en/trans.json';

const resources = {
    en: { translation: enTrans },
    km: { translation: kmTrans }
};

if (!i18n.isInitialized) {
    i18n.use(initReactI18next)
        .init({
            resources,
            lng: 'en',
            fallbackLng: 'en',
            supportedLngs: ['en', 'km'],
            interpolation: {
                escapeValue: false // React already escapes
            }
            // debug: process.env.NODE_ENV === 'development'
        })
        .catch((err) => console.error('i18n init error:', err));
}

export default i18n;
