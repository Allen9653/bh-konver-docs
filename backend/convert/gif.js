// gif.js – Konverzija između GIF i video formata (MP4, WEBM, APNG)

const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

/**
 * Konvertuje GIF ili video fajl u drugi format koristeći FFmpeg
 * @param {string} inputPath - Putanja do ulaznog fajla (GIF, MP4, WEBM, itd.)
 * @param {string} outputFormat - Željeni izlazni format (gif, mp4, webm, apng)
 * @param {string} outputDir - Folder gdje se snima konvertovani fajl
 * @param {function} callback - Funkcija koja se poziva nakon konverzije
 */
function convertGIF(inputPath, outputFormat, outputDir, callback) {
  const outputFile = path.join(
    outputDir,
    path.basename(inputPath).replace(path.extname(inputPath), `.${outputFormat}`)
  );

  ffmpeg(inputPath)
    .output(outputFile)
    .format(outputFormat)
    .on("end", () => callback(null, outputFile))
    .on("error", (err) => callback(err, null))
    .run();
}

module.exports = convertGIF;
