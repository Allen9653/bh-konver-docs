import { useTranslation } from "react-i18next";
import { Video, Music, Image, FileText, Clapperboard, Settings, Calculator } from "lucide-react";
import type { ConversionModule } from "@/types/formats";

interface ModuleTabsProps {
  selected: ConversionModule;
  onSelect: (module: ConversionModule) => void;
  locked?: boolean;
}

const modules: { id: ConversionModule; i18nKey: string; icon: any }[] = [
  { id: "image", i18nKey: "modules.image.name", icon: Image },
  { id: "document", i18nKey: "modules.document.name", icon: FileText },
  { id: "video", i18nKey: "modules.video.name", icon: Video },
  { id: "audio", i18nKey: "modules.audio.name", icon: Music },
  { id: "gif", i18nKey: "modules.gif.name", icon: Clapperboard },
  { id: "pdf-tools", i18nKey: "modules.pdf-tools.name", icon: Settings },
  { id: "unit", i18nKey: "modules.unit.name", icon: Calculator },
];

export const ModuleTabs = ({ selected, onSelect, locked }: ModuleTabsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap justify-center gap-1 p-1.5 bg-secondary/50 rounded-xl mb-8 border border-border">
      {modules.map((m) => {
        const Icon = m.icon;
        const isActive = selected === m.id;
        return (
          <button
            key={m.id}
            onClick={() => !locked && onSelect(m.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            } ${locked && m.id !== "unit" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t(m.i18nKey)}</span>
          </button>
        );
      })}
    </div>
  );
};
