import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileUpload } from "@/components/FileUpload";
import { ConversionCard } from "@/components/ConversionCard";
import { ModuleSelector } from "@/components/ModuleSelector";
import { UnitConverter } from "@/components/UnitConverter";
import { Footer } from "@/components/Footer";
import { PDFToolsSelector } from "@/components/PDFToolsSelector";
import { PDFToolsInterface } from "@/components/PDFToolsInterface";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PricingSection } from "@/components/PricingSection";
import { CurrencyConverter } from "@/components/CurrencyConverter";
import { PayPalPaymentModal } from "@/components/PayPalPaymentModal";
import { convertFile } from "@/utils/pdfConverter";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Crown } from "lucide-react";
import logo from "@/assets/bh-konver-logo.png";
import bhIllustration from "@/assets/bh-illustration.jpg";
import etnoFiguralni from "@/assets/etno-figuralni.png";
import etnoLjiljan from "@/assets/etno-ljiljan.png";
import etnoJelen from "@/assets/etno-jelen.png";
import etnoCvijet from "@/assets/etno-cvijet.png";
import etnoArkada from "@/assets/etno-arkada.png";
import etnoFauna from "@/assets/etno-fauna.png";
import type { ConversionModule } from "@/types/formats";
import type { PDFOperation } from "@/types/pdfOperations";

