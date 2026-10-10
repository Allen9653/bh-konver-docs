import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Globe, Type } from "lucide-react";
import CyrillicToTranslit from "cyrillic-to-translit-js";

const cyrillicTranslit = CyrillicToTranslit();

export type Script = "latin" | "cyrillic";

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [script, setScript] = useState<Script>(
    (localStorage.getItem("script") as Script) || "latin"
  );

  const languages = [
    { code: "bs", name: "Bosanski" },
    { code: "en", name: "English" },
    { code: "de", name: "Deutsch" },
    { code: "tr", name: "Türkçe" },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  const changeScript = (newScript: Script) => {
    setScript(newScript);
    localStorage.setItem("script", newScript);
    
    // Change language based on script
    if (newScript === "cyrillic") {
      i18n.changeLanguage("bs-Cyrl");
    } else {
      i18n.changeLanguage("bs");
    }
    
    // Trigger re-render
    window.dispatchEvent(new Event("scriptchange"));
  };

  useEffect(() => {
    // Only apply the script preference to Bosnian; never override a stored
    // non-Bosnian locale (en/de/tr) restored after login or reload.
    const stored = localStorage.getItem("language");
    if (stored && stored !== "bs" && stored !== "bs-Cyrl") return;
    if (script === "cyrillic" && i18n.language !== "bs-Cyrl") {
      i18n.changeLanguage("bs-Cyrl");
    } else if (script === "latin" && i18n.language === "bs-Cyrl") {
      i18n.changeLanguage("bs");
    }
  }, [script, i18n]);

  const currentLanguage = languages.find((lang) => lang.code === i18n.language);

  return (
    <div className="flex gap-2">
      {/* Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">{currentLanguage?.name || "Bosanski"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background z-50">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={i18n.language === language.code ? "bg-accent" : ""}
            >
              {language.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Script Selector (only for Bosnian) */}
      {(i18n.language === "bs" || i18n.language === "bs-Cyrl") && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline">
                {script === "latin" ? "Latinica" : "Ćirilica"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background z-50">
            <DropdownMenuItem
              onClick={() => changeScript("latin")}
              className={script === "latin" ? "bg-accent" : ""}
            >
              Latinica
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => changeScript("cyrillic")}
              className={script === "cyrillic" ? "bg-accent" : ""}
            >
              Ћирилица
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

// Hook to use script conversion
export const useScript = () => {
  const [script, setScript] = useState<Script>(
    (localStorage.getItem("script") as Script) || "latin"
  );
  const { i18n } = useTranslation();

  useEffect(() => {
    const handleScriptChange = () => {
      setScript((localStorage.getItem("script") as Script) || "latin");
    };

    window.addEventListener("scriptchange", handleScriptChange);
    return () => window.removeEventListener("scriptchange", handleScriptChange);
  }, []);

  const convertText = (text: string): string => {
    if (i18n.language === "bs" && script === "cyrillic") {
      return cyrillicTranslit.transform(text, "-");
    }
    return text;
  };

  return { script, convertText };
};
