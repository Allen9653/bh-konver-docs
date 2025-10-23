// pdf.js – Konverzija PDF fajla u drugi format (npr. DOCX, JPG, EPUB)

const { exec } = require("child_process");
const path = require("path");

/**
 * Konvertuje PDF fajl u željeni format koristeći LibreOffice CLI
 * @param {string} inputPath - Putanja do ulaznog PDF fajla
 * @param {string} outputFormat - Željeni izlazni format (npr. docx, jpg, epub)
 * @param {string} outputDir - Putanja do foldera gdje se snima konvertovani fajl
 * @param {function} callback - Funkcija koja se poziva nakon konverzije
 */
function convertPDF(inputPath, outputFormat, outputDir, callback) {
  const command = `libreoffice --headless --convert-to ${outputFormat} "${inputPath}" --outdir "${outputDir}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Greška pri konverziji PDF-a:", error);
      callback(error, null);
    } else {
      const outputFile = path.join(outputDir, path.basename(inputPath).replace(".pdf", `.${outputFormat}`));
      callback(null, outputFile);
    }
  });
}

module.exports = convertPDF;
