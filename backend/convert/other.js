// other.js – Mock konverzije za jedinice i vrijeme

/**
 * Pretvara vrijednost između osnovnih mjernih jedinica
 * @param {number} value - Ulazna vrijednost
 * @param {string} from - Izvorna jedinica (npr. "km", "m", "cm")
 * @param {string} to - Ciljna jedinica (npr. "m", "cm", "mm")
 * @returns {number} - Konvertovana vrijednost
 */
function convertUnit(value, from, to) {
  const factors = {
    km: 1000,
    m: 1,
    cm: 0.01,
    mm: 0.001,
  };

  if (!factors[from] || !factors[to]) {
    throw new Error("Nepoznata jedinica.");
  }

  const inMeters = value * factors[from];
  return inMeters / factors[to];
}

/**
 * Pretvara vrijeme između sekundi, minuta, sati
 * @param {number} value - Vrijednost vremena
 * @param {string} from - Izvorna jedinica (s, min, h)
 * @param {string} to - Ciljna jedinica (s, min, h)
 * @returns {number} - Konvertovano vrijeme
 */
function convertTime(value, from, to) {
  const seconds = {
    s: 1,
    min: 60,
    h: 3600,
  };

  if (!seconds[from] || !seconds[to]) {
    throw new Error("Nepoznata vremenska jedinica.");
  }

  const inSeconds = value * seconds[from];
  return inSeconds / seconds[to];
}

module.exports = {
  convertUnit,
  convertTime,
};
