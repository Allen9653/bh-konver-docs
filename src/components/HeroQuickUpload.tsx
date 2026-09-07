import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileUp, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Props = {
  onFileSelected: (file: File) => void;
  textTone?: "dark" | "yellow";
};

const ACCEPTED = ["pdf", "docx", "xlsx", "xls", "pptx", "jpg", "jpeg", "png", "html", "htm"];

export const HeroQuickUpload = ({ onFileSelected, textTone = "dark" }: Props) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [dragging, setDragging] = useState(false);
  const foregroundClass = textTone === "yellow" ? "text-gold" : "text-foreground";
  const mutedClass = textTone === "yellow" ? "text-gold/85" : "text-foreground/75";

  const selectFile = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ACCEPTED.includes(extension)) {
      toast({ variant: "destructive", title: t("conversion.error"), description: t("homeHero.unsupported") });
      return;
    }
    onFileSelected(file);
  }, [onFileSelected, t, toast]);

  return (
    <div
      className={`relative min-h-72 rounded-lg border-2 border-dashed p-6 text-center backdrop-blur-md transition sm:p-8 ${dragging ? "border-accent bg-card/25" : "border-primary-foreground/45 bg-card/15 hover:border-accent"}`}
      onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files); }}
    >
      <input
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        type="file"
        accept={ACCEPTED.map((format) => `.${format}`).join(",")}
        onChange={(event) => { selectFile(event.target.files); event.target.value = ""; }}
        aria-label={t("homeHero.uploadButton")}
      />
      <div className="pointer-events-none flex h-full min-h-56 flex-col items-center justify-center">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
          <FileUp className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className={`font-display text-xl font-semibold sm:text-2xl ${foregroundClass}`}>{t("homeHero.uploadTitle")}</h2>
        <p className={`mt-2 max-w-sm text-sm ${mutedClass}`}>{t("homeHero.uploadSubtitle")}</p>
        <Button className="pointer-events-none mt-5 bg-gold text-gold-foreground hover:bg-gold/90">
          <Upload className="mr-2 h-4 w-4" /> {t("homeHero.uploadButton")}
        </Button>
        <p className={`mt-4 text-[11px] ${mutedClass}`}>PDF · DOCX · XLSX · PPTX · JPG · PNG · HTML</p>
      </div>
    </div>
  );
};