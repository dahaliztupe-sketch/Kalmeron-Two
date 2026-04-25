import {getRequestConfig} from 'next-intl/server';

// Can be imported from a shared config
const locales = ['ar', 'en'] as const;
type Locale = typeof locales[number];

function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (locales as readonly string[]).includes(value);
}

export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the [locale] segment
  const requested = await requestLocale;
  const locale: Locale = isLocale(requested) ? requested : 'ar';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
