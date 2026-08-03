import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { LegalDoc } from "@/lib/legalDocs";
import { generateLegalPdf, downloadBlob } from "@/utils/legalPdf";

interface Props {
  doc: LegalDoc;
  onBack: () => void;
}

const STEP_SIZE = 4; // fields per step

export const LegalDocWizard = ({ doc, onBack }: Props) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const fields = doc.fields || [];
  const steps = useMemo(() => {
    const chunks: typeof fields[] = [];
    for (let i = 0; i < fields.length; i += STEP_SIZE) chunks.push(fields.slice(i, i + STEP_SIZE));
    return chunks;
  }, [fields]);

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [place, setPlace] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [generating, setGenerating] = useState(false);

  const isReviewStep = step === steps.length;
  const totalSteps = steps.length + 1;

  const update = (key: string, value: string) => setValues((p) => ({ ...p, [key]: value }));

  const currentStepValid = () => {
    if (isReviewStep) return !!place && !!date;
    const required = steps[step].filter((f) => f.required);
    return required.every((f) => (values[f.key] || "").trim().length > 0);
  };

  const handleGenerate = async () => {
    if (!doc.body) return;
    setGenerating(true);
    try {
      const blob = await generateLegalPdf({
        title: doc.title,
        body: doc.body(values),
        signerName: values.fullName || values.donorName || "",
        place,
        date,
      });
      downloadBlob(blob, `${doc.id}-${date}.pdf`);
      toast({ title: t("pravni.pdfReadyTitle"), description: t("pravni.pdfReadyDesc") });
    } catch (e) {
      toast({ title: t("pravni.errTitle"), description: t("pravni.errDesc"), variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> {t("pravni.wizBack")}
        </Button>
        <span className="text-xs text-muted-foreground">
          {t("pravni.wizStep", { s: Math.min(step + 1, totalSteps), total: totalSteps })}
        </span>
      </div>


      <div>
        <h2 className="text-2xl font-bold font-display flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> {doc.title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${((step + (isReviewStep ? 1 : 0)) / totalSteps) * 100}%` }}
        />
      </div>

      {!isReviewStep ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {steps[step].map((f) => (
            <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
              <Label htmlFor={f.key} className="mb-1.5 block">
                {f.label}{f.required && <span className="text-destructive ml-0.5">*</span>}
              </Label>
              {f.type === "textarea" ? (
                <Textarea id={f.key} value={values[f.key] || ""} onChange={(e) => update(f.key, e.target.value)} placeholder={f.placeholder} rows={3} />
              ) : f.type === "select" && f.options ? (
                <Select value={values[f.key] || ""} onValueChange={(v) => update(f.key, v)}>
                  <SelectTrigger><SelectValue placeholder={t("pravni.wizSelect")} /></SelectTrigger>
                  <SelectContent>
                    {f.options.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              ) : (
                <Input id={f.key} type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"} value={values[f.key] || ""} onChange={(e) => update(f.key, e.target.value)} placeholder={f.placeholder} />
              )}
              {f.help && <p className="text-xs text-muted-foreground mt-1">{f.help}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="place" className="mb-1.5 block">{t("pravni.wizPlace")} <span className="text-destructive">*</span></Label>
              <Input id="place" value={place} onChange={(e) => setPlace(e.target.value)} placeholder={t("pravni.wizPlacePh")} />
            </div>
            <div>
              <Label htmlFor="date" className="mb-1.5 block">{t("pravni.wizDate")} <span className="text-destructive">*</span></Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <Card className="p-4 bg-muted/40 border-dashed">
            <p className="text-xs font-semibold text-muted-foreground mb-2">PREGLED IZJAVE</p>
            <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed">{doc.body?.(values)}</pre>
            <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
              <p><strong>Mjesto i datum:</strong> {place || "________"}, {date}</p>
              <p><strong>Izjavu dao pred:</strong> nadležnim organom (općina / notar / sud) u BiH.</p>
              <p><strong>Ovjera:</strong> potpis i službeni pečat nadležnog organa Bosne i Hercegovine (FBiH / RS / Brčko Distrikt).</p>
            </div>
          </Card>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Prethodni
        </Button>
        {!isReviewStep ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!currentStepValid()}>
            Sljedeći
          </Button>
        ) : (
          <Button onClick={handleGenerate} disabled={!currentStepValid() || generating} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Generiši PDF
          </Button>
        )}
      </div>
    </Card>
  );
};
