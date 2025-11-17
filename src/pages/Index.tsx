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
import { convertFile } from "@/utils/pdfConverter";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
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
  const { user, isAdmin, loading, signOut } = useAdminAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to see all features
  useEffect(() => {
    if (!loading && user && !isAdmin) {
      // Regular users only see unit converter (which is free)
      setSelectedModule("unit");
    }
  }, [user, isAdmin, loading]);

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

  const showFullFeatures = isAdmin;

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
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>{t('adSpace.benefit1')}</p>
                <p>{t('adSpace.benefit2')}</p>
                <p>{t('adSpace.benefit3')}</p>
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
          
          {/* Auth Status */}
          <div className="mt-4 flex items-center justify-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user.email} {isAdmin && <span className="text-primary font-semibold">(Admin)</span>}
                </span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('footer.support')}
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" onClick={() => navigate("/auth")}>
                <LogIn className="mr-2 h-4 w-4" />
                Admin {t('footer.support')}
              </Button>
            )}
          </div>
        </div>

        {/* Pricing Section */}
        <PricingSection onSelectPlan={(tier) => {
          console.log('Selected plan:', tier);
          // TODO: Implement payment integration
        }} />

        {/* Module Selector - Show all modules for admin, only unit for others */}
        {showFullFeatures ? (
          <ModuleSelector selectedModule={selectedModule} onSelectModule={setSelectedModule} />
        ) : (
          <div className="mb-8">
            <p className="text-center text-muted-foreground mb-4">
              {t('unitConverter.title')} je besplatan za sve korisnike. Za pristup drugim funkcijama, prijavite se kao administrator.
            </p>
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
