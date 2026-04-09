/**
 * BH KONVER - Audio-to-Video Conversion Engine (FFmpeg WASM)
 * 
 * Converts audio files into video with configurable backgrounds and effects.
 * Uses FFmpeg WASM for client-side processing with backend fallback.
 */

import { ClientConversionUnsupportedError, type ConversionProgress } from "./clientConverter";
import type { VideoEffectOptions } from "@/components/VideoEffectsPanel";

type ProgressCallback = (progress: ConversionProgress) => void;

// Check if audio-to-video is feasible client-side
export const canConvertAudioToVideo = (): boolean => {
  return typeof SharedArrayBuffer !== "undefined";
};

// Build FFmpeg filter_complex string from effect options
function buildVideoFilter(opts: VideoEffectOptions, width: number, height: number): string {
  const filters: string[] = [];

  // Visual effect
  switch (opts.visualEffect) {
    case "zoom-in":
      filters.push(
        `zoompan=z='min(${opts.effectScale},pzoom+0.001)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${Math.round(opts.effectDuration * 25)}:s=${width}x${height}:fps=25`
      );
      break;
    case "zoom-out":
      filters.push(
        `zoompan=z='if(eq(on,1),${opts.effectScale},max(1.0,pzoom-0.001))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${Math.round(opts.effectDuration * 25)}:s=${width}x${height}:fps=25`
      );
      break;
    case "pan-left":
      filters.push(
        `zoompan=z='1.0':x='iw-iw/zoom-(on/${Math.round(opts.effectDuration * 25)})*(iw-iw/zoom)':y='0':d=${Math.round(opts.effectDuration * 25)}:s=${width}x${height}:fps=25`
      );
      break;
    case "pan-right":
      filters.push(
        `zoompan=z='1.0':x='(on/${Math.round(opts.effectDuration * 25)})*(iw-iw/zoom)':y='0':d=${Math.round(opts.effectDuration * 25)}:s=${width}x${height}:fps=25`
      );
      break;
    case "rotate":
      filters.push(`rotate=PI/2:ow=rotw(PI/2):oh=roth(PI/2)`);
      break;
  }

  // Transition effects (fade in/out)
  switch (opts.transition) {
    case "fade": {
      const fd = Math.round(opts.effectDuration * 25);
      filters.push(`fade=t=in:st=0:d=${opts.effectDuration}`);
      filters.push(`fade=t=out:st=${Math.max(0, (opts.duration || 10) - opts.effectDuration)}:d=${opts.effectDuration}`);
      break;
    }
    case "dissolve":
      filters.push(`fade=t=in:st=0:d=${opts.effectDuration}:alpha=1`);
      break;
    case "pixelize":
      // Simulate pixelization via scale down then up
      filters.push(`scale=iw/10:ih/10,scale=${width}:${height}:flags=neighbor`);
      break;
    case "wipe":
      // Wipe simulated via crop expand
      filters.push(`fade=t=in:st=0:d=${opts.effectDuration}`);
      break;
  }

  return filters.length > 0 ? filters.join(",") : "";
}

export async function convertAudioToVideo(
  audioFile: File,
  effectOptions: VideoEffectOptions,
  onProgress?: ProgressCallback
): Promise<Blob> {
  if (typeof SharedArrayBuffer === "undefined") {
    throw new ClientConversionUnsupportedError(
      "SharedArrayBuffer nije dostupan. Audio→Video konverzija će biti obavljena na serveru."
    );
  }

  onProgress?.({ stage: "Učitavanje video procesora (WASM)...", percent: 5 });

  let FFmpeg: any;
  let toBlobURL: any;
  let fetchFile: any;
  try {
    ({ FFmpeg } = await import("@ffmpeg/ffmpeg"));
    ({ toBlobURL, fetchFile } = await import("@ffmpeg/util"));
  } catch (e) {
    throw new ClientConversionUnsupportedError(
      "FFmpeg WASM biblioteka se ne može učitati. Prelazim na serversku konverziju."
    );
  }

  const ffmpeg = new FFmpeg();

  ffmpeg.on("progress", ({ progress }: { progress: number }) => {
    const pct = Math.min(Math.round(progress * 70) + 20, 90);
    onProgress?.({ stage: "Kreiranje videa...", percent: pct });
  });

  const CORE_BASE = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  try {
    await ffmpeg.load({
      coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
    });
  } catch (e) {
    throw new ClientConversionUnsupportedError(
      "FFmpeg WASM engine se nije mogao inicijalizirati. Prelazim na serversku konverziju."
    );
  }

  onProgress?.({ stage: "Priprema fajlova...", percent: 15 });

  // Write audio file
  const audioExt = audioFile.name.split(".").pop()?.toLowerCase() || "mp3";
  const audioInput = `input.${audioExt}`;
  await ffmpeg.writeFile(audioInput, await fetchFile(audioFile));

  const width = 1280;
  const height = 720;
  const duration = effectOptions.duration || 30; // default 30s if 0

  // Prepare background
  let bgInput: string;
  if (effectOptions.backgroundMode === "image" && effectOptions.backgroundImage) {
    onProgress?.({ stage: "Priprema pozadine...", percent: 18 });
    const imgExt = effectOptions.backgroundImage.name.split(".").pop()?.toLowerCase() || "png";
    bgInput = `bg.${imgExt}`;
    await ffmpeg.writeFile(bgInput, await fetchFile(effectOptions.backgroundImage));
  } else {
    // Generate solid color frame using lavfi
    bgInput = "";
  }

  onProgress?.({ stage: "Kreiranje videa...", percent: 20 });

  const args: string[] = [];

  if (effectOptions.backgroundMode === "image" && bgInput) {
    // Image background: loop image, add audio
    args.push("-loop", "1", "-i", bgInput);
    args.push("-i", audioInput);
    args.push("-c:v", "libx264", "-tune", "stillimage");
    args.push("-c:a", "aac", "-b:a", "192k");
    args.push("-pix_fmt", "yuv420p");

    const vf: string[] = [`scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`];
    const effectFilter = buildVideoFilter(effectOptions, width, height);
    if (effectFilter) vf.push(effectFilter);
    args.push("-vf", vf.join(","));

    args.push("-t", String(duration));
    args.push("-shortest");
  } else {
    // Solid color background via color source
    const color = effectOptions.backgroundMode === "color"
      ? effectOptions.backgroundColor.replace("#", "0x")
      : "0x000000";

    args.push("-f", "lavfi", "-i", `color=c=${color}:s=${width}x${height}:d=${duration}:r=25`);
    args.push("-i", audioInput);
    args.push("-c:v", "libx264");
    args.push("-c:a", "aac", "-b:a", "192k");
    args.push("-pix_fmt", "yuv420p");

    const effectFilter = buildVideoFilter(effectOptions, width, height);
    if (effectFilter) args.push("-vf", effectFilter);

    args.push("-t", String(duration));
    args.push("-shortest");
  }

  args.push("-movflags", "+faststart");
  args.push("output.mp4");

  await ffmpeg.exec(args);

  const data = await ffmpeg.readFile("output.mp4");
  onProgress?.({ stage: "Završeno!", percent: 100 });

  return new Blob([data as BlobPart], { type: "video/mp4" });
}
