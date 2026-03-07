import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function AdminDangerZone() {
  const { toast } = useToast();
  const [purging, setPurging] = useState(false);

  const handlePurge = async () => {
    setPurging(true);
    try {
      const { error } = await supabase.rpc("manual_purge_all_logs");
      if (error) throw error;
      toast({ title: "Purge završen", description: "Svi logovi konverzija su obrisani." });
    } catch (err: any) {
      toast({ title: "Greška", description: err.message, variant: "destructive" });
    } finally {
      setPurging(false);
    }
  };

  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Ove akcije su nepovratne. Budite oprezni!
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={purging}>
              {purging ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Purge All Logs Now
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Jeste li sigurni?</AlertDialogTitle>
              <AlertDialogDescription>
                Ova akcija će trajno obrisati SVE zapise iz conversion_logs tabele. Ovo se ne može poništiti.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Odustani</AlertDialogCancel>
              <AlertDialogAction onClick={handlePurge} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Da, obriši sve
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
