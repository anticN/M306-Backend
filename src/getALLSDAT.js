const fs = require("fs");
const path = require("path");
const parseFile = require("./parseFile");
const convertToSDATData = require("./convertToSDATData");


const getALlSDAT = () => {
  let data = []; // data to send

  const directoryPath = './SDAT-Files';
  const files = fs.readdirSync(directoryPath);
  
  
  // loop through the ESL-Files directory  
  for (const file of files) {
  // read each file
  const filePath = path.join(directoryPath, file);
  // parse the file to xml
  const sdat = parseFile(filePath);
  // convert to data
  const object = convertToSDATData(sdat);
  
  // if verkauf / einkauf
  data = [...data, ...object];

  }

  return data;
}

module.exports = getALlSDAT;