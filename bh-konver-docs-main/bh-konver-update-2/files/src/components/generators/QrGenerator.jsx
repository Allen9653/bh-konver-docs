import { useEffect, useState } from "react";
import { Download, Mail, QrCode, Wifi } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const escapeWifiValue = (value) => value.replace(/[\\;,:\"]/g, "\\$&");

export default function QrGenerator() {
  const [kind, setKind] = useState("text");
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState("WPA");
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  const payload = (() => {
    if (kind === "email") {
      if (!email.trim()) return "";
      const params = new URLSearchParams();
      if (subject) params.set("subject", subject);
      if (body) params.set("body", body);
      const query = params.toString();
      return `mailto:${email.trim()}${query ? `?${query}` : ""}`;
    }
    if (kind === "wifi") {
      if (!ssid.trim()) return "";
      const auth = encryption === "nopass" ? "nopass" : encryption;
      return `WIFI:T:${auth};S:${escapeWifiValue(ssid.trim())};${encryption === "nopass" ? "" : `P:${escapeWifiValue(password)};`}H:false;;`;
    }
    return text.trim();
  })();

  useEffect(() => {
    let current = true;
    if (!payload) {
      setDataUrl("");
      setError("");
      setGenerating(false);
      return () => { current = false; };
    }
    setGenerating(true);
    QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#172033", light: "#ffffff" },
    }).then((url) => {
      if (current) {
        setDataUrl(url);
        setError("");
      }
    }).catch(() => {
      if (current) setError("QR kod nije moguće generisati za ovaj sadržaj. Pokušajte kraći tekst.");
    }).finally(() => {
      if (current) setGenerating(false);
    });
    return () => { current = false; };
  }, [payload]);

  const modes = [
    { id: "text", label: "Tekst", icon: QrCode },
    { id: "url", label: "URL", icon: QrCode },
    { id: "email", label: "E-mail", icon: Mail },
    { id: "wifi", label: "WiFi", icon: Wifi },
  ];

  return (
    <section className="mx-auto w-full max-w-4xl rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
      <header className="mb-7 flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-700"><QrCode className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="font-display text-2xl font-bold text-foreground">QR Code generator</h2><p className="mt-1 text-sm text-muted-foreground">Napravite QR kod i preuzmite ga kao PNG sliku.</p></div></header>
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-md bg-muted p-1 sm:grid-cols-4" role="tablist" aria-label="Vrsta QR koda">
        {modes.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={kind === id} onClick={() => setKind(id)} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded px-2 text-sm font-semibold transition-colors ${kind === id ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}><Icon className="h-4 w-4" aria-hidden="true" />{label}</button>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {(kind === "text" || kind === "url") && <label className="block text-sm font-medium text-foreground">{kind === "url" ? "Web adresa" : "Tekst za QR kod"}<textarea value={text} onChange={(event) => setText(event.target.value)} rows={kind === "url" ? 2 : 5} placeholder={kind === "url" ? "https://primjer.ba" : "Unesite tekst..."} className="mt-2 w-full resize-y rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>}
          {kind === "email" && <>
            <label className="block text-sm font-medium text-foreground">E-mail adresa<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ime@primjer.ba" className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>
            <label className="block text-sm font-medium text-foreground">Naslov <span className="text-muted-foreground">(opcionalno)</span><input value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>
            <label className="block text-sm font-medium text-foreground">Poruka <span className="text-muted-foreground">(opcionalno)</span><textarea value={body} onChange={(event) => setBody(event.target.value)} rows={3} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>
          </>}
          {kind === "wifi" && <>
            <label className="block text-sm font-medium text-foreground">Naziv mreže (SSID)<input value={ssid} onChange={(event) => setSsid(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>
            <label className="block text-sm font-medium text-foreground">Zaštita<select value={encryption} onChange={(event) => setEncryption(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"><option value="WPA">WPA / WPA2 / WPA3</option><option value="WEP">WEP</option><option value="nopass">Bez lozinke</option></select></label>
            {encryption !== "nopass" && <label className="block text-sm font-medium text-foreground">Lozinka mreže<input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>}
          </>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <p className="text-xs leading-5 text-muted-foreground">Sadržaj QR koda kreira se u vašem pregledniku. Nemojte unositi osjetljive podatke.</p>
        </div>
        <div className="flex min-h-64 flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center">
          {generating && !dataUrl ? <Skeleton className="h-56 w-56 max-w-full" aria-label="Generisanje QR koda" /> : dataUrl ? <><img src={dataUrl} alt="Generisani QR kod" className="h-56 w-56 max-w-full rounded bg-white p-2" /><a href={dataUrl} download="bh-konver-qr.png" onClick={() => toast.success("QR kod je preuzet kao PNG")} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"><Download className="h-4 w-4" aria-hidden="true" />Preuzmi PNG</a></> : <div className="max-w-48 text-sm text-muted-foreground"><QrCode className="mx-auto mb-3 h-9 w-9 opacity-50" aria-hidden="true" />Unesite sadržaj da biste napravili QR kod.</div>}
        </div>
      </div>
    </section>
  );
}
