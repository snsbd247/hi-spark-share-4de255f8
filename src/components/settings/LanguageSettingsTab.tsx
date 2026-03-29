import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { languageNames, type Language } from "@/i18n";
import { Globe, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const languages: { code: Language; flag: string; nativeName: string; desc: string }[] = [
  { code: "en", flag: "🇺🇸", nativeName: "English", desc: "Use English for the admin panel" },
  { code: "bn", flag: "🇧🇩", nativeName: "বাংলা", desc: "অ্যাডমিন প্যানেলে বাংলা ব্যবহার করুন" },
];

export default function LanguageSettingsTab() {
  const { language, setLanguage, t } = useLanguage();

  const handleSelect = async (lang: Language) => {
    if (lang === language) return;
    await setLanguage(lang);
    toast.success(t.settings.languageSaved);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          {t.settings.languageSettings}
        </CardTitle>
        <CardDescription>{t.settings.languageDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={cn(
                "relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                language === lang.code
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <span className="text-3xl">{lang.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{lang.nativeName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{lang.desc}</p>
              </div>
              {language === lang.code && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
