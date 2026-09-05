import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './i18n/en.json'
import hi from './i18n/hi.json'
import te from './i18n/te.json'
import ta from './i18n/ta.json'
import mr from './i18n/mr.json'
import gu from './i18n/gu.json'

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  te: { translation: te },
  ta: { translation: ta },
  mr: { translation: mr },
  gu: { translation: gu },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('bharatseva_lang') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
