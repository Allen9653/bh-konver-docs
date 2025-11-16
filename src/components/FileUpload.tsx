import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFormats: string[];
}

const formatToMimeType: Record<string, string> = {
  pdf: "application/pdf",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const FileUpload = ({ onFilesSelected, acceptedFormats }: FileUploadProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const acceptedMimeTypes = acceptedFormats
    .map((format) => formatToMimeType[format] || "")
    .filter(Boolean)
    .join(",");

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter((file) => {
        const extension = file.name.split(".").pop()?.toLowerCase();
        return extension && acceptedFormats.includes(extension);
      });

      if (validFiles.length === 0) {
        toast({
          title: t('conversion.error'),
          description: `${t('fileUpload.supportedFormats')}: ${acceptedFormats.join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      onFilesSelected(validFiles);
    },
    [acceptedFormats, onFilesSelected, toast]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer bg-card"
    >
      <input
        type="file"
        multiple
        accept={`${acceptedMimeTypes},${acceptedFormats.map((f) => `.${f}`).join(",")}`}
        onChange={handleFileInput}
        className="hidden"
        id="file-input"
      />
      <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground mb-2">
            {t('fileUpload.dragDrop')} {t('fileUpload.browse')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('fileUpload.supportedFormats')}: {acceptedFormats.join(", ").toUpperCase()}
          </p>
        </div>
      </label>
    </div>
  );
};
