/**
 * Path Validation Middleware
 * Prevents path traversal attacks by validating inputPath parameters
 */

const path = require('path');

const ALLOWED_DIRS = ['uploads', 'converted'];

const validateInputPath = (req, res, next) => {
  const { inputPath } = req.body;
  
  if (!inputPath) {
    return res.status(400).json({ 
      error: 'inputPath je obavezan.' 
    });
  }

  // Normalize and resolve the path
  const normalizedPath = path.normalize(inputPath);
  const resolvedPath = path.resolve(inputPath);
  
  // Check for path traversal attempts
  if (normalizedPath.includes('..') || inputPath.includes('..')) {
    console.warn(`[SECURITY] Path traversal attempt detected: ${inputPath}`);
    return res.status(403).json({ 
      error: 'Pristup odbijen. Neispravan putanja.' 
    });
  }

  // Ensure path is within allowed directories
  const isAllowed = ALLOWED_DIRS.some(dir => {
    const allowedDir = path.resolve(__dirname, '../../', dir);
    return resolvedPath.startsWith(allowedDir);
  });

  if (!isAllowed) {
    console.warn(`[SECURITY] Unauthorized path access attempt: ${inputPath}`);
    return res.status(403).json({ 
      error: 'Pristup odbijen. Nedozvoljena lokacija.' 
    });
  }

  // Validate file extension (only allow safe extensions)
  const ext = path.extname(inputPath).toLowerCase();
  const allowedExtensions = [
    '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff',
    '.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a',
    '.mp4', '.avi', '.mov', '.mkv', '.webm'
  ];

  if (ext && !allowedExtensions.includes(ext)) {
    return res.status(400).json({ 
      error: 'Nepodržani format fajla.' 
    });
  }

  req.validatedPath = resolvedPath;
  next();
};

const validateFilename = (req, res, next) => {
  const { filename } = req.params;
  
  if (!filename) {
    return res.status(400).json({ 
      error: 'Ime fajla je obavezno.' 
    });
  }

  // Check for path traversal in filename
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    console.warn(`[SECURITY] Path traversal in filename: ${filename}`);
    return res.status(403).json({ 
      error: 'Pristup odbijen. Neispravno ime fajla.' 
    });
  }

  // Validate filename format (timestamp-originalname pattern)
  const filenamePattern = /^\d+-[a-zA-Z0-9_\-\.]+$/;
  if (!filenamePattern.test(filename)) {
    // Also allow simple alphanumeric names with extensions
    const simplePattern = /^[a-zA-Z0-9_\-\.]+$/;
    if (!simplePattern.test(filename)) {
      return res.status(400).json({ 
        error: 'Neispravno ime fajla.' 
      });
    }
  }

  next();
};

module.exports = { validateInputPath, validateFilename };
