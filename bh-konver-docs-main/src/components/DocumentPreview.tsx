import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Image, Film, Music } from "lucide-react";

interface DocumentPreviewProps {
  file: File;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentPreview = ({ file, open, onOpenChange }: DocumentPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileType = file.type;

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const renderPreview = () => {
    // Image preview
    if (fileType.startsWith("image/")) {
      return (
        <div className="flex items-center justify-center bg-muted/50 rounded-lg p-4">
          <img src={previewUrl} alt={file.name} className="max-w-full max-h-[500px] object-contain" />
        </div>
      );
    }

    // PDF preview
    if (fileType === "application/pdf") {
      return (
        <iframe
          src={previewUrl}
          className="w-full h-[500px] border-0 rounded-lg"
          title={file.name}
        />
      );
    }

    // Video preview
    if (fileType.startsWith("video/")) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-4">
          <Film className="w-16 h-16 text-muted-foreground" />
          <video src={previewUrl} controls className="w-full max-h-[400px] rounded-lg">
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // Audio preview
    if (fileType.startsWith("audio/")) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8">
          <Music className="w-16 h-16 text-muted-foreground" />
          <audio src={previewUrl} controls className="w-full">
            Your browser does not support the audio tag.
          </audio>
          <p className="text-sm text-muted-foreground">{file.name}</p>
        </div>
      );
    }

    // Default preview for unsupported types
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 bg-muted/50 rounded-lg">
        <FileText className="w-16 h-16 text-muted-foreground" />
        <div className="text-center space-y-2">
          <p className="font-medium">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            Veličina: {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <p className="text-sm text-muted-foreground">
            Tip: {fileType || "Nepoznat"}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Pregled nije dostupan za ovaj tip fajla
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Pregled dokumenta</DialogTitle>
        </DialogHeader>
        {renderPreview()}
      </DialogContent>
    </Dialog>
  );
};
