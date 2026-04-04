import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { db } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { translations, type Language, type Translations } from "@/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // User-specific localStorage key to isolate language per user
  const getLangKey = (userId?: string) => userId ? `app_language_${userId}` : null;

  const [language, setLang] = useState<Language>("en");

  // Load language from user-specific localStorage or DB when user is available
  useEffect(() => {
    if (!user?.id) {
      setLang("en");
      return;
    }

    const key = getLangKey(user.id);
    if (key) {
      const cached = localStorage.getItem(key) as Language;
      if (cached === "en" || cached === "bn") {
        setLang(cached);
        return;
      }
    }

    // Fallback: load from DB
    db
      .from("profiles")
      .select("language")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.language && (data.language === "en" || data.language === "bn")) {
          setLang(data.language as Language);
          if (key) localStorage.setItem(key, data.language);
        } else {
          // Default to English
          setLang("en");
        }
      });
  }, [user?.id]);

  const setLanguage = useCallback(async (lang: Language) => {
    setLang(lang);
    const key = getLangKey(user?.id);
    if (key) localStorage.setItem(key, lang);

    if (user?.id) {
      await db
        .from("profiles")
        .update({ language: lang } as any)
        .eq("id", user.id);
    }
  }, [user?.id]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

const fallback: LanguageContextType = {
  language: "en",
  setLanguage: async () => {},
  t: translations.en,
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  return context ?? fallback;
};
