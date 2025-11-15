import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PDFOperation, PDF_OPERATIONS } from "@/types/pdfOperations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Download, Share2, Edit3, Eye, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PDFToolsInterfaceProps {
  operation: PDFOperation;
  onBack: () => void;
}

export const PDFToolsInterface = ({ operation, onBack }: PDFToolsInterfaceProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState("");
  const [rotationAngle, setRotationAngle] = useState("90");
  const [previewOpen, setPreviewOpen] = useState(false);

  const config = PDF_OPERATIONS[operation];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      toast.error("Molimo odaberite fajl");
      return;
    }

    if (config.requiresMultipleFiles && files.length < 2) {
      toast.error("Molimo odaberite najmanje 2 fajla");
      return;
    }

    setProcessing(true);

    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
      formData.append("operation", operation);
      
      if (operation === "add-watermark") {
        formData.append("watermarkText", watermarkText);
      }
      
      if (operation === "rotate") {
        formData.append("angle", rotationAngle);
      }

      const { data, error } = await supabase.functions.invoke("pdf-operations", {
        body: formData,
      });

      if (error) throw error;

      if (data.file) {
        const blob = new Blob([Uint8Array.from(atob(data.file), c => c.charCodeAt(0))], {
          type: data.contentType || "application/pdf"
        });
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        toast.success("Operacija uspješna!");
      }
    } catch (error: any) {
      console.error("Error processing:", error);
      toast.error(error.message || "Greška pri procesiranju");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement("a");
      a.href = resultUrl;
      a.download = `processed-${Date.now()}.pdf`;
      a.click();
    }
  };

  const handleShare = async () => {
    if (resultUrl && navigator.share) {
      try {
        const response = await fetch(resultUrl);
        const blob = await response.blob();
        const file = new File([blob], "processed.pdf", { type: "application/pdf" });
        await navigator.share({ files: [file] });
      } catch (error) {
        toast.error("Greška pri dijeljenju");
      }
    } else {
      toast.error("Dijeljenje nije podržano");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <Button variant="ghost" onClick={onBack} className="w-fit mb-4">
          ← Nazad
        </Button>
        <CardTitle>{config.displayName}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="file-upload">
            {config.requiresMultipleFiles ? "Odaberite fajlove" : "Odaberite fajl"}
          </Label>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            multiple={config.requiresMultipleFiles}
            accept={operation === "compress-jpeg" ? "image/jpeg" : "application/pdf"}
            className="mt-2"
          />
        </div>

        {operation === "add-watermark" && (
          <div>
            <Label htmlFor="watermark-text">Tekst Watermark-a</Label>
            <Input
              id="watermark-text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="Unesite tekst"
              className="mt-2"
            />
          </div>
        )}

        {operation === "rotate" && (
          <div>
            <Label htmlFor="rotation">Ugao Rotacije</Label>
            <Select value={rotationAngle} onValueChange={setRotationAngle}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90°</SelectItem>
                <SelectItem value="180">180°</SelectItem>
                <SelectItem value="270">270°</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          onClick={handleProcess}
          disabled={processing || files.length === 0}
          className="w-full"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesiranje...
            </>
          ) : (
            "Pokreni"
          )}
        </Button>

        {resultUrl && (
          <div className="flex gap-2 pt-4">
            <Button onClick={() => setPreviewOpen(true)} variant="outline" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
            <Button onClick={handleDownload} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={handleShare} variant="outline" className="flex-1">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        )}
      </CardContent>
      
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Pregled rezultata</DialogTitle>
          </DialogHeader>
          {resultUrl && (
            <div className="flex items-center justify-center bg-muted/50 rounded-lg p-4">
              <iframe
                src={resultUrl}
                className="w-full h-[500px] border-0 rounded-lg"
                title="Preview"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
