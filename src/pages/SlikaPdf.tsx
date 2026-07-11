import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import JSZip from "jszip";
import { FileImage, FileText, Download, RotateCcw, CheckCircle2, XCircle, Loader2, History } from "lucide-react";
import { PremiumHeader } from "@/components/PremiumHeader";
import { PremiumFooter } from "@/components/PremiumFooter";
import { SEO } from "@/components/SEO";
import { PremiumDropzone } from "@/components/PremiumDropzone";
import { FormatDetectionBadge } from "@/components/FormatDetectionBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { detectFormat, type DetectedFormat } from "@/utils/formatDetector";
import {
  convertImageToPDF,
  convertImagesToSinglePDF,
  convertPDFToImages,
} from "@/utils/pdfConverter";
import { saveHistoryEntry } from "@/utils/conversionHistory";

type Direction = "img2pdf" | "pdf2img" | null;
type Status = "pending" | "processing" | "done" | "error";

interface FileEntry {
  id: string;
  file: File;
  detected?: DetectedFormat;
  beforeUrl: string;      // object URL for preview thumbnail
  status: Status;
  progress: number;       // 0-100
  outputs: { name: string; blob: Blob; url: string }[];
  error?: string;
}

const ACCEPTED = ["jpg", "jpeg", "png", "pdf"];
const IMG_EXTS = new Set(["jpg", "jpeg", "png"]);

const uid = () => Math.random().toString(36).slice(2, 10);

const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

const makeImageThumb = async (file: File): Promise<string> => URL.createObjectURL(file);

const makePdfFirstPageThumb = async (file: File): Promise<string> => {
  const [blob] = await convertPDFToImages(file, "jpeg");
  return URL.createObjectURL(blob);
};

