import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const MODULES = {
  documents: {
    label: "Dokumenti",
    formats: ["pdf", "docx", "doc", "odt", "rtf", "txt", "html", "md"],
  },
  spreadsheets: {
    label: "Tabele",
    formats: ["xlsx", "xls", "ods", "csv", "tsv"],
  },
  presentations: {
    label: "Prezentacije",
    formats: ["pptx", "ppt", "odp", "pdf"],
  },
  images: {
    label: "Slike",
    formats: ["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff", "svg", "ico", "heic"],
  },
  audio: {
    label: "Audio",
    formats: ["mp3", "wav", "ogg", "m4a", "aac", "flac"],
  },
  video: {
    label: "Video",
    formats: ["mp4", "webm", "mov", "avi", "mkv", "gif"],
  },
};

export default defineTool({
  name: "list_supported_formats",
  title: "List supported conversion formats",
  description:
    "Returns the categories of files BH KONVER can convert (documents, spreadsheets, presentations, images, audio, video) and the file extensions each category supports.",
  inputSchema: {
    module: z
      .enum([
        "documents",
        "spreadsheets",
        "presentations",
        "images",
        "audio",
        "video",
      ])
      .optional()
      .describe("Optional. Restrict result to a single module."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ module }) => {
    const payload = module ? { [module]: MODULES[module] } : MODULES;
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: { modules: payload },
    };
  },
});
