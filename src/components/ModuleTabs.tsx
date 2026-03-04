import { Video, Music, Image, FileText, Clapperboard, Settings, Calculator } from "lucide-react";
import type { ConversionModule } from "@/types/formats";

interface ModuleTabsProps {
  selected: ConversionModule;
  onSelect: (module: ConversionModule) => void;
  locked?: boolean;
}

const modules = [
  { id: "image" as ConversionModule, label: "Images", icon: Image },
  { id: "document" as ConversionModule, label: "Documents", icon: FileText },
  { id: "video" as ConversionModule, label: "Video", icon: Video },
  { id: "audio" as ConversionModule, label: "Audio", icon: Music },
  { id: "gif" as ConversionModule, label: "GIF", icon: Clapperboard },
  { id: "pdf-tools" as ConversionModule, label: "PDF Tools", icon: Settings },
  { id: "unit" as ConversionModule, label: "Units", icon: Calculator },
];

export const ModuleTabs = ({ selected, onSelect, locked }: ModuleTabsProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-1 p-1 bg-secondary/50 rounded-lg mb-8">
      {modules.map((m) => {
        const Icon = m.icon;
        const isActive = selected === m.id;
        return (
          <button
            key={m.id}
            onClick={() => !locked && onSelect(m.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            } ${locked && m.id !== "unit" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};
