import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();
const PORT = 3001;
const corsOptions = {
  origin: 'http://localhost:5173', // Frontend's origin
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
// Get directory name
const __dirname = path.dirname(__filename);
// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure uploads directory exists
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    // Set upload directory
    cb(null, uploadDir);
  },
  // Set unique filename with original file extension
  filename: (req, file, cb) => {
    //Milliseconds since January 1, 1970
    const uniqueName = 'Img_' + Date.now();
cb(null, uniqueName + path.extname(file.originalname));
  }
});
// Initialize multer with the defined storage
const upload = multer({ storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    console.log('File Mime type: ' + file.mimetype);
    const filetypes = /jpeg|jpg|png/; 
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type as well
    //This does not work - gets from client which is not reliable. 
    //TODO: Implement "file-type" package or something like it to get a more secure result..
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    else {
      cb(new Error( 'Only .jpeg, .jpg, and .png files are allowed!'));
    }
  }          
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/*** Endpoint to handle single image uploads ***/
app.post('/upload', (req, res) => {
  // Use upload.single('file') or upload.array('files', 5)
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Multer Error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: `Error: ${err.message}` });
    }
    const imgUrl = `/uploads/${req.file.filename}`;
    console.log('File uploaded: ' + imgUrl);
    res.status(200).json({
      imageUrl: imgUrl
    });
  });
});

/*** Endpoint to handle multiple image uploads ***/
app.post('/upload/multiple', (req, res) => {
  // Use upload.single('file') or upload.array('files', 5)
  upload.array('images', 2)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Multer Error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: `Error: ${err.message}` });
    }
    const imgUrls = req.files.map(file => `/uploads/${file.filename}`);
    console.log('Files uploaded: ' + imgUrls.join(', '));
    res.status(200).json({
      imageUrls: imgUrls
    }); 
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});     