const fs = require("fs");
const path = require("path");
const parseFile = require("./parseFile");
const convertToESLData = require("./convertToESLData");

// read the ESL-Files directory  
const getAllESL = () => {
  let data = []; // data to send

  const directoryPath = './ESL-Files';
  const files = fs.readdirSync(directoryPath);

  // loop through the ESL-Files directory  
  for (const file of files) {
    // read each file
    const filePath = path.join(directoryPath, file);
    // parse the file to xml
    const esl = parseFile(filePath);
    // convert to data
    const object = convertToESLData(esl);

    // console.log(object)
    if (object != null) {
      data = [...data, ...object];
    }
  }
  return data;
}

module.exports = getAllESL;