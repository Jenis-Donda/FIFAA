export const locales = ["en", "fr", "de", "es", "pt", "it", "id", "ko", "ja", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  pt: "Português",
  it: "Italiano",
  id: "Indonesia",
  ko: "한국어",
  ja: "日本語",
  ar: "العربية",
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}


