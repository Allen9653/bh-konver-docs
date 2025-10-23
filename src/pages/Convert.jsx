import React, { useState } from "react";
import axios from "axios";

const Convert = () => {
  const [file, setFile] = useState(null);
  const [type, setType] = useState("pdf");
  const [format, setFormat] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setDownloadLink("");
  };

  const handleConvert = async () => {
    if (!file || !format) return alert("Odaberite fajl i izlazni format.");

    setLoading(true);

    try {
      // 1. Upload fajla
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await axios.post("/upload", formData);
      const inputPath = uploadRes.data.path;

      // 2. Konverzija
      const convertRes = await axios.post(`/convert/${type}`, {
        inputPath,
        outputFormat: format,
      });

      setDownloadLink(convertRes.data.file);
    } catch (err) {
      alert("Greška pri konverziji.");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h2>🌀 BH KONVER</h2>
      <p>Konvertuj dokumente, audio/video fajlove i slike.</p>

      <input type="file" onChange={handleFileChange} />
      <br /><br />

      <label>Tip konverzije:</label>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="pdf">PDF</option>
        <option value="audio">Audio</option>
        <option value="image">Image</option>
        <option value="gif">GIF/Video</option>
        <option value="other">Unit/Time</option>
      </select>
      <br /><br />

      <label>Izlazni format:</label>
      <input
        type="text"
        placeholder="npr. docx, mp3, png, gif, m"
        value={format}
        onChange={(e) => setFormat(e.target.value)}
      />
      <br /><br />

      <button onClick={handleConvert} disabled={loading}>
        {loading ? "Konvertujem..." : "Konvertuj"}
      </button>

      {downloadLink && (
        <div style={{ marginTop: "2rem" }}>
          <p>✅ Konverzija uspješna!</p>
          <a href={downloadLink} download>
            Preuzmi fajl
          </a>
        </div>
      )}
    </div>
  );
};

export default Convert;
