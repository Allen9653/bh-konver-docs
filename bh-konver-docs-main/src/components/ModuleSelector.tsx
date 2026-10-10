import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Image, FileText, Calculator, Video, Music, Clapperboard, Settings } from "lucide-react";
import type { ConversionModule } from "@/types/formats";

interface ModuleSelectorProps {
  selectedModule: ConversionModule;
  onSelectModule: (module: ConversionModule) => void;
}

const MODULES = [
  {
    id: "video" as ConversionModule,
    key: "video",
    icon: Video,
  },
  {
    id: "audio" as ConversionModule,
    key: "audio",
    icon: Music,
  },
  {
    id: "image" as ConversionModule,
    key: "image",
    icon: Image,
  },
  {
    id: "document" as ConversionModule,
    key: "document",
    icon: FileText,
  },
  {
    id: "gif" as ConversionModule,
    key: "gif",
    icon: Clapperboard,
  },
  {
    id: "pdf-tools" as ConversionModule,
    key: "pdf-tools",
    icon: Settings,
  },
  {
    id: "unit" as ConversionModule,
    key: "unit",
    icon: Calculator,
  },
];

export const ModuleSelector = ({ selectedModule, onSelectModule }: ModuleSelectorProps) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {MODULES.map((module) => {
        const Icon = module.icon;
        const isSelected = selectedModule === module.id;
        
        return (
          <Card
            key={module.id}
            className={`p-6 cursor-pointer transition-all hover:shadow-md ${
              isSelected ? "border-primary border-2 bg-primary/5" : ""
            }`}
            onClick={() => onSelectModule(module.id)}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className={`p-3 rounded-full ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
                <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <h3 className={`font-semibold mb-1 ${isSelected ? "text-primary" : ""}`}>
                  {t(`modules.${module.key}.name`)}
                </h3>
                <p className="text-sm text-muted-foreground">{t(`modules.${module.key}.description`)}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
