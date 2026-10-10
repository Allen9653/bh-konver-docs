import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Crown, Eye, Lock, PencilLine } from "lucide-react";
import { ToolRunner } from "@/components/free-tools/ToolRunner";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { pdfToWordVisual, type ToolProgress } from "@/utils/freeTools";
import { cn } from "@/lib/utils";

type ConversionMode = "visual" | "editable";

type PdfToWordRunnerProps = {
  onBack: () => void;
  initialFile?: File;
  isPremium: boolean;
  onOpenPaywall: () => void;
  onBeforePrivateRun: () => boolean;
  onAfterPrivateSuccess: () => void;
  runEditable: (file: File, onProgress: ToolProgress) => Promise<Blob>;
};

export const PdfToWordRunner = ({
  onBack,
  initialFile,
  isPremium,
  onOpenPaywall,
  onBeforePrivateRun,
  onAfterPrivateSuccess,
  runEditable,
}: PdfToWordRunnerProps) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<ConversionMode>("visual");

  const selectMode = (nextMode: string) => {
    if (nextMode === "editable" && !isPremium) {
      onOpenPaywall();
      return;
    }
    setMode(nextMode as ConversionMode);
  };

  const modeOptions = [
    {
      id: "visual" as const,
      icon: Eye,
      title: t("pdfToWordModes.visual.title"),
      description: t("pdfToWordModes.visual.description"),
      badge: t("pdfToWordModes.visual.badge"),
    },
    {
      id: "editable" as const,
      icon: PencilLine,
      title: t("pdfToWordModes.editable.title"),
      description: t("pdfToWordModes.editable.description"),
      badge: t("pdfToWordModes.editable.badge"),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">{t("pdfToWordModes.choose")}</p>
        <RadioGroup value={mode} onValueChange={selectMode} className="grid gap-3 sm:grid-cols-2">
          {modeOptions.map((option) => {
            const Icon = option.icon;
            const selected = mode === option.id;
            const locked = option.id === "editable" && !isPremium;
            return (
              <label
                key={option.id}
                className={cn(
                  "flex min-h-32 cursor-pointer gap-3 rounded-md border p-4 transition-colors",
                  selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
                )}
              >
                <RadioGroupItem value={option.id} className="mt-1 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="mb-2 flex flex-wrap items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    <span className="font-semibold text-foreground">{option.title}</span>
                    <Badge variant={option.id === "editable" ? "default" : "secondary"}>
                      {locked && <Lock className="mr-1 h-3 w-3" aria-hidden="true" />}
                      {option.badge}
                    </Badge>
                  </span>
                  <span className="block text-xs leading-relaxed text-muted-foreground">{option.description}</span>
                </span>
              </label>
            );
          })}
        </RadioGroup>
      </div>

      <ToolRunner
        key={mode}
        title={t("alati.tools.pdfToWord.title")}
        description={mode === "visual" ? t("pdfToWordModes.visual.runnerDescription") : t("pdfToWordModes.editable.runnerDescription")}
        acceptedExtensions={["pdf"]}
        outputFilename={(file) => (file as File).name.replace(/\.pdf$/i, ".docx")}
        run={(files, progress) => mode === "visual" ? pdfToWordVisual(files[0], progress) : runEditable(files[0], progress)}
        onBack={onBack}
        onBeforeRun={mode === "visual" ? onBeforePrivateRun : () => {
          if (isPremium) return true;
          onOpenPaywall();
          return false;
        }}
        onAfterSuccess={mode === "visual" ? onAfterPrivateSuccess : undefined}
        initialFiles={initialFile ? [initialFile] : []}
        note={mode === "visual" ? t("pdfToWordModes.visual.note") : t("pdfToWordModes.editable.note")}
        badge={mode === "visual" ? t("pdfToWordModes.visual.badge") : t("pdfToWordModes.editable.badge")}
        badgeIcon={mode === "editable" ? Crown : Lock}
      />
    </div>
  );
};