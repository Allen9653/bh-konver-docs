// audio.js – Konverzija audio fajlova (MP3, OGG, WAV, MP4 to MP3)

const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

/**
 * Konvertuje audio fajl u željeni format koristeći FFmpeg
 * @param {string} inputPath - Putanja do ulaznog audio fajla
 * @param {string} outputFormat - Željeni izlazni format (npr. mp3, ogg, wav)
 * @param {string} outputDir - Folder gdje se snima konvertovani fajl
 * @param {function} callback - Funkcija koja se poziva nakon konverzije
 */
function convertAudio(inputPath, outputFormat, outputDir, callback) {
  const outputFile = path.join(
    outputDir,
    path.basename(inputPath).replace(path.extname(inputPath), `.${outputFormat}`)
  );

  ffmpeg(inputPath)
    .toFormat(outputFormat)
    .on("end", () => callback(null, outputFile))
    .on("error", (err) => callback(err, null))
    .save(outputFile);
}

module.exports = convertAudio;
