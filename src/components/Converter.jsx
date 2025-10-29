import React, { useState } from "react";
import axios from "axios";

const Converter = () => {
  const [file, setFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState("pdf");
  const [downloadLink, setDownloadLink] = useState(null);
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    setStatus("⏳ Uploadujem fajl...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await axios.post("/upload", formData);
      const filename = uploadRes.data.filename;

      setStatus("🔁 Konvertujem fajl...");
      const convertRes = await axios.post("/convert", {
        filename,
        targetFormat,
      });

      const converted = convertRes.data.convertedFilename;
      setDownloadLink(`/download/${converted}`);
      setStatus("✅ Konverzija završena.");
    } catch (err) {
      console.error(err);
      setStatus("❌ Greška tokom konverzije.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <h2>🎛️ BH KONVER – Konvertuj fajl</h2>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ marginBottom: "1rem" }}
      />

      <select
        value={targetFormat}
        onChange={(e) => setTargetFormat(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem" }}
      >
        <option value="pdf">PDF</option>
        <option value="jpg">JPG</option>
        <option value="png">PNG</option>
        <option value="mp3">MP3</option>
        <option value="gif">GIF</option>
        <option value="txt">TXT</option>
      </select>

      <button onClick={handleUpload} style={{ padding: "0.5rem 1rem" }}>
        Konvertuj
      </button>

      {status && <p style={{ marginTop: "1rem" }}>{status}</p>}

      {downloadLink && (
        <a href={downloadLink} download style={{ display: "block", marginTop: "1rem" }}>
          ⬇️ Preuzmi konvertovani fajl
        </a>
      )}
    </div>
  );
};

export default Converter;
