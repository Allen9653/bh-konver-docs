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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Nevažeća email adresa",
        description: "Molimo unesite važeću email adresu",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { email },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Greška",
        description: "Došlo je do greške pri kreiranju plaćanja",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Instant Konverzija</DialogTitle>
          <DialogDescription>
            Platite 1.00 BAM za neograničene konverzije
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email adresa</Label>
            <Input
              id="email"
              type="email"
              placeholder="vas@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-semibold mb-2">Šta dobijate:</p>
            <ul className="text-sm space-y-1">
              <li>✓ Neograničene konverzije</li>
              <li>✓ Svi formati (Word, Excel, PowerPoint, PDF)</li>
              <li>✓ Brza obrada</li>
              <li>✓ Sigurna transakcija preko Stripe-a</li>
            </ul>
          </div>
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Učitavanje...
              </>
            ) : (
              "Plati 1.00 BAM"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
