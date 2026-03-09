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
const upload = multer({ storage });

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/*** Endpoint to handle single image uploads ***/
app.post('/upload', upload.single('image'), (req, res) => {
  // Check if file is uploaded
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
    console.log('No file uploaded.');
  }
  // Respond with the file path
  res.send(JSON.stringify({ imageUrl: `/uploads/${req.file.filename}` }));
  console.log('File uploaded successfully:', req.file.filename);
});

/*** Endpoint to handle multiple image uploads ***/
app.post('/upload/multiple', upload.array('images', 2), (req, res) => {
  // Check if files are uploaded
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files uploaded.');
    console.log('No files uploaded.');
  }
  // Respond with the file paths
  const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
  res.json({ imageUrls });
  console.log('Files uploaded successfully:', req.files.map(file => file.filename));
});     
 
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});     