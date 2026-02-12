import vi from '../locales/vi.json';
import en from '../locales/en.json';

type Translations = Record<string, string>;

const translations: Record<string, Translations> = { vi, en };

export function t(locale: string, key: string, params?: Record<string, string>): string {
  let text = translations[locale]?.[key] || translations['en']?.[key] || key;

  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
    }
  }

  return text;
}

export function getLocales(): { code: string; name: string }[] {
  return [
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'en', name: 'English' }
  ];
}
