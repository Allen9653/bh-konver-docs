import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PremiumDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFormats: string[];
}

export const PremiumDropzone = ({ onFilesSelected, acceptedFormats }: PremiumDropzoneProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const validateFiles = useCallback(
    (files: File[]) => {
      const valid = files.filter((f) => {
        const ext = f.name.split(".").pop()?.toLowerCase();
        return ext && acceptedFormats.includes(ext);
      });
      if (valid.length === 0) {
        toast({
          title: t('conversion.error'),
          description: `${t('fileUpload.supportedFormats')}: ${acceptedFormats.map((f) => f.toUpperCase()).join(", ")}`,
          variant: "destructive",
        });
        return [];
      }
      return valid;
    },
    [acceptedFormats, toast, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const valid = validateFiles(Array.from(e.dataTransfer.files));
      if (valid.length > 0) onFilesSelected(valid);
    },
    [validateFiles, onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) onFilesSelected(files);
      e.target.value = "";
    },
    [onFilesSelected]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer group min-h-[204px] ${
        isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/40 bg-card"
      }`}
    >
      <input
        type="file"
        multiple
        accept={acceptedFormats.map((f) => `.${f}`).join(",")}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center gap-3">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
          isDragging ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
        }`}>
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {t('fileUpload.dragDrop')} <span className="underline underline-offset-4 text-primary">{t('fileUpload.browse')}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {acceptedFormats.map((f) => f.toUpperCase()).join(" · ")}
          </p>
        </div>
      </div>
    </div>
  );
};
