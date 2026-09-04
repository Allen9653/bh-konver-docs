import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ConversionProgress } from "@/utils/clientConverter";

type Options = {
  canConvert: boolean;
  onAccessDenied: () => void;
};

export const useConversionEngine = ({ canConvert, onAccessDenied }: Options) => {
  const pollForJobCompletion = useCallback(async (jobId: string, onProgress?: (progress: ConversionProgress) => void): Promise<Blob> => {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      const { data: job, error } = await supabase
        .from("processing_jobs")
        .select("status, progress, result_url, error")
        .eq("id", jobId)
        .single();
      if (error) throw new Error("Error checking conversion status");
      if (typeof job.progress === "number") {
        onProgress?.({ stage: "Konvertovanje na serveru...", percent: Math.min(95, 50 + Math.round(job.progress * 0.45)) });
      }
      if (job.status === "completed" && job.result_url) {
        const response = await fetch(job.result_url);
        if (!response.ok) throw new Error("Link za preuzimanje je istekao. Pokušajte ponovo.");
        return response.blob();
      }
      if (job.status === "failed") throw new Error(job.error || "Konverzija nije uspjela na serveru.");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    throw new Error("Konverzija je istekla. Pokušajte ponovo sa manjim fajlom.");
  }, []);

  return useCallback(async (
    file: File,
    targetFormat: string,
    needsBackend: boolean,
    onProgress?: (progress: ConversionProgress) => void,
  ): Promise<Blob> => {
    if (!canConvert) {
      onAccessDenied();
      throw new Error("Potrebna je aktivna pretplata za ovu konverziju.");
    }

    const [{ canConvertClientSide, convertClientSide }, { convertFile }] = await Promise.all([
      import("@/utils/clientConverter"),
      import("@/utils/pdfConverter"),
    ]);
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (canConvertClientSide(extension, targetFormat)) return convertClientSide(file, targetFormat, onProgress);
    if (!needsBackend) return convertFile(file, targetFormat);

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.access_token) throw new Error("Morate biti prijavljeni za serversku konverziju.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("targetFormat", targetFormat);
    onProgress?.({ stage: "Slanje fajla...", percent: 10 });

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 120000);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/convert-document`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: formData,
        signal: controller.signal,
      });
      if (response.status === 202) {
        const payload = await response.json();
        if (payload.job_id) return pollForJobCompletion(payload.job_id, onProgress);
      }
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Konverzija na serveru nije uspjela.");
      }
      return response.blob();
    } finally {
      window.clearTimeout(timeoutId);
    }
  }, [canConvert, onAccessDenied, pollForJobCompletion]);
};