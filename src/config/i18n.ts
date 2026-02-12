import vi from '../locales/vi.json';
import en from '../locales/en.json';

type Translations = Record<string, string>;

const translations: Record<string, Translations> = { vi, en };

export function t(locale: string, key: string): string {
  return translations[locale]?.[key] || translations['en']?.[key] || key;
}

export function getLocales(): { code: string; name: string }[] {
  return [
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'en', name: 'English' }
  ];
}
