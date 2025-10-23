import React, { useState } from "react";
import axios from "axios";

const Convert = () => {
  const [file, setFile] = useState(null);
  const [type, setType] = useState("pdf");
  const [format, setFormat] = useState("");
  const [downloadLink, setDownloadLink] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleConvert = async () => {
    if (!file || !format) return alert("Odaberite fajl i format.");

    const formData = new FormData();
    formData.append("file", file);

    // Upload fajla
    const uploadRes = await axios.post("/upload", formData);
    const inputPath = uploadRes.data.path;

    // Konverzija
    const res = await axios.post(`/convert/${type}`, {
      inputPath,
      outputFormat: format,
    });

    setDownloadLink(res.data.file);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🎯 BH KONVER – Konvertuj fajl</h2>

      <input type="file" onChange={handleFileChange} />
      <br /><br />

      <label>Tip konverzije:</label>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="pdf">PDF</option>
        <option value="audio">Audio</option>
        <option value="image">Image</option>
        <option value="gif">GIF/Video</option>
      </select>
      <br /><br />

      <label>Izlazni format:</label>
      <input
        type="text"
        placeholder="npr. docx, mp3, png, gif"
        value={format}
        onChange={(e) => setFormat(e.target.value)}
      />
      <br /><br />

      <button onClick={handleConvert}>Konvertuj</button>

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
