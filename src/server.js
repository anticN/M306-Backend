const express = require('express');
const fs = require('fs');
const path = require('path');

const convertToData = require('./convertToData');
const parseRawXml = require('./parseRawXml');

const app = express();
const port = 3001;
const xmlDirectory = "./SDAT-Files"; // Pfad zu Ihrem XML-Verzeichnis

// Einfacher CORS-Middleware, um Cross-Origin-Anfragen zu ermöglichen.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Endpoint zum Abrufen und Verarbeiten der XML-Dateien
app.get('/xml', (req, res) => {
  fs.readdir(xmlDirectory, (err, files) => {
    if (err) {
      res.status(500).send({error: "Serverfehler beim Lesen des Verzeichnisses"});
      return;
    }

    const xmlFiles = files.filter(file => file.endsWith('.xml'));
    
    let combinedData = [];
    
    // Wir nutzen Promises, um alle Dateien asynchron zu lesen und zu verarbeiten
    const promises = xmlFiles.map(file => {
      return new Promise((resolve, reject) => {
        const filePath = path.join(xmlDirectory, file);
        fs.readFile(filePath, 'utf8', (err, rawXmlContent) => {
          if (err) {
            reject(err);
            return;
          }
          // heart of the code
          const XML = parseRawXml(rawXmlContent);
          const data = convertToData(XML);
          combinedData = [...combinedData, ...data]; // append data to combinedData

          console.log('loading...')
          resolve();
        });
      });
    });

    // Nachdem alle Dateien verarbeitet wurden, senden wir die kombinierten Daten
    Promise.all(promises)
      .then(() => console.log('done'))
      .then(() => res.json(combinedData))
      .catch(error => res.status(500).send('Fehler bei der Verarbeitung der XML-Dateien', error));
  });
});

app.listen(port, () => {
  console.log(`Server läuft unter http://localhost:${port}`);
});