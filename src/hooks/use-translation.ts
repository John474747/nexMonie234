import { useMemo } from 'react';
import { useUser, useDoc, useFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { translations, type Language } from '@/lib/translations';

export function useTranslation() {
  const { user } = useUser();
  const { db } = useFirebase();

  const profileRef = useMemo(() => user ? doc(db, 'users', user.uid) : null, [user, db]);
  const { data: profile } = useDoc<any>(profileRef);

  const currentLanguage: Language = (profile?.preferredLanguage as Language) || 'English';

  const t = (key: string) => {
    return translations[currentLanguage]?.[key] || translations['English'][key] || key;
  };

  return { t, currentLanguage };
}
