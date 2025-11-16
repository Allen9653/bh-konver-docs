import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileUpload } from "@/components/FileUpload";
import { ConversionCard } from "@/components/ConversionCard";
import { ModuleSelector } from "@/components/ModuleSelector";
import { UnitConverter } from "@/components/UnitConverter";
import { Footer } from "@/components/Footer";
import { PDFToolsSelector } from "@/components/PDFToolsSelector";
import { PDFToolsInterface } from "@/components/PDFToolsInterface";
import { convertFile } from "@/utils/pdfConverter";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import logo from "@/assets/bh-konver-logo.png";
import type { ConversionModule } from "@/types/formats";
import type { PDFOperation } from "@/types/pdfOperations";

const Index = () => {
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="BH Konver Logo" className="max-w-md w-full h-auto" />
          </div>
          <p className="text-lg text-muted-foreground mb-2">
            Sveobuhvatni sistem za konverziju fajlova
          </p>
          <p className="text-sm text-muted-foreground">
            Video • Audio • Slike • Dokumenti • GIF • Jedinice
          </p>
          
          {/* Auth Status */}
          <div className="mt-4 flex items-center justify-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user.email} {isAdmin && <span className="text-primary font-semibold">(Admin)</span>}
                </span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Odjava
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" onClick={() => navigate("/auth")}>
                <LogIn className="mr-2 h-4 w-4" />
                Admin prijava
              </Button>
            )}
          </div>
        </div>

        {/* Module Selector - Show all modules for admin, only unit for others */}
        {showFullFeatures ? (
          <ModuleSelector selectedModule={selectedModule} onSelectModule={setSelectedModule} />
        ) : (
          <div className="mb-8">
            <p className="text-center text-muted-foreground mb-4">
              Konvertor jedinica je besplatan za sve korisnike. Za pristup drugim funkcijama, prijavite se kao administrator.
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
            <h2 className="text-2xl font-semibold text-foreground mb-6">Konvertor Jedinica</h2>
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
                  Vaši fajlovi ({files.length})
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
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
