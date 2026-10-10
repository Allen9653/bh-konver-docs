import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRightLeft, Copy, Sparkles, Download } from "lucide-react";
import { toast } from "sonner";
import { latinToCyrillic, cyrillicToLatin, downloadBlob } from "@/utils/freeTools";

export const ScriptConverter = ({ onBack }: { onBack: () => void }) => {
  const { t } = useTranslation();
  const [direction, setDirection] = useState<"lat2cyr" | "cyr2lat">("lat2cyr");
  const [input, setInput] = useState("");

  const output = direction === "lat2cyr" ? latinToCyrillic(input) : cyrillicToLatin(input);

  const swap = () => setDirection((d) => (d === "lat2cyr" ? "cyr2lat" : "lat2cyr"));

  const copyOut = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast.success(t("scriptConverter.copied"));
  };

  const downloadTxt = () => {
    if (!output) return;
    downloadBlob(new Blob([output], { type: "text/plain;charset=utf-8" }), "konverzija.txt");
  };

  const leftLabel = direction === "lat2cyr" ? t("scriptConverter.latin") : t("scriptConverter.cyrillic");
  const rightLabel = direction === "lat2cyr" ? t("scriptConverter.cyrillic") : t("scriptConverter.latin");

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> {t("toolRunner.back")}
          </Button>
          <Badge className="bg-accent text-accent-foreground">
            <Sparkles className="w-3 h-3 mr-1" /> {t("scriptConverter.badge")}
          </Badge>
        </div>
        <CardTitle className="text-2xl">{t("scriptConverter.title")}</CardTitle>
        <CardDescription>{t("scriptConverter.description")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm font-medium">{leftLabel}</span>
          <Button variant="outline" size="icon" onClick={swap} aria-label={t("scriptConverter.swap")}>
            <ArrowRightLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">{rightLabel}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {t("scriptConverter.inputLabel", { script: leftLabel })}
            </label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={direction === "lat2cyr" ? t("scriptConverter.placeholderLatin") : t("scriptConverter.placeholderCyrillic")}
              className="min-h-[260px] font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {t("scriptConverter.outputLabel", { script: rightLabel })}
            </label>
            <Textarea
              value={output}
              readOnly
              placeholder={t("scriptConverter.resultPlaceholder")}
              className="min-h-[260px] font-mono text-sm bg-muted/30"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={copyOut} disabled={!output}>
            <Copy className="w-4 h-4 mr-2" /> {t("scriptConverter.copy")}
          </Button>
          <Button onClick={downloadTxt} disabled={!output} className="bg-primary hover:bg-primary/90">
            <Download className="w-4 h-4 mr-2" /> {t("scriptConverter.download")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
