import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ConversionCard } from "@/components/ConversionCard";
import { PaymentModal } from "@/components/PaymentModal";
import { ModuleSelector } from "@/components/ModuleSelector";
import { UnitConverter } from "@/components/UnitConverter";
import { PricingSection } from "@/components/PricingSection";
import { convertFile } from "@/utils/pdfConverter";
import logo from "@/assets/bh-konver-logo.png";
import type { ConversionModule } from "@/types/formats";

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ConversionModule>("image");

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
      case "image":
        return ["webp", "heic", "png", "jpg", "jpeg"];
      case "pdf":
        return ["pdf", "jpg", "jpeg", "docx"];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="BH Konver Logo" className="max-w-md w-full h-auto" />
          </div>
          <p className="text-lg text-muted-foreground mb-2">
            Modularni sistem za konverziju dokumenata i jedinica
          </p>
          <p className="text-sm text-muted-foreground">
            MVP verzija • 3 osnovna modula • Brzo i pouzdano
          </p>
        </div>

        {/* Module Selector */}
        <ModuleSelector selectedModule={selectedModule} onSelectModule={setSelectedModule} />

        {/* Unit Converter Module */}
        {selectedModule === "unit" && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Konverter jedinica</h2>
            <UnitConverter />
          </div>
        )}

        {/* File Upload for Image and PDF Modules */}
        {selectedModule !== "unit" && (
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

        {/* Pricing Section */}
        <PricingSection onSelectPlan={() => setPaymentModalOpen(true)} />

        <PaymentModal open={paymentModalOpen} onOpenChange={setPaymentModalOpen} />
      </div>
    </div>
  );
};

export default Index;
