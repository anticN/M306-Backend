const express = require("express");
const fs = require("fs");
const path = require("path");

const convertToData = require("./convertToData");
const parseRawXml = require("./parseRawXml");
const removeRedundant = require("./removeRedundant");
const getAllSDAT = require("./getAllSDAT");
const getAllESL = require("./getAllESL");
const sort = require("./sort");
const { dir } = require("console");
const mergeByTimestamp = require("./mergeByTimestamp");
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

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  ); 
  next();
});



function countFilesInDirectory(directoryPath) {
  try {
    const files = fs.readdirSync(directoryPath);
    return files.length;
  } catch (error) {
    console.error("Fehler beim Lesen des Verzeichnisses:", error);
    return null;
  }
}

// Einfacher CORS-Middleware, um Cross-Origin-Anfragen zu ermöglichen.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Endpoint zum Abrufen und Verarbeiten der XML-Dateien
app.get("/xml", (req, res) => {
  const currentDirLenght = countFilesInDirectory(xmlDirectory);

  let allSDAT = [];
  let cache = {};
  let cacheDirLength = 0;

  const filePath = "./datenbank/SkaufSdatLength.json";
  const fileContent = fs.readFileSync(filePath, "utf8");
  const fileNumber = JSON.parse(fileContent);

  if (currentDirLenght === fileNumber) {
    console.log("=== cached ===");
    const contentContent = fs.readFileSync(
      "./datenbank/kaufSdatData.json",
      "utf8"
    );

    allSDAT = JSON.parse(contentContent);
    console.log("=== cache sent ===");
    res.json(allSDAT);
  } else {
    console.log("=== processing data... ===");
    allSDAT = getAllSDAT();
    console.log("=== finished processing ===");

    console.log("=== cleaning data... ===");
    allSDAT = mergeByTimestamp(allSDAT);
    allSDAT = sort(allSDAT);
    console.log("=== finished cleaning ===");

    console.log("=== caching... ===");
    cache = allSDAT;
    cacheDirLength = currentDirLenght;
    const cacheJson = JSON.stringify(cache);
    const cacheDirLengthJson = JSON.stringify(cacheDirLength);

    fs.writeFileSync("./datenbank/kaufSdatData.json", cacheJson);
    fs.writeFileSync("./datenbank/SkaufSdatLength.json", cacheDirLengthJson);
    console.log("=== cached ===");

    res.json(allSDAT);
  }
});

//NEU!!!!!!!!!
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



app.get("/esl", (req, res) => {
  console.log("=== processing data... ===");
  let allESL = getAllESL();
  console.log("=== finished processing ===");

  console.log("=== cleaning data... ===");
  allESL = mergeByTimestamp(allESL);
  allESL = sort(allESL);
  console.log("=== finished cleaning ===");

  res.json(allESL);
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
