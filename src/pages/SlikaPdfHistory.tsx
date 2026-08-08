import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileImage, FileText, Download, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { PremiumHeader } from "@/components/PremiumHeader";
import { PremiumFooter } from "@/components/PremiumFooter";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useSubscription } from "@/hooks/useSubscription";
import {
  clearHistory,
  deleteHistoryEntry,
  listHistory,
  loadHistoryEntry,
  type HistoryEntry,
} from "@/utils/conversionHistory";

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleString("bs-BA", { dateStyle: "short", timeStyle: "short" });

const downloadBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

interface Row {
  id: string;
  createdAt: number;
  direction: HistoryEntry["direction"];
  sourceName: string;
  outputsCount: number;
}

const SlikaPdfHistory = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isAdmin, signOut, loading: authLoading } = useAdminAuth();
  const { hasActiveSubscription, expiresAt } = useSubscription(user?.id);
  const isPremium = isAdmin || hasActiveSubscription;

  const [rows, setRows] = useState<Row[] | null>(null);
  const [openEntry, setOpenEntry] = useState<HistoryEntry | null>(null);
  const [beforeUrl, setBeforeUrl] = useState<string>("");
  const [outputUrls, setOutputUrls] = useState<string[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const refresh = async () => setRows(await listHistory());

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    return () => {
      if (beforeUrl) URL.revokeObjectURL(beforeUrl);
      outputUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [beforeUrl, outputUrls]);

  const openDetails = async (id: string) => {
    setLoadingId(id);
    try {
      const entry = await loadHistoryEntry(id);
      if (!entry) {
        toast({ title: t("slikaPdfHistory.notFound"), variant: "destructive" });
        return;
      }
      // revoke previous
      if (beforeUrl) URL.revokeObjectURL(beforeUrl);
      outputUrls.forEach((u) => URL.revokeObjectURL(u));

      setOpenEntry(entry);
      const src = entry.sourceType.startsWith("image/")
        ? URL.createObjectURL(entry.sourceBlob)
        : entry.thumbBlob
          ? URL.createObjectURL(entry.thumbBlob)
          : "";
      setBeforeUrl(src);
      setOutputUrls(entry.outputs.map((o) => URL.createObjectURL(o.blob)));
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteHistoryEntry(id);
    if (openEntry?.id === id) setOpenEntry(null);
    await refresh();
  };

  const handleClear = async () => {
    await clearHistory();
    setOpenEntry(null);
    await refresh();
    toast({ title: t("slikaPdfHistory.cleared") });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title={t("slikaPdfHistory.seoTitle")}
        description={t("slikaPdfHistory.seoDescription")}
        path="/slika-pdf/istorija"
      />
      <PremiumHeader
        user={user}
        isAdmin={isAdmin}
        isPremium={isPremium}
        expiresAt={expiresAt}
        onSignOut={signOut}
        loading={authLoading}
      />

      <main className="flex-1 container max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("slikaPdfHistory.title")}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("slikaPdfHistory.subtitle")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/slika-pdf"><ArrowLeft className="w-4 h-4 mr-1.5" /> {t("slikaPdfHistory.back")}</Link>
            </Button>
            {rows && rows.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleClear}>
                <Trash2 className="w-4 h-4 mr-1.5" /> {t("slikaPdfHistory.clearAll")}
              </Button>
            )}
          </div>
        </div>

        {rows === null ? (
          <div className="py-16 text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : rows.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            {t("slikaPdfHistory.emptyPrefix")} <Link to="/slika-pdf" className="text-primary underline">{t("slikaPdfHistory.emptyLink")}</Link> {t("slikaPdfHistory.emptySuffix")}
          </Card>
        ) : (
          <div className="grid gap-3">
            {rows.map((r) => (
              <Card key={r.id} className="p-4 flex flex-wrap items-center gap-4 justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {r.direction === "img2pdf" ? (
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                      <FileImage className="w-5 h-5 text-primary" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.sourceName}</p>
                    <p className="text-xs text-muted-foreground">
                      {fmtDate(r.createdAt)} · {t("slikaPdfHistory.resultsCount", { n: r.outputsCount })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {r.direction === "img2pdf" ? t("slikaPdfHistory.dirImg") : t("slikaPdfHistory.dirPdf")}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDetails(r.id)}
                    disabled={loadingId === r.id}
                    aria-label={loadingId === r.id ? t("slikaPdfHistory.loading") : t("slikaPdfHistory.openDetails", { name: r.sourceName })}
                    aria-busy={loadingId === r.id}
                  >
                    {loadingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : t("slikaPdfHistory.open")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)} aria-label={t("slikaPdfHistory.deleteEntry", { name: r.sourceName })}>
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {openEntry && (
          <Card className="mt-6 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">{openEntry.sourceName}</h2>
                <p className="text-xs text-muted-foreground">{fmtDate(openEntry.createdAt)}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setOpenEntry(null)}>{t("slikaPdfHistory.close")}</Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{t("slikaPdfHistory.before")}</div>
                {beforeUrl ? (
                  <img src={beforeUrl} alt="Original" className="max-h-64 rounded-md border border-border bg-muted object-contain w-full" />
                ) : (
                  <div className="h-40 rounded-md bg-muted flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {(openEntry.sourceSize / 1024).toFixed(1)} KB · {openEntry.sourceType || "n/a"}
                </p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{t("slikaPdfHistory.after")}</div>
                <div className="space-y-2 max-h-72 overflow-auto pr-1">
                  {openEntry.outputs.map((o, i) => (
                    <div key={o.name} className="flex items-center gap-3 p-2 rounded-md border border-border">
                      {o.type.startsWith("image/") ? (
                        <img src={outputUrls[i]} alt={o.name} className="w-14 h-14 object-cover rounded border border-border" />
                      ) : (
                        <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{o.name}</p>
                        <p className="text-[11px] text-muted-foreground">{(o.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => downloadBlob(o.blob, o.name)} aria-label={t("slikaPdfHistory.downloadFile", { name: o.name })}>
                        <Download className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </main>

      <PremiumFooter />
    </div>
  );
};

export default SlikaPdfHistory;
