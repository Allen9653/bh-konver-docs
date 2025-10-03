import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Image, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConversionCardProps {
  file: File;
  onConvert: (file: File, targetFormat: string, requiresBackend: boolean) => Promise<Blob>;
  onRemove: () => void;
}

export const ConversionCard = ({ file, onConvert, onRemove }: ConversionCardProps) => {
  const [converting, setConverting] = useState(false);
  const [converted, setConverted] = useState<Blob | null>(null);
  const { toast } = useToast();

  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  
  // Određivanje dostupnih formata na osnovu ulaznog fajla
  const getAvailableFormats = (ext: string | undefined): string[] => {
    switch (ext) {
      case "pdf": return ["jpeg", "png"];
      case "jpeg":
      case "jpg":
      case "png": return ["pdf"];
      case "docx":
      case "doc": return ["pdf", "jpeg", "png", "html"];
      case "pptx": return ["pdf", "jpeg", "png"];
      case "xlsx":
      case "xls": return ["pdf", "csv"];
      default: return [];
    }
  };
  
  const availableFormats = getAvailableFormats(fileExtension);
  const [targetFormat, setTargetFormat] = useState(availableFormats[0] || "pdf");
  
  const requiresBackend = ["docx", "doc", "pptx", "xlsx", "xls"].includes(fileExtension || "");

  const handleConvert = async () => {
    setConverting(true);
    try {
      const result = await onConvert(file, targetFormat, requiresBackend);
      setConverted(result);
      toast({
        title: "Konverzija uspješna!",
        description: `Fajl je konvertovan u ${targetFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Greška",
        description: error instanceof Error ? error.message : "Konverzija nije uspjela. Molimo pokušajte ponovo.",
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
          </p>
        </div>
      </div>

      {!converted && availableFormats.length > 1 && (
        <div className="mb-3">
          <label className="text-sm font-medium mb-2 block">Izlazni format:</label>
          <Select value={targetFormat} onValueChange={setTargetFormat}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableFormats.map((format) => (
                <SelectItem key={format} value={format}>
                  {format.toUpperCase()}
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
              onClick={handleConvert}
              disabled={converting}
              className="flex-1"
            >
              {converting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Konvertujem...
                </>
              ) : (
                `Konvertuj u ${targetFormat.toUpperCase()}`
              )}
            </Button>
            <Button variant="outline" onClick={onRemove}>
              Ukloni
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleDownload} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Preuzmi
            </Button>
            <Button variant="outline" onClick={onRemove}>
              Ukloni
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};
