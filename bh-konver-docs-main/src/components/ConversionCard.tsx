import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Image, Download, Loader2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { convertClientSide, canConvertClientSide, type ConversionProgress } from "@/utils/clientConverter";
import { ConversionProgress as ProgressBar } from "@/components/ConversionProgress";

interface ConversionCardProps {
  file: File;
  onRemove: () => void;
  onConvert?: (file: File, targetFormat: string, needsBackend: boolean, onProgress?: (p: ConversionProgress) => void) => Promise<Blob>;
}

export const ConversionCard = ({ file, onRemove, onConvert }: ConversionCardProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [format, setFormat] = useState("png");
  const [isConverting, setIsConverting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<ConversionProgress | null>(null);

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const isClientSide = canConvertClientSide(ext, format);

  const handleConversion = async () => {
    setIsConverting(true);
    setProgress(null);
    try {
      let blob: Blob;
      if (isClientSide) {
        blob = await convertClientSide(file, format, setProgress);
      } else if (onConvert) {
        blob = await onConvert(file, format, true, setProgress);
      } else {
        throw new Error("No conversion handler available");
      }

      setResultUrl(URL.createObjectURL(blob));
      toast({ title: t("Success"), description: t("Conversion complete!") });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: t("Error"), description: t("Conversion failed.") });
    } finally {
      setIsConverting(false);
      setProgress(null);
    }
  };

  return (
    <Card className="p-4 mb-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {file.type.includes("image") ? <Image className="w-8 h-8 text-blue-500" /> : <FileText className="w-8 h-8 text-red-500" />}
          <div>
            <p className="font-medium truncate max-w-[200px]">{file.name}</p>
            {isClientSide && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded flex items-center gap-1">
                <Zap className="w-3 h-3" /> Client-Side
              </span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove}>X</Button>
      </div>

      {progress && <ProgressBar stage={progress.stage} percent={progress.percent} />}

      {!resultUrl ? (
        <div className="flex gap-2">
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="jpg">JPG</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleConversion} disabled={isConverting}>
            {isConverting ? <Loader2 className="animate-spin mr-2" /> : null}
            {t("Convert")}
          </Button>
        </div>
      ) : (
        <Button asChild className="w-full bg-green-600 hover:bg-green-700">
          <a href={resultUrl} download={`converted-${file.name}`}>
            <Download className="mr-2" /> {t("Download")}
          </a>
        </Button>
      )}
    </Card>
  );
};