const Index = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [selectedModule, setSelectedModule] = useState<ConversionModule>("unit");
  const [selectedPDFTool, setSelectedPDFTool] = useState<PDFOperation | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const { user, isAdmin, loading, signOut } = useAdminAuth();
  const { hasActiveSubscription, expiresAt, loading: subLoading } = useSubscription(user?.email);
  const navigate = useNavigate();

  // Check if user has access to premium features (admin OR paid subscription)
  const showFullFeatures = isAdmin || hasActiveSubscription;

  // Set default module based on access
  useEffect(() => {
    if (!loading && !subLoading && !showFullFeatures) {
      setSelectedModule("unit");
    }
  }, [loading, subLoading, showFullFeatures]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleConvert = async (file: File, targetFormat: string, requiresBackend: boolean): Promise<Blob> => {
    if (requiresBackend) {
      // Backend conversion via Cloudmersive
      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetFormat', targetFormat);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/convert-document`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Backend konverzija nije uspjela');
      }

      return await response.blob();
    } else {
      // Local browser conversion (PDF/JPEG/PNG)
      return await convertFile(file, targetFormat);
    }
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getAcceptedFormats = () => {
    switch (selectedModule) {
      case "video":
        return ["mp4", "mov", "avi", "webm", "mkv", "flv"];
      case "audio":
        return ["mp3", "ogg", "wav", "m4a", "aac", "flac"];
      case "image":
        return ["webp", "heic", "png", "jpg", "jpeg", "jfif", "svg"];
      case "document":
        return ["pdf", "docx", "doc", "epub", "txt", "pptx", "ppt", "xlsx", "xls"];
      case "gif":
        return ["gif", "apng", "mp4", "mov", "webm"];
      default:
        return [];
    }
  };

  

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Etno Background Decorations */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <img src={etnoLjiljan} alt="" className="absolute top-10 right-10 w-32 h-32 object-contain animate-float" />
        <img src={etnoJelen} alt="" className="absolute top-1/4 left-10 w-40 h-40 object-contain animate-float-delayed" />
        <img src={etnoCvijet} alt="" className="absolute bottom-20 right-20 w-36 h-36 object-contain animate-float" />
        <img src={etnoArkada} alt="" className="absolute bottom-10 left-1/4 w-48 h-48 object-contain animate-float-delayed" />
        <img src={etnoFauna} alt="" className="absolute top-1/2 right-1/3 w-32 h-32 object-contain animate-float" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Ad Space - Left Side */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 bg-card border-2 border-dashed border-border rounded-lg p-8 min-h-[600px] flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors">
              <img src={etnoFiguralni} alt="Etno pattern" className="w-32 h-32 object-contain mb-6 opacity-60" />
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {t('adSpace.title')}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t('adSpace.description')}
              </p>
              <div className="space-y-3 text-sm">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="font-semibold text-foreground mb-1">{t('adSpace.contact')}</p>
                  <p className="text-primary font-mono">📧 info@bh-assistant.ba</p>
                </div>
                <div className="text-xs text-muted-foreground space-y-2 text-left">
                  <p>✓ {t('adSpace.benefit1')}</p>
                  <p>✓ {t('adSpace.benefit2')}</p>
                  <p>✓ {t('adSpace.benefit3')}</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main>
        {/* Language Switcher */}
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="BH Konver Logo" className="max-w-md w-full h-auto" />
          </div>
          
          {/* BH Illustration */}
          <div className="relative mb-8 rounded-lg overflow-hidden max-w-2xl mx-auto">
            <img src={bhIllustration} alt="Bosnia and Herzegovina" className="w-full h-auto opacity-90" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('hero.mainTitle')}
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            {t('hero.subtitle')}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {t('hero.version')}
          </p>

          {/* Features List */}
          <div className="max-w-3xl mx-auto mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">{t('hero.featuresTitle')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="p-3 bg-card border border-border rounded-lg">
                <span className="font-semibold text-primary">📹</span> {t('modules.video.name')}
              </div>
              <div className="p-3 bg-card border border-border rounded-lg">
                <span className="font-semibold text-primary">🎵</span> {t('modules.audio.name')}
              </div>
              <div className="p-3 bg-card border border-border rounded-lg">
                <span className="font-semibold text-primary">🖼️</span> {t('modules.image.name')}
              </div>
              <div className="p-3 bg-card border border-border rounded-lg">
                <span className="font-semibold text-primary">📄</span> {t('modules.document.name')}
              </div>
              <div className="p-3 bg-card border border-border rounded-lg">
                <span className="font-semibold text-primary">✨</span> {t('modules.gif.name')}
              </div>
              <div className="p-3 bg-card border border-border rounded-lg">
                <span className="font-semibold text-primary">🔧</span> {t('modules.pdf-tools.name')}
              </div>
              <div className="p-3 bg-card border border-border rounded-lg">
                <span className="font-semibold text-primary">📐</span> {t('modules.unit.name')}
              </div>
            </div>
          </div>
          
          {/* Auth Status & Subscription Info */}
          <div className="mt-4 flex flex-col items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {user.email}
                  </span>
                  {isAdmin && (
                    <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-semibold">
                      Admin
                    </span>
                  )}
                  {hasActiveSubscription && !isAdmin && (
                    <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Premium
                    </span>
                  )}
                </div>
                {hasActiveSubscription && expiresAt && !isAdmin && (
                  <p className="text-xs text-muted-foreground">
                    Pretplata ističe: {expiresAt.toLocaleDateString('bs-BA')}
                  </p>
                )}
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Odjavi se
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" onClick={() => navigate("/auth")}>
                <LogIn className="mr-2 h-4 w-4" />
                Admin Prijava
              </Button>
            )}
          </div>
        </div>

        {/* Pricing Section */}
        <PricingSection onSelectPlan={() => setPaymentModalOpen(true)} />
        
        {/* PayPal Payment Modal */}
        <PayPalPaymentModal open={paymentModalOpen} onOpenChange={setPaymentModalOpen} />

        {/* Currency Converter - Free for everyone */}
        <div className="mb-12 px-4">
          <CurrencyConverter />
        </div>

        {/* Module Selector - Show all modules for admin, only unit for others */}
        {/* Module Selector */}
        <ModuleSelector selectedModule={selectedModule} onSelectModule={(module) => {
          if (module === "unit") {
            setSelectedModule(module);
          } else if (showFullFeatures) {
            setSelectedModule(module);
          } else {
            // User needs to pay for premium features
            setPaymentModalOpen(true);
          }
        }} />
        
        {!showFullFeatures && selectedModule !== "unit" && (
          <div className="mb-8 text-center p-6 bg-muted/30 rounded-lg border border-border">
            <Crown className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Premium Funkcija</h3>
            <p className="text-muted-foreground mb-4">
              Za pristup konverzijama fajlova, odaberite jedan od naših paketa.
            </p>
            <Button onClick={() => setPaymentModalOpen(true)}>
              Odaberi Paket
            </Button>
          </div>
        )}

        {/* PDF Tools Module - Only for admin */}
        {showFullFeatures && selectedPDFTool ? (
          <div className="mb-8">
            <PDFToolsInterface
              operation={selectedPDFTool}
              onBack={() => setSelectedPDFTool(null)}
            />
          </div>
        ) : showFullFeatures && selectedModule === "pdf-tools" ? (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6">PDF Alati</h2>
            <PDFToolsSelector onSelectTool={(tool) => setSelectedPDFTool(tool)} />
          </div>
        ) : selectedModule === "unit" || !showFullFeatures ? (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6">{t('unitConverter.title')}</h2>
            <UnitConverter />
          </div>
        ) : null}

        {/* File Upload for Image and PDF Modules - Only for admin */}
        {showFullFeatures && selectedModule !== "unit" && selectedModule !== "pdf-tools" && (
          <>
            <div className="mb-8">
              <FileUpload
                onFilesSelected={handleFilesSelected}
                acceptedFormats={getAcceptedFormats()}
              />
            </div>

            {files.length > 0 && (
              <div className="space-y-4 mb-8">
                <h2 className="text-2xl font-semibold text-foreground">
                  {t('conversion.yourFiles')} ({files.length})
                </h2>
                {files.map((file, index) => (
                  <ConversionCard
                    key={`${file.name}-${index}`}
                    file={file}
                    onConvert={handleConvert}
                    onRemove={() => handleRemove(index)}
                  />
                ))}
              </div>
            )}
          </>
        )}
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
