import { Card } from "@/components/ui/card";
import { Image, FileText, Calculator } from "lucide-react";
import type { ConversionModule } from "@/types/formats";

interface ModuleSelectorProps {
  selectedModule: ConversionModule;
  onSelectModule: (module: ConversionModule) => void;
}

const MODULES = [
  {
    id: "image" as ConversionModule,
    name: "Image Converter",
    description: "WEBP→PNG, HEIC→JPG, PNG→SVG",
    icon: Image,
  },
  {
    id: "pdf" as ConversionModule,
    name: "PDF Converter",
    description: "PDF→Word, PDF→JPG, JPG→PDF",
    icon: FileText,
  },
  {
    id: "unit" as ConversionModule,
    name: "Unit Converter",
    description: "cm↔inch, kg↔lbs, °C↔°F",
    icon: Calculator,
  },
];

export const ModuleSelector = ({ selectedModule, onSelectModule }: ModuleSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                  {module.name}
                </h3>
                <p className="text-sm text-muted-foreground">{module.description}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
