import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ConversionCard } from "@/components/ConversionCard";
import { convertFile } from "@/utils/pdfConverter";
import logo from "@/assets/bh-konver-logo.png";

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="BH Konver Logo" className="max-w-md w-full h-auto" />
          </div>
          <p className="text-lg text-muted-foreground">
            Brza i sigurna konverzija dokumenata
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            PDF ↔ JPEG/PNG | Word/PowerPoint/Excel → PDF/JPEG/PNG | Sigurna obrada
          </p>
        </div>

        <div className="mb-8">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            acceptedFormats={["pdf", "jpeg", "jpg", "png", "docx", "doc", "pptx", "xlsx", "xls"]}
          />
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
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
      </div>
    </div>
  );
};

export default Index;
