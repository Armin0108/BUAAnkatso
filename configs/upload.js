const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer les dossiers si inexistants
const folders = [
  path.join(__dirname, '../uploads/intervenants'),
  path.join(__dirname, '../uploads/documents')
];
folders.forEach(folder => {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
});

// Filtre pour images
const fileFilterImage = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) cb(null, true);
  else cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, webp)'));
};

// Filtre pour PDFs
const fileFilterPDF = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Seuls les fichiers PDF sont autorisés'));
};

// Middleware combiné pour PDF + image
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      if (file.fieldname === 'pdfFile') cb(null, path.join(__dirname, '../uploads/documents'));
      else if (file.fieldname === 'imageFile') cb(null, path.join(__dirname, '../uploads/intervenants'));
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + path.extname(file.originalname);
      if (file.fieldname === 'pdfFile') cb(null, 'document-' + uniqueSuffix);
      else if (file.fieldname === 'imageFile') cb(null, 'intervenant-' + uniqueSuffix);
    }
  }),
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'pdfFile') fileFilterPDF(req, file, cb);
    else if (file.fieldname === 'imageFile') fileFilterImage(req, file, cb);
    else cb(new Error('Champ de fichier non autorisé'));
  },
}).fields([
  { name: 'pdfFile', maxCount: 1 },
  { name: 'imageFile', maxCount: 1 }
]);

// Middlewares séparés (optionnel)
const uploadImage = multer({ 
  storage: multer.diskStorage({
    destination: path.join(__dirname, '../uploads/intervenants'),
    filename: (req, file, cb) => cb(null, 'intervenant-' + Date.now() + path.extname(file.originalname))
  }),
  fileFilter: fileFilterImage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadPDF = multer({ 
  storage: multer.diskStorage({
    destination: path.join(__dirname, '../uploads/documents'),
    filename: (req, file, cb) => cb(null, 'document-' + Date.now() + path.extname(file.originalname))
  }),
  fileFilter: fileFilterPDF,
  limits: { fileSize: 20 * 1024 * 1024 }
});

module.exports = { upload, uploadImage, uploadPDF };
