import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePlus, Palette, X, ZoomIn, Move, RotateCw, Layers } from "lucide-react";

export type BackgroundMode = "none" | "color" | "image";
export type VisualEffect = "none" | "zoom-in" | "zoom-out" | "pan-left" | "pan-right" | "rotate";
export type TransitionEffect = "none" | "fade" | "wipe" | "dissolve" | "pixelize";

export interface VideoEffectOptions {
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  backgroundImage: File | null;
  duration: number; // seconds, 0 = full audio length
  visualEffect: VisualEffect;
  transition: TransitionEffect;
  effectDuration: number; // seconds for effect
  effectScale: number; // 1.0 - 3.0
}

const COLOR_PRESETS = [
  { name: "Black", value: "#000000" },
  { name: "Azure", value: "#007FFF" },
  { name: "Navy", value: "#000080" },
  { name: "Maroon", value: "#800000" },
  { name: "Forest", value: "#228B22" },
  { name: "Purple", value: "#6A0DAD" },
  { name: "Charcoal", value: "#36454F" },
  { name: "Crimson", value: "#DC143C" },
];

export const defaultVideoEffects: VideoEffectOptions = {
  backgroundMode: "none",
  backgroundColor: "#000000",
  backgroundImage: null,
  duration: 0,
  visualEffect: "none",
  transition: "fade",
  effectDuration: 2,
  effectScale: 1.2,
};

interface VideoEffectsPanelProps {
  options: VideoEffectOptions;
  onChange: (options: VideoEffectOptions) => void;
}

export const VideoEffectsPanel = ({ options, onChange }: VideoEffectsPanelProps) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const update = (partial: Partial<VideoEffectOptions>) =>
    onChange({ ...options, ...partial });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      update({ backgroundMode: "image", backgroundImage: file });
    }
  };

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    update({ backgroundMode: "none", backgroundImage: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-5 p-4 rounded-lg border border-border bg-muted/30">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Video Effects
      </p>

      {/* Background Mode */}
      <div className="space-y-2">
        <Label className="text-xs">Background</Label>
        <div className="grid grid-cols-3 gap-2">
          {(["none", "color", "image"] as BackgroundMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => update({ backgroundMode: mode })}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border text-xs font-medium transition-all ${
                options.backgroundMode === mode
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground hover:border-foreground/30"
              }`}
            >
              {mode === "none" && "Black"}
              {mode === "color" && <><Palette className="w-3 h-3" /> Color</>}
              {mode === "image" && <><ImagePlus className="w-3 h-3" /> Image</>}
            </button>
          ))}
        </div>
      </div>

      {/* Color Picker */}
      {options.backgroundMode === "color" && (
        <div className="space-y-2">
          <Label className="text-xs">Select Color</Label>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c.value}
                onClick={() => update({ backgroundColor: c.value })}
                className={`w-8 h-8 rounded-md border-2 transition-all ${
                  options.backgroundColor === c.value
                    ? "border-foreground scale-110 shadow-md"
                    : "border-border hover:border-foreground/40"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Image Upload */}
      {options.backgroundMode === "image" && (
        <div className="space-y-2">
          <Label className="text-xs">Background Image</Label>
          {previewUrl ? (
            <div className="relative w-full h-24 rounded-md overflow-hidden border border-border">
              <img src={previewUrl} alt="bg" className="w-full h-full object-cover" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 bg-background/80"
                onClick={clearImage}
                aria-label="Ukloni pozadinsku sliku"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-20 border-2 border-dashed border-border rounded-md flex items-center justify-center gap-2 text-xs text-muted-foreground hover:border-foreground/30 transition-colors"
            >
              <ImagePlus className="w-4 h-4" /> Upload background image
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      )}

      {/* Duration */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Duration</Label>
          <span className="text-xs text-muted-foreground">
            {options.duration === 0 ? "Full audio" : `${options.duration}s`}
          </span>
        </div>
        <Slider
          value={[options.duration]}
          onValueChange={([v]) => update({ duration: v })}
          min={0}
          max={60}
          step={1}
        />
        <p className="text-[10px] text-muted-foreground">0 = use full audio duration</p>
      </div>

      {/* Visual Effect */}
      <div className="space-y-2">
        <Label className="text-xs flex items-center gap-1.5">
          <ZoomIn className="w-3 h-3" /> Visual Effect
        </Label>
        <Select
          value={options.visualEffect}
          onValueChange={(v) => update({ visualEffect: v as VisualEffect })}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="zoom-in">Zoom In (Center)</SelectItem>
            <SelectItem value="zoom-out">Zoom Out</SelectItem>
            <SelectItem value="pan-left">Pan Left</SelectItem>
            <SelectItem value="pan-right">Pan Right</SelectItem>
            <SelectItem value="rotate">Rotate 90°</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transition */}
      <div className="space-y-2">
        <Label className="text-xs flex items-center gap-1.5">
          <Layers className="w-3 h-3" /> Transition
        </Label>
        <Select
          value={options.transition}
          onValueChange={(v) => update({ transition: v as TransitionEffect })}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="fade">Fade In/Out</SelectItem>
            <SelectItem value="wipe">Wipe</SelectItem>
            <SelectItem value="dissolve">Dissolve</SelectItem>
            <SelectItem value="pixelize">Pixelize</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Effect Duration & Scale - only if effect selected */}
      {(options.visualEffect !== "none" || options.transition !== "none") && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Effect Duration</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[options.effectDuration]}
                onValueChange={([v]) => update({ effectDuration: v })}
                min={0.5}
                max={10}
                step={0.5}
              />
              <span className="text-xs text-muted-foreground w-8">{options.effectDuration}s</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Scale</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[options.effectScale]}
                onValueChange={([v]) => update({ effectScale: v })}
                min={1.0}
                max={3.0}
                step={0.1}
              />
              <span className="text-xs text-muted-foreground w-8">{options.effectScale.toFixed(1)}x</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
