import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Image } from "lucide-react";

interface Ad {
  id: string;
  name: string;
  image_url: string;
  target_url: string;
  position: string;
  is_active: boolean;
  created_at: string;
}

export function AdminAdsManager() {
  const { toast } = useToast();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New ad form
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [position, setPosition] = useState("left");

  const fetchAds = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ads_management")
      .select("*")
      .order("created_at", { ascending: false });
    setAds((data as Ad[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAds(); }, [fetchAds]);

  const handleAdd = async () => {
    if (!name || !imageUrl || !targetUrl) {
      toast({ title: "Greška", description: "Popunite sva polja", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("ads_management").insert({
      name, image_url: imageUrl, target_url: targetUrl, position
    });
    if (error) {
      toast({ title: "Greška", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Uspješno", description: "Reklama dodana" });
      setName(""); setImageUrl(""); setTargetUrl(""); setPosition("left");
      fetchAds();
    }
    setSaving(false);
  };

  const handleToggle = async (ad: Ad) => {
    const { error } = await supabase
      .from("ads_management")
      .update({ is_active: !ad.is_active })
      .eq("id", ad.id);
    if (!error) fetchAds();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("ads_management").delete().eq("id", id);
    if (!error) fetchAds();
  };

  return (
    <Card className="border-accent/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5 text-accent" />
          Upravljanje reklamama
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new ad form */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
          <p className="text-sm font-medium">Nova reklama</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Naziv" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="URL slike (https://...)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <Input placeholder="Odredišni URL (https://...)" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} />
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Lijevo</SelectItem>
                <SelectItem value="right">Desno</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAdd} disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Dodaj reklamu
          </Button>
        </div>

        {/* Existing ads */}
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : ads.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">Nema konfiguriranih reklama.</p>
        ) : (
          <div className="space-y-3">
            {ads.map((ad) => (
              <div key={ad.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={ad.image_url} alt={ad.name} className="w-10 h-10 rounded object-cover border" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{ad.name}</p>
                    <p className="text-xs text-muted-foreground">Pozicija: {ad.position === "left" ? "Lijevo" : "Desno"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleToggle(ad)} title={ad.is_active ? "Deaktiviraj" : "Aktiviraj"} aria-label={ad.is_active ? `Deaktiviraj oglas ${ad.name}` : `Aktiviraj oglas ${ad.name}`}>
                    {ad.is_active
                      ? <ToggleRight className="w-5 h-5 text-green-600" />
                      : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(ad.id)} aria-label={`Obriši oglas ${ad.name}`}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
