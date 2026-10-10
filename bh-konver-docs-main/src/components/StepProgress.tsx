import { Check, Upload, Loader2, Download } from "lucide-react";
import { useTranslation } from "react-i18next";

export type ConversionStep = "upload" | "processing" | "download";

interface StepProgressProps {
  currentStep: ConversionStep;
}

const steps = [
  { id: "upload" as const, labelKey: "modulePage.steps.upload", icon: Upload },
  { id: "processing" as const, labelKey: "modulePage.steps.format", icon: Loader2 },
  { id: "download" as const, labelKey: "modulePage.steps.download", icon: Download },
];

const stepOrder: Record<ConversionStep, number> = { upload: 0, processing: 1, download: 2 };

export const StepProgress = ({ currentStep }: StepProgressProps) => {
  const { t } = useTranslation();
  const currentIdx = stepOrder[currentStep];

  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-md mx-auto my-6">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isActive = idx === currentIdx;
        const Icon = isCompleted ? Check : step.icon;

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-foreground border-foreground text-background"
                    : isActive
                    ? "border-foreground text-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive && step.id === "processing" ? "animate-spin" : ""}`} />
              </div>
              <span className={`text-[11px] font-medium ${isActive || isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                {t(step.labelKey)}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 mt-[-18px] transition-colors duration-300 ${isCompleted ? "bg-foreground" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};
