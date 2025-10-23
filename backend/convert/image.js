// image.js – Konverzija slika između formata (PNG, JPG, WEBP, HEIC, SVG)

const sharp = require("sharp");
const path = require("path");

/**
 * Konvertuje sliku u željeni format koristeći Sharp
 * @param {string} inputPath - Putanja do ulazne slike
 * @param {string} outputFormat - Željeni izlazni format (npr. png, jpg, webp, svg)
 * @param {string} outputDir - Folder gdje se snima konvertovana slika
 * @param {function} callback - Funkcija koja se poziva nakon konverzije
 */
function convertImage(inputPath, outputFormat, outputDir, callback) {
  const outputFile = path.join(
    outputDir,
    path.basename(inputPath).replace(path.extname(inputPath), `.${outputFormat}`)
  );

  sharp(inputPath)
    .toFormat(outputFormat)
    .toFile(outputFile)
    .then(() => callback(null, outputFile))
    .catch((err) => callback(err, null));
}

module.exports = convertImage;
