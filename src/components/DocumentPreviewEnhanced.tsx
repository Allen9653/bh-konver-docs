import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Image, 
  Film, 
  Music, 
  Download, 
  Share2, 
  Printer, 
  Mail, 
  Edit, 
  Loader2,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocumentPreviewEnhancedProps {
  file: File | null;
  fileUrl?: string;
  fileName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentPreviewEnhanced = ({ 
  file, 
  fileUrl, 
  fileName, 
  open, 
  onOpenChange 
}: DocumentPreviewEnhancedProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [emailTo, setEmailTo] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const displayName = file?.name || fileName || "Dokument";
  const fileType = file?.type || "";
  const fileSize = file?.size || 0;

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (fileUrl) {
      setPreviewUrl(fileUrl);
    }
  }, [file, fileUrl]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = displayName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Preuzimanje započeto",
      description: `${displayName} se preuzima...`,
    });
  };

  const handlePrint = () => {
    const printWindow = window.open(previewUrl, "_blank");
    if (printWindow) {
      printWindow.addEventListener("load", () => {
        printWindow.print();
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: displayName,
          text: `Pogledajte ovaj dokument: ${displayName}`,
          url: previewUrl,
        });
      } catch (error) {
        console.log("Share cancelled or failed");
      }
    } else {
      // Copy link to clipboard
      await navigator.clipboard.writeText(previewUrl);
      toast({
        title: "Link kopiran",
        description: "Link je kopiran u clipboard.",
      });
    }
  };

  const handleSendEmail = async () => {
    if (!emailTo || !emailTo.includes("@")) {
      toast({
        title: "Nevažeća email adresa",
        description: "Molimo unesite validnu email adresu.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          type: "share_document",
          to: emailTo,
          documentUrl: previewUrl,
          documentName: displayName,
        },
      });

      if (error) throw error;

      toast({
        title: "Email poslan",
        description: `Dokument je poslan na ${emailTo}`,
      });
      setShowEmailInput(false);
      setEmailTo("");
    } catch (error) {
      console.error("Send email error:", error);
      toast({
        title: "Greška",
        description: "Nije moguće poslati email. Pokušajte ponovo.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleEdit = () => {
    // For now, just show a message - full editing would require additional libraries
    toast({
      title: "Uređivanje",
      description: "Za uređivanje preuzmite dokument i uredite ga lokalno.",
    });
  };

  const renderPreview = () => {
    // Image preview
    if (fileType.startsWith("image/")) {
      return (
        <div className="flex items-center justify-center bg-muted/50 rounded-lg p-4">
          <img src={previewUrl} alt={displayName} className="max-w-full max-h-[400px] object-contain" />
        </div>
      );
    }

    // PDF preview
    if (fileType === "application/pdf") {
      return (
        <iframe
          src={previewUrl}
          className="w-full h-[400px] border-0 rounded-lg"
          title={displayName}
        />
      );
    }

    // Video preview
    if (fileType.startsWith("video/")) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-4">
          <video src={previewUrl} controls className="w-full max-h-[350px] rounded-lg">
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
          <p className="text-sm text-muted-foreground">{displayName}</p>
        </div>
      );
    }

    // MS Office files
    if (fileType.includes("word") || fileType.includes("document") ||
        fileType.includes("excel") || fileType.includes("spreadsheet") ||
        fileType.includes("powerpoint") || fileType.includes("presentation")) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8 bg-muted/50 rounded-lg">
          <FileText className="w-16 h-16 text-primary" />
          <div className="text-center space-y-2">
            <p className="font-medium text-lg">{displayName}</p>
            <p className="text-sm text-muted-foreground">
              Veličina: {(fileSize / 1024 / 1024).toFixed(2)} MB
            </p>
            <p className="text-sm text-primary font-medium">
              MS Office dokument - preuzmite za pregled
            </p>
          </div>
        </div>
      );
    }

    // Default preview for unsupported types
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 bg-muted/50 rounded-lg">
        <FileText className="w-16 h-16 text-muted-foreground" />
        <div className="text-center space-y-2">
          <p className="font-medium">{displayName}</p>
          <p className="text-sm text-muted-foreground">
            Veličina: {(fileSize / 1024 / 1024).toFixed(2)} MB
          </p>
          <p className="text-sm text-muted-foreground">
            Tip: {fileType || "Nepoznat"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {displayName}
          </DialogTitle>
        </DialogHeader>

        {/* Preview Area */}
        <div className="my-4">
          {renderPreview()}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-center border-t pt-4">
          <Button onClick={handleDownload} variant="default" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Preuzmi
          </Button>
          
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Štampaj
          </Button>
          
          <Button onClick={handleShare} variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Podijeli
          </Button>
          
          <Button 
            onClick={() => setShowEmailInput(!showEmailInput)} 
            variant="outline" 
            size="sm"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          
          <Button onClick={handleEdit} variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Uredi
          </Button>
        </div>

        {/* Email Input */}
        {showEmailInput && (
          <div className="flex gap-2 mt-4 p-4 bg-muted/50 rounded-lg">
            <Input
              type="email"
              placeholder="Unesite email adresu"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSendEmail} disabled={sending}>
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Pošalji"
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowEmailInput(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
