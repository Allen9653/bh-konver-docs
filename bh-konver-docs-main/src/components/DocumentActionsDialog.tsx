import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocumentActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentUrl: string;
  fileName: string;
}

export function DocumentActionsDialog({ 
  open, 
  onOpenChange, 
  documentUrl, 
  fileName 
}: DocumentActionsDialogProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const { toast } = useToast();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Preuzimanje započeto",
      description: "Dokument se preuzima...",
    });
  };

  const handleSendEmail = async () => {
    if (!recipientEmail || !recipientEmail.includes("@")) {
      toast({
        title: "Nevažeća email adresa",
        description: "Molimo unesite važeću email adresu primaoca",
        variant: "destructive",
      });
      return;
    }

    setSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke("send-converted-document", {
        body: { 
          recipientEmail,
          documentUrl,
          fileName
        },
      });

      if (error) throw error;

      toast({
        title: "Email poslan",
        description: `Dokument je poslan na ${recipientEmail}`,
      });
      setRecipientEmail("");
      onOpenChange(false);
    } catch (error) {
      console.error("Email error:", error);
      toast({
        title: "Greška",
        description: "Došlo je do greške pri slanju emaila",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Konverzija završena</DialogTitle>
          <DialogDescription>
            Šta želite uraditi sa konvertiranim dokumentom?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preview section */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <p className="text-sm font-medium mb-2">Dokument:</p>
            <p className="text-sm text-muted-foreground truncate">{fileName}</p>
          </div>

          {/* Download button */}
          <Button
            onClick={handleDownload}
            className="w-full"
            variant="outline"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            Sačuvaj dokument
          </Button>

          {/* Send email section */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Pošalji na email</Label>
            <div className="flex gap-2">
              <Input
                id="recipient"
                type="email"
                placeholder="prima@email.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                disabled={sendingEmail}
              />
              <Button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                size="lg"
              >
                {sendingEmail ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Unesite email adresu na koju želite poslati dokument
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
