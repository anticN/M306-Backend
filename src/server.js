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

const app = express();
const port = 3001;
const xmlDirectory = "./SDAT-Files"; // Pfad zu Ihrem XML-Verzeichnis


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

app.listen(port, () => {
  console.log(`Server läuft unter http://localhost:${port}`);
});
