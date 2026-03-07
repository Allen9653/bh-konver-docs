import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PremiumHeader } from "@/components/PremiumHeader";
import { PremiumFooter } from "@/components/PremiumFooter";
import { PremiumDropzone } from "@/components/PremiumDropzone";
import { PremiumConversionCard } from "@/components/PremiumConversionCard";
import { ModuleTabs } from "@/components/ModuleTabs";
import { UnitConverter } from "@/components/UnitConverter";
import { PDFToolsSelector } from "@/components/PDFToolsSelector";
import { SponsorBanners } from "@/components/SponsorBanners";
import { PDFToolsInterface } from "@/components/PDFToolsInterface";
import { PricingSection } from "@/components/PricingSection";
import { CurrencyConverter } from "@/components/CurrencyConverter";
import { PayPalPaymentModal } from "@/components/PayPalPaymentModal";
import { canConvertClientSide, convertClientSide, type ConversionProgress } from "@/utils/clientConverter";
import { convertFile } from "@/utils/pdfConverter";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogIn, Sparkles, Shield, Zap } from "lucide-react";
import type { ConversionModule } from "@/types/formats";
import type { PDFOperation } from "@/types/pdfOperations";

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [selectedModule, setSelectedModule] = useState<ConversionModule>("image");
  const [selectedPDFTool, setSelectedPDFTool] = useState<PDFOperation | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("24h");
  const { user, isAdmin, loading, signOut } = useAdminAuth();
  const { hasActiveSubscription, expiresAt } = useSubscription(user?.id);

  const canAccessModules = !!user;
  const isPremiumUser = isAdmin || hasActiveSubscription;

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
  }, []);

  const handleRemove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const pollForJobCompletion = async (jobId: string): Promise<Blob> => {
    let attempts = 0;
    while (attempts < 90) {
      const { data: job, error } = await supabase
        .from("processing_jobs")
        .select("status, progress, result_url, error")
        .eq("id", jobId)
        .single();
      if (error) throw new Error("Error checking conversion status");
      if (job.status === "completed" && job.result_url) {
        const response = await fetch(job.result_url);
        if (!response.ok) throw new Error("Download link expired");
        return await response.blob();
      }
      if (job.status === "failed") throw new Error(job.error || "Conversion failed");
      await new Promise((r) => setTimeout(r, 2000));
      attempts++;
    }
    throw new Error("Conversion timed out");
  };

  const handleConvert = async (
    file: File,
    targetFormat: string,
    needsBackend: boolean,
    onProgress?: (p: ConversionProgress) => void
  ): Promise<Blob> => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (canConvertClientSide(ext, targetFormat)) {
      return await convertClientSide(file, targetFormat, onProgress);
    }
    if (needsBackend) {
      onProgress?.({ stage: "Uploading to server...", percent: 10 });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetFormat", targetFormat);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Please sign in to convert files");
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      onProgress?.({ stage: "Converting on server...", percent: 30 });
      const response = await fetch(`${supabaseUrl}/functions/v1/convert-document`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, apikey: apikey },
        body: formData,
      });
      if (response.status === 202) {
        const asyncData = await response.json();
        onProgress?.({ stage: "Waiting for result...", percent: 50 });
        if (asyncData.job_id) return await pollForJobCompletion(asyncData.job_id);
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Backend conversion failed");
      }
      onProgress?.({ stage: "Done!", percent: 100 });
      return await response.blob();
    }
    return await convertFile(file, targetFormat);
  };

  const getAcceptedFormats = () => {
    switch (selectedModule) {
      case "video": return ["mp4", "mov", "avi", "webm", "mkv", "flv"];
      case "audio": return ["mp3", "ogg", "wav", "m4a", "aac", "flac"];
      case "image": return ["webp", "heic", "png", "jpg", "jpeg", "jfif", "svg"];
      case "document": return ["pdf", "docx", "doc", "epub", "txt", "pptx", "ppt", "xlsx", "xls"];
      case "gif": return ["gif", "apng", "mp4", "mov", "webm"];
      default: return [];
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PremiumHeader
        user={user}
        isAdmin={isAdmin}
        isPremium={isPremiumUser}
        expiresAt={expiresAt}
        onSignOut={signOut}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="gradient-hero text-white py-16 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>{t('hero.version')}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold font-display tracking-tight mb-3">
              BH <span className="text-accent">KONVER</span>
            </h1>
            <p className="text-base text-white/80 max-w-md mx-auto mb-8">
              {t('hero.subtitle')}
            </p>
            <div className="flex justify-center gap-6 text-sm text-white/60">
              <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-accent" /> {t('transparency.nosharing.title')}</div>
              <div className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-accent" /> {t('pricing.day.feature3')}</div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-3xl py-10">
          {/* Module Tabs */}
          <ModuleTabs
            selected={selectedModule}
            onSelect={(module) => {
              if (module === "unit" || canAccessModules) {
                setSelectedModule(module);
                setFiles([]);
                setSelectedPDFTool(null);
              } else {
                navigate("/auth");
              }
            }}
            locked={!canAccessModules}
          />

          {/* Content */}
          {selectedModule === "unit" ? (
            <UnitConverter />
          ) : !canAccessModules ? (
            <div className="text-center py-16 space-y-4">
              <p className="text-sm text-muted-foreground">{t('quickActions.guestDescription')}</p>
              <Button onClick={() => navigate("/auth")} className="h-10 bg-primary hover:bg-primary/90">
                <LogIn className="mr-2 h-4 w-4" /> {t('quickActions.login')}
              </Button>
            </div>
          ) : selectedPDFTool ? (
            <PDFToolsInterface operation={selectedPDFTool} onBack={() => setSelectedPDFTool(null)} />
          ) : selectedModule === "pdf-tools" ? (
            <PDFToolsSelector onSelectTool={(tool) => setSelectedPDFTool(tool)} />
          ) : (
            <div className="space-y-6">
              {files.length === 0 ? (
                <PremiumDropzone onFilesSelected={handleFilesSelected} acceptedFormats={getAcceptedFormats()} />
              ) : (
                <div className="space-y-4">
                  {files.map((file, index) => (
                    <PremiumConversionCard
                      key={`${file.name}-${index}`}
                      file={file}
                      onConvert={handleConvert}
                      onRemove={() => handleRemove(index)}
                      onConvertAnother={() => setFiles([])}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pricing */}
          <div className="mt-16" id="pricing">
            <PricingSection onSelectPlan={(tier) => {
              setSelectedPlanId(tier.id);
              setPaymentModalOpen(true);
            }} />
          </div>

          <PayPalPaymentModal open={paymentModalOpen} onOpenChange={setPaymentModalOpen} initialPlanId={selectedPlanId} />

          <div className="mt-12">
            <CurrencyConverter />
          </div>
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
};

export default Index;
