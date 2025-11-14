import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Image, RotateCw, Trash2, Plus, Minimize, Scissors, Merge } from "lucide-react";
import { PDF_OPERATIONS, PDFOperation } from "@/types/pdfOperations";

interface PDFToolsSelectorProps {
  onSelectTool: (tool: PDFOperation) => void;
}

const TOOL_ICONS: Record<PDFOperation, any> = {
  "remove-watermark": Trash2,
  "add-watermark": Plus,
  "rotate": RotateCw,
  "compress-pdf": Minimize,
  "compress-jpeg": Minimize,
  "split-pdf": Scissors,
  "merge-pdf": Merge
};

export const PDFToolsSelector = ({ onSelectTool }: PDFToolsSelectorProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Object.entries(PDF_OPERATIONS).map(([key, config]) => {
        const Icon = TOOL_ICONS[key as PDFOperation];
        return (
          <Card
            key={key}
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => onSelectTool(key as PDFOperation)}
          >
            <CardHeader className="p-4">
              <Icon className="h-8 w-8 mb-2 text-primary" />
              <CardTitle className="text-base">{config.displayName}</CardTitle>
              <CardDescription className="text-xs">{config.description}</CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
};
