import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Image, Download, Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAvailableFormats, requiresBackend, formatDisplayName, type OutputFormat } from "@/types/formats";
import { canConvertClientSide } from "@/utils/clientConverter";
import { DocumentPreview } from "@/components/DocumentPreview";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConversionProgress } from "@/components/ConversionProgress";

interface ConversionCardProps {
  file: File;
  onConvert: (file: File, targetFormat: string, requiresBackend: boolean, onProgress?: (p: { stage: string; percent: number }) => void) => Promise<Blob>;
  onRemove: () => void;
}

export const ConversionCard = ({ file, onConvert, onRemove }: ConversionCardProps) => {
  const { t } = useTranslation();
  const [converting, setConverting] = useState(false);
  const [converted, setConverted] = useState<Blob | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [convertedPreviewOpen, setConvertedPreviewOpen] = useState(false);
  const [progress, setProgress] = useState<{ stage: string; percent: number } | null>(null);
  const { toast } = useToast();

  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  
  const availableFormats = getAvailableFormats(fileExtension);
  const [targetFormat, setTargetFormat] = useState<OutputFormat>(availableFormats[0] || "pdf");
  
  const needsBackend = requiresBackend(fileExtension) && !canConvertClientSide(fileExtension || "", targetFormat);
  const isClientSide = canConvertClientSide(fileExtension || "", targetFormat);

  const handleConvert = async () => {
    setConverting(true);
    setProgress({ stage: "Pokretanje...", percent: 0 });
    try {
      const result = await onConvert(file, targetFormat, needsBackend, (p) => setProgress(p));
      setConverted(result);
      setProgress(null);
      toast({
        title: t('conversion.success'),
        description: `${t('conversion.success')} ${formatDisplayName[targetFormat]}`,
      });
    } catch (error) {
      console.error("Conversion error:", error);
      setProgress(null);
      toast({
        title: t('conversion.error'),
        description: error instanceof Error ? error.message : t('conversion.error'),
        variant: "destructive",
      });
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (!converted) return;
    const url = URL.createObjectURL(converted);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name.split(".")[0]}.${targetFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-4">
        {["docx", "doc", "pptx", "xlsx", "xls"].includes(fileExtension || "") ? (
          <FileText className="w-8 h-8 text-primary" />
        ) : fileExtension === "pdf" ? (
          <FileText className="w-8 h-8 text-destructive" />
        ) : (
          <Image className="w-8 h-8 text-primary" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            {(file.size / 1024).toFixed(2)} KB
            {isClientSide && (
              <span className="ml-2 text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded">
                ⚡ Lokalno
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Conversion progress */}
      {converting && progress && (
        <ConversionProgress stage={progress.stage} percent={progress.percent} />
      )}

      {!converted && availableFormats.length > 0 && !converting && (
        <div className="mb-3">
          <label className="text-sm font-medium mb-2 block">{t('conversion.selectFormat')}:</label>
          <Select value={targetFormat} onValueChange={(value) => setTargetFormat(value as OutputFormat)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('conversion.selectFormat')} />
            </SelectTrigger>
            <SelectContent>
              {availableFormats.map((format) => (
                <SelectItem key={format} value={format}>
                  {formatDisplayName[format]}
                  {canConvertClientSide(fileExtension || "", format) && " ⚡"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex gap-2">
        {!converted ? (
          <>
            <Button
              onClick={() => setPreviewOpen(true)}
              variant="outline"
              size="icon"
              title="Pregled"
              disabled={converting}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleConvert}
              disabled={converting}
              className="flex-1"
            >
              {converting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {progress?.stage || t('conversion.converting')}
                </>
              ) : (
                `${t('conversion.convert')} ${formatDisplayName[targetFormat]}`
              )}
            </Button>
            <Button variant="outline" onClick={onRemove} disabled={converting}>
              {t('conversion.remove')}
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => setConvertedPreviewOpen(true)}
              variant="outline"
              size="icon"
              title="Pregled konvertovanog fajla"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button onClick={handleDownload} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              {t('conversion.download')}
            </Button>
            <Button variant="outline" onClick={onRemove}>
              {t('conversion.remove')}
            </Button>
          </>
        )}
      </div>

      <DocumentPreview file={file} open={previewOpen} onOpenChange={setPreviewOpen} />
      
      <Dialog open={convertedPreviewOpen} onOpenChange={setConvertedPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Pregled konvertovanog dokumenta</DialogTitle>
          </DialogHeader>
          {converted && (
            <div className="flex items-center justify-center bg-muted/50 rounded-lg p-4">
              {targetFormat === "pdf" ? (
                <iframe
                  src={URL.createObjectURL(converted)}
                  className="w-full h-[500px] border-0 rounded-lg"
                  title="Converted document"
                />
              ) : targetFormat.match(/^(jpg|jpeg|png|webp|gif)$/) ? (
                <img
                  src={URL.createObjectURL(converted)}
                  alt="Converted document"
                  className="max-w-full max-h-[500px] object-contain"
                />
              ) : (
                <div className="text-center space-y-2 p-8">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto" />
                  <p className="font-medium">Pregled nije dostupan</p>
                  <p className="text-sm text-muted-foreground">
                    Format {formatDisplayName[targetFormat]} ne podržava pregled
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
