import { useUser, useDoc } from '@/firebase';
import { translations, type Language } from '@/lib/translations';

/**
 * Reads the user's preferred language from the Supabase `profiles` table
 * and returns a translation helper `t(key)`.
 * Previously read from Firestore — now fully on Supabase.
 */
export function useTranslation() {
  const { user } = useUser();
  const { data: profile } = useDoc<any>(
    user ? { table: 'profiles', id: user.id } : null
  );

  const currentLanguage: Language =
    (profile?.preferred_language as Language) || 'English';

  const t = (key: string): string =>
    translations[currentLanguage]?.[key] ||
    translations['English']?.[key] ||
    key;

  return { t, currentLanguage };
}
