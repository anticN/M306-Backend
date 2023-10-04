const express = require("express");
const fs = require("fs");
const path = require("path");

const convertToData = require("./convertToData");
const parseRawXml = require("./parseRawXml");
const parseESL = require("./parseESL");
const convertToESLData = require("./convertToESLData");
const { dir } = require("console");

const app = express();
const port = 3001;
const xmlDirectory = "./SDAT-Files"; // Pfad zu Ihrem XML-Verzeichnis

let currentDirLenght = 0;

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
  fs.readdir(xmlDirectory, (err, files) => {
    if (err) {
      res
        .status(500)
        .send({ error: "Serverfehler beim Lesen des Verzeichnisses" });
      return;
    }

    const xmlFiles = files.filter((file) => file.endsWith(".xml"));

    let combinedData = [];

    // Wir nutzen Promises, um alle Dateien asynchron zu lesen und zu verarbeiten

    let cache = {};
    // TODO check if folder size chacnged
    currentDirLenght = countFilesInDirectory(xmlDirectory);

    let cacheDirLength = 0;

    const filePath = "./datenbank/SkaufSdatLength.json";

    const fileContent = fs.readFileSync(filePath, "utf8");

    const fileNumber = JSON.parse(fileContent);
    console.log("got api request", currentDirLenght, fileNumber);

    if (currentDirLenght === fileNumber) {
      //
      console.log("ist gleich");
      const contentContent = fs.readFileSync(
        "./datenbank/kaufSdatData.json",
        "utf8"
      );

      combinedData = JSON.parse(contentContent);
      // console.log(combinedData)
      res.json(combinedData);
    } else {
      const promises = xmlFiles.map((file) => {
        return new Promise((resolve, reject) => {
          const filePath = path.join(xmlDirectory, file);
          fs.readFile(filePath, "utf8", (err, rawXmlContent) => {
            if (err) {
              reject(err);
              return;
            }
            // heart of the code
            const XML = parseRawXml(rawXmlContent);
            const data = convertToData(XML);
            // TODO if data is empty, then do not append it to combinedData
            if (data.length > 1) {
              combinedData = [...combinedData, ...data]; // append data to combinedData

              console.log("loading..." + file);
              // TODO save data to cache
              cache = combinedData;
              cacheDirLength = currentDirLenght;
              const cacheJson = JSON.stringify(cache);
              const cacheDirLengthJson = JSON.stringify(cacheDirLength);

              fs.writeFileSync("./datenbank/kaufSdatData.json", cacheJson);
              fs.writeFileSync(
                "./datenbank/SkaufSdatLength.json",
                cacheDirLengthJson
              );
              resolve();
            } else {
              resolve();
            }
          });
        });
      });
      console.log("ist nicht gleich");

      // Nachdem alle Dateien verarbeitet wurden, senden wir die kombinierten Daten
      Promise.all(promises)
        .then(() => console.log(combinedData))
        .then(() => console.log("done"))
        .then(() => res.json(combinedData))
        .catch((error) =>
          res
            .status(500)
            .send("Fehler bei der Verarbeitung der XML-Dateien", error)
        );
    }
  });
});

// app.get("/additiveIncome", (req, res) => {
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");

//   fs.readdir(xmlDirectory, (err, files) => {
//     if (err) {
//       res.status(500).send("Serverfehler beim Lesen des Verzeichnisses");
//       return;
//     }

//     const xmlFiles = files.filter((file) => file.endsWith(".xml"));

//     let combinedData = [];

//     // Wir nutzen Promises, um alle Dateien asynchron zu lesen und zu verarbeiten
//     const promises = xmlFiles.map((file) => {
//       return new Promise((resolve, reject) => {
//         const filePath = path.join(xmlDirectory, file);
//         fs.readFile(filePath, "utf8", (err, rawXmlContent) => {
//           if (err) {
//             reject(err);
//             return;
//           }
//           let amountOfData = 0;
//           // heart of the code
//           const XML = parseRawXml(rawXmlContent);
//           const dataSet = convertToData(XML);
//           console.log(dataSet)
//           combinedData.push(...dataSet);
//           console.log("loading...");
//           dataSet.forEach((data) => {
//             amountOfData++;
//           });
//           if (amountOfData > 200) {
//             res.write(`data: ${JSON.stringify(combinedData)}\n\n`);
//             combinedData = [];
//             amountOfData = 0;
//           }
//           resolve();
//         });
//       });
//     });

//     // Nachdem alle Dateien verarbeitet wurden
//     Promise.all(promises)
//       .then(() => {
//         res.write(`data: ${JSON.stringify(combinedData)}\n\n`);
//         console.log("finished");
//         res.end();
//       })
//       .catch((error) =>
//         res
//           .status(500)
//           .send("Fehler bei der Verarbeitung der XML-Dateien", error)
//       );
//   });
// });

app.get("/additiveIncome", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  fs.readdir(xmlDirectory, (err, files) => {
    if (err) {
      res.status(500).send("Serverfehler beim Lesen des Verzeichnisses");
      return;
    }

    const xmlFiles = files.filter((file) => file.endsWith(".xml"));

    let combinedData = [];

    // Wir nutzen Promises, um alle Dateien asynchron zu lesen und zu verarbeiten
    const promises = xmlFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const filePath = path.join(xmlDirectory, file);
        fs.readFile(filePath, "utf8", (err, rawXmlContent) => {
          if (err) {
            reject(err);
            return;
          }
          // heart of the code
          const XML = parseRawXml(rawXmlContent);
          const dataSet = convertToData(XML);
          combinedData.push(...dataSet);
          console.log("loading...");
          resolve();
        });
      });
    });

    // Nachdem alle Dateien verarbeitet wurden
    Promise.all(promises)
      .then(() => {
        let index = 0;
        const interval = setInterval(() => {
          if (index < combinedData.length) {
            const dataToSend = combinedData.slice(index, index + 2); // sendet jeweils 2 Datenobjekte
            dataToSend.forEach((data) => {
              res.write(`data: ${JSON.stringify(data)}\n\n`); // sendet Daten
            });
            index += 2;
          } else {
            console.log("finished");
            clearInterval(interval);
            res.end();
          }
        }, 500); // Sendet alle zwei Sekunden Daten
      })
      .catch((error) =>
        res
          .status(500)
          .send("Fehler bei der Verarbeitung der XML-Dateien", error)
      );
  });
});

app.get("/esl",  (req, res) => {
  console.log("retrieved API request");
  let data = []; // data to send

  // loop through the ESL-Files directory  
  const directoryPath = './ESL-Files';
  const files =  fs.readdirSync(directoryPath);
  for (const file of files) {
    // read each file
    const filePath = path.join(directoryPath, file);
    // parse the file to xml
    const esl = parseESL(filePath);
    // convert to data
    const object = convertToESLData(esl);
    if (object != null) data.push(object);
  }
  // return data
  console.log('=== finished ===')
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server läuft unter http://localhost:${port}`);
});
