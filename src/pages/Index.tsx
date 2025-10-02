import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ConversionCard } from "@/components/ConversionCard";
import { convertFile } from "@/utils/pdfConverter";
import { FileText } from "lucide-react";

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleConvert = async (file: File, targetFormat: string) => {
    return await convertFile(file, targetFormat);
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">BH Konver</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Brza i sigurna konverzija dokumenata
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            PDF ↔ JPEG | Lokalna obrada | Bez slanja na server
          </p>
        </div>

        <div className="mb-8">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            acceptedFormats={["pdf", "jpeg", "jpg"]}
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
