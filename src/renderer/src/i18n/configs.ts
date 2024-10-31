import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import translation_english from './english.json'
import translation_japanese from './japanese.json'

const resources = {
  japanese: {
    translation: translation_japanese
  },
  english: {
    translation: translation_english
  }
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'english',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  })

export default i18n
