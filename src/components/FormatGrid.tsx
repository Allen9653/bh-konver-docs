import { FileText, Image, Video, Music, FileArchive, Clapperboard } from "lucide-react";
import type { OutputFormat } from "@/types/formats";
import { formatDisplayName } from "@/types/formats";

interface FormatGridProps {
  formats: OutputFormat[];
  selected: string;
  onSelect: (format: string) => void;
}

const formatIcon = (fmt: string) => {
  if (["mp4", "mov", "avi", "webm"].includes(fmt)) return Video;
  if (["mp3", "ogg", "wav"].includes(fmt)) return Music;
  if (["png", "jpg", "jpeg", "webp", "svg"].includes(fmt)) return Image;
  if (["gif", "apng"].includes(fmt)) return Clapperboard;
  if (["pdf", "docx", "epub", "txt"].includes(fmt)) return FileText;
  return FileArchive;
};

export const FormatGrid = ({ formats, selected, onSelect }: FormatGridProps) => {
  if (formats.length === 0) return null;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {formats.map((fmt) => {
        const Icon = formatIcon(fmt);
        const isSelected = selected === fmt;
        return (
          <button
            key={fmt}
            onClick={() => onSelect(fmt)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all text-xs font-medium ${
              isSelected
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-foreground hover:border-foreground/30"
            }`}
          >
            <Icon className="w-4 h-4" />
            {formatDisplayName[fmt] || fmt.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
};
