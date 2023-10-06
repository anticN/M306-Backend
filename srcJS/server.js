
const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer"); 
const helmet = require('helmet');


const app = express();
const port = 3001;
const xmlDirectory = "./SDAT-Files"; // Pfad zu Ihrem XML-Verzeichnis


//NEU!!!!!!!!!!!!!!!!!!!!!!!
// ...
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fileName = file.originalname;
    const isNumeric = /^[0-9]/.test(fileName); // Check if the file name starts with a number

    if (isNumeric) {
      cb(null, './SDAT-Files'); // Save files that start with a number in the "uploads" directory
    } else {
      const eslDirectory = './ESL-Files';
      if (!fs.existsSync(eslDirectory)) {
        fs.mkdirSync(eslDirectory);
      }
      cb(null, eslDirectory); // Save other files in the "SDAT-Files" directory
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.originalname);
  }
});
// ...



const upload = multer({ storage: storage });

// Einfacher CORS-Middleware, um Cross-Origin-Anfragen zu ermöglichen.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.post('/deleteFiles', (req, res) => {
  const sdatDirectory = './SDAT-Files';
  const eslDirectory = './ESL-Files';

  // Delete files in SDAT-Files directory
  fs.readdir(sdatDirectory, (err, sdatFiles) => {
    if (err) {
      console.error('Error reading SDAT directory:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      sdatFiles.forEach(file => {
        fs.unlink(path.join(sdatDirectory, file), err => {
          if (err) {
            console.error('Error deleting file:', err);
          }
        });
      });
    }
  });

  // Delete files in ESL-Files directory
  fs.readdir(eslDirectory, (err, eslFiles) => {
    if (err) {
      console.error('Error reading ESL directory:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      eslFiles.forEach(file => {
        fs.unlink(path.join(eslDirectory, file), err => {
          if (err) {
            console.error('Error deleting file:', err);
          }
        });
      });

      res.json({ message: 'Files deleted successfully!' });
    }
  });
});

//NEU!!!!!!!!!!
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    fontSrc: ["'self'", 'localhost:3000'], // Add 'localhost:3000' as the source for fonts
    // Add other directives as needed
  },
}));

// NEU!!!!!!!!!!!!!!!!!!!
app.post('/upload', upload.array('files'), (req, res) => {
  const files = req.files;
  // Hier kannst du die hochgeladenen Dateien weiterverarbeiten
  console.log('Received Files:', files); 
  res.json({ message: 'Files uploaded successfully!' });
});

app.listen(port, () => {
  console.log(`Server läuft unter http://localhost:${port}`);
});