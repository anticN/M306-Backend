const { JSDOM } = require("jsdom");
const fs = require("fs");

const parseFile = (filePath) => {
  try {
    const xmlContent = fs.readFileSync(filePath, "utf8");
    return new JSDOM(xmlContent, { contentType: "text/xml" }).window.document; // parse XML
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error);
    throw error; // or return some default/fallback value or handle the error accordingly
  }
};

module.exports = parseFile;
