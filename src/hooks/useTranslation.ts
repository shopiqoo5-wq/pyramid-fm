import { useStore } from '../store';
import { translations } from '../locales';

export function useTranslation() {
  const language = useStore((state: any) => state.language);
  
  const t = (key: string): string => {
    const keys = key.split('.');
    
    // Attempt translation for the targeted dialect
    let value: any = translations[language as keyof typeof translations];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }
    
    if (typeof value === 'string') return value;

    // Fallback securely to English 
    let fallbackValue: any = translations['en'];
    for (const fbK of keys) {
      if (fallbackValue && typeof fallbackValue === 'object' && fbK in fallbackValue) {
        fallbackValue = fallbackValue[fbK];
      } else {
        return key; // return the raw key if totally missing
      }
    }
    return typeof fallbackValue === 'string' ? fallbackValue : key;
  };

  return { t, language };
}