const SlikaPdf = () => {
  const { toast } = useToast();
  const { user, isAdmin, signOut } = useAdminAuth();
  const { hasActiveSubscription, expiresAt } = useSubscription(user?.id);
  const isPremium = isAdmin || hasActiveSubscription;
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [combineToOnePdf, setCombineToOnePdf] = useState(true);
  const [pdfOutputFormat, setPdfOutputFormat] = useState<"jpeg" | "png">("jpeg");
  const [combinedPdf, setCombinedPdf] = useState<{ name: string; blob: Blob; url: string } | null>(null);

  const direction: Direction = useMemo(() => {
    if (entries.length === 0) return null;
    const first = entries[0].detected?.ext ?? entries[0].file.name.split(".").pop()?.toLowerCase();
    if (first === "pdf") return "pdf2img";
    if (first && IMG_EXTS.has(first)) return "img2pdf";
    return null;
  }, [entries]);

  const reset = () => {
    entries.forEach((e) => {
      URL.revokeObjectURL(e.beforeUrl);
      e.outputs.forEach((o) => URL.revokeObjectURL(o.url));
    });
    if (combinedPdf) URL.revokeObjectURL(combinedPdf.url);
    setEntries([]);
    setCombinedPdf(null);
    setRunning(false);
  };

  const handleFiles = useCallback(async (files: File[]) => {
    const built: FileEntry[] = await Promise.all(
      files.map(async (file) => {
        const detected = await detectFormat(file);
        let beforeUrl = "";
        try {
          beforeUrl =
            detected.ext === "pdf"
              ? await makePdfFirstPageThumb(file)
              : await makeImageThumb(file);
        } catch {
          beforeUrl = "";
        }
        return {
          id: uid(),
          file,
          detected,
          beforeUrl,
          status: "pending" as Status,
          progress: 0,
          outputs: [],
        };
      }),
    );
    setEntries((prev) => [...prev, ...built]);
  }, []);

  const removeEntry = (id: string) => {
    setEntries((prev) => {
      const e = prev.find((x) => x.id === id);
      if (e) {
        URL.revokeObjectURL(e.beforeUrl);
        e.outputs.forEach((o) => URL.revokeObjectURL(o.url));
      }
      return prev.filter((x) => x.id !== id);
    });
  };

  const setEntry = (id: string, patch: Partial<FileEntry>) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const runBatch = async () => {
    if (entries.length === 0 || !direction) return;
    setRunning(true);
    setCombinedPdf(null);

    try {
      if (direction === "img2pdf" && combineToOnePdf && entries.length > 1) {
        // combined path — mark all as processing, then done together
        entries.forEach((e) => setEntry(e.id, { status: "processing", progress: 30 }));
        const blob = await convertImagesToSinglePDF(entries.map((e) => e.file));
        const name = `bh-konver-spojeno-${Date.now()}.pdf`;
        setCombinedPdf({ name, blob, url: URL.createObjectURL(blob) });
        entries.forEach((e) =>
          setEntry(e.id, { status: "done", progress: 100, outputs: [] }),
        );
        // history: one combined entry using first source as preview
        try {
          const first = entries[0];
          await saveHistoryEntry({
            direction: "img2pdf",
            sourceName: `${entries.length} slika → ${name}`,
            sourceSize: entries.reduce((s, e) => s + e.file.size, 0),
            sourceType: first.file.type,
            sourceBlob: first.file,
            outputs: [{ name, type: "application/pdf", size: blob.size, blob }],
            combined: true,
          });
        } catch (e) {
          console.warn("history save failed", e);
        }
      } else {
        for (const entry of entries) {
          setEntry(entry.id, { status: "processing", progress: 10 });
          try {
            const ext = entry.detected?.ext ?? entry.file.name.split(".").pop()?.toLowerCase();
            const outputs: FileEntry["outputs"] = [];
            if (ext === "pdf") {
              const outExt = pdfOutputFormat === "png" ? "png" : "jpg";
              const outMime = pdfOutputFormat === "png" ? "image/png" : "image/jpeg";
              const blobs = await convertPDFToImages(entry.file, pdfOutputFormat, (done, total) => {
                setEntry(entry.id, { progress: Math.round((done / total) * 100) });
              });
              const base = entry.file.name.replace(/\.pdf$/i, "");
              blobs.forEach((b, i) => {
                outputs.push({
                  name: blobs.length === 1 ? `${base}.${outExt}` : `${base}-str-${i + 1}.${outExt}`,
                  blob: b,
                  url: URL.createObjectURL(b),
                });
              });
              try {
                await saveHistoryEntry({
                  direction: "pdf2img",
                  sourceName: entry.file.name,
                  sourceSize: entry.file.size,
                  sourceType: entry.file.type || "application/pdf",
                  sourceBlob: entry.file,
                  outputs: outputs.map((o) => ({
                    name: o.name,
                    type: outMime,
                    size: o.blob.size,
                    blob: o.blob,
                  })),
                });
              } catch (e) {
                console.warn("history save failed", e);
              }
            } else if (ext && IMG_EXTS.has(ext)) {
              const blob = await convertImageToPDF(entry.file);
              const base = entry.file.name.replace(/\.(jpe?g|png)$/i, "");
              outputs.push({
                name: `${base}.pdf`,
                blob,
                url: URL.createObjectURL(blob),
              });
              try {
                await saveHistoryEntry({
                  direction: "img2pdf",
                  sourceName: entry.file.name,
                  sourceSize: entry.file.size,
                  sourceType: entry.file.type,
                  sourceBlob: entry.file,
                  outputs: [{ name: `${base}.pdf`, type: "application/pdf", size: blob.size, blob }],
                });
              } catch (e) {
                console.warn("history save failed", e);
              }
            } else {
              throw new Error("Format nije podržan u ovom alatu.");
            }
            setEntry(entry.id, { status: "done", progress: 100, outputs });
          } catch (err) {
            setEntry(entry.id, {
              status: "error",
              progress: 100,
              error: err instanceof Error ? err.message : "Greška pri konverziji",
            });
          }
        }
      }

      toast({ title: "Konverzija završena", description: "Rezultati su spremni za preuzimanje." });
    } finally {
      setRunning(false);
    }
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    if (combinedPdf) zip.file(combinedPdf.name, combinedPdf.blob);
    entries.forEach((e) => e.outputs.forEach((o) => zip.file(o.name, o.blob)));
    const blob = await zip.generateAsync({ type: "blob" });
    download(blob, `bh-konver-rezultati-${Date.now()}.zip`);
  };

  const totalOutputs =
    (combinedPdf ? 1 : 0) + entries.reduce((s, e) => s + e.outputs.length, 0);
  const anyDone = entries.some((e) => e.status === "done");
  const allDone = entries.length > 0 && entries.every((e) => e.status === "done" || e.status === "error");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Slika ↔ PDF konverter – BH KONVER"
        description="Lokalna JPEG/PNG u PDF i PDF u JPEG konverzija u pregledniku. Bez slanja fajlova na server."
        path="/slika-pdf"
      />
      <PremiumHeader
        user={user}
        isAdmin={isAdmin}
        isPremium={isPremium}
        expiresAt={expiresAt}
        onSignOut={signOut}
      />

      <main className="flex-1 container max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Slika ↔ PDF konverter
            </h1>
            <p className="text-muted-foreground mt-2">
              Prevucite fajlove — format se prepoznaje automatski. Sva obrada je lokalna u vašem pregledniku.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/slika-pdf/istorija">
              <History className="w-4 h-4 mr-1.5" /> Historija konverzija
            </Link>
          </Button>
        </div>

        {entries.length === 0 ? (
          <PremiumDropzone onFilesSelected={handleFiles} acceptedFormats={ACCEPTED} />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="gap-1">
                  {direction === "img2pdf" ? (
                    <>
                      <FileImage className="w-3.5 h-3.5" /> Slika → PDF
                    </>
                  ) : direction === "pdf2img" ? (
                    <>
                      <FileText className="w-3.5 h-3.5" /> PDF → JPEG
                    </>
                  ) : (
                    "Mješoviti fajlovi"
                  )}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {entries.length} fajl(ova) u redu
                </span>
              </div>

              <div className="flex items-center gap-2">
                {direction === "img2pdf" && entries.length > 1 && (
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={combineToOnePdf}
                      onChange={(e) => setCombineToOnePdf(e.target.checked)}
                      disabled={running}
                      className="accent-primary"
                    />
                    Spoji u jedan PDF
                  </label>
                )}
                <Button variant="outline" size="sm" onClick={reset} disabled={running}>
                  <RotateCcw className="w-4 h-4 mr-1.5" /> Poništi
                </Button>
                <Button size="sm" onClick={runBatch} disabled={running || !direction}>
                  {running ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Konvertujem…
                    </>
                  ) : (
                    "Pokreni konverziju"
                  )}
                </Button>
              </div>
            </div>

            {/* Add more files */}
            <PremiumDropzone onFilesSelected={handleFiles} acceptedFormats={ACCEPTED} />

            {/* File cards */}
            <div className="grid gap-4">
              {entries.map((e) => (
                <Card key={e.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
                    {/* BEFORE */}
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                        Prije
                      </div>
                      <div className="flex gap-3">
                        {e.beforeUrl ? (
                          <img
                            src={e.beforeUrl}
                            alt=""
                            className="w-24 h-24 object-cover rounded-md border border-border bg-muted"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-md bg-muted flex items-center justify-center">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{e.file.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {(e.file.size / 1024).toFixed(1)} KB
                          </p>
                          {e.detected && (
                            <div className="mt-2">
                              <FormatDetectionBadge file={e.file} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* STATUS */}
                    <div className="flex flex-col items-center justify-center min-w-[140px]">
                      {e.status === "pending" && (
                        <span className="text-xs text-muted-foreground">Na čekanju</span>
                      )}
                      {e.status === "processing" && (
                        <div className="w-full">
                          <Progress value={e.progress} className="h-1.5" />
                          <p className="text-xs text-muted-foreground mt-1 text-center">
                            {e.progress}%
                          </p>
                        </div>
                      )}
                      {e.status === "done" && (
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      )}
                      {e.status === "error" && (
                        <div className="text-center">
                          <XCircle className="w-6 h-6 text-destructive mx-auto" />
                          <p className="text-xs text-destructive mt-1">{e.error}</p>
                        </div>
                      )}
                      {!running && e.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-xs h-7"
                          onClick={() => removeEntry(e.id)}
                        >
                          Ukloni
                        </Button>
                      )}
                    </div>

                    {/* AFTER */}
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                        Poslije
                      </div>
                      {e.outputs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          {e.status === "done" && combinedPdf
                            ? "Uključeno u spojeni PDF"
                            : "Nema rezultata još"}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {e.outputs.map((o) => (
                            <div
                              key={o.name}
                              className="flex items-center gap-3 p-2 rounded-md border border-border bg-card"
                            >
                              {o.blob.type.startsWith("image/") ? (
                                <img
                                  src={o.url}
                                  alt=""
                                  className="w-14 h-14 object-cover rounded border border-border"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center">
                                  <FileText className="w-6 h-6 text-primary" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{o.name}</p>
                                <p className="text-[11px] text-muted-foreground">
                                  {(o.blob.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => download(o.blob, o.name)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* CONSOLIDATED RESULTS */}
            {(combinedPdf || (allDone && anyDone)) && (
              <Card className="p-5 border-primary/40 bg-primary/5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Rezultati</h2>
                    <p className="text-sm text-muted-foreground">
                      Ukupno {totalOutputs} fajl(ova) spremno za preuzimanje.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {combinedPdf && (
                      <Button
                        variant="outline"
                        onClick={() => download(combinedPdf.blob, combinedPdf.name)}
                      >
                        <Download className="w-4 h-4 mr-1.5" />
                        Preuzmi spojeni PDF
                      </Button>
                    )}
                    {totalOutputs > 1 && (
                      <Button onClick={downloadAll}>
                        <Download className="w-4 h-4 mr-1.5" />
                        Preuzmi sve (ZIP)
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>

      <PremiumFooter />
    </div>
  );
};

export default SlikaPdf;
