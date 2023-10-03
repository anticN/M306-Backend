const { JSDOM } = require("jsdom");

const parseRawXml = (xmlContent) => {
  return new JSDOM(xmlContent, { contentType: 'text/xml' }).window.document; // parse XML
}

module.exports = parseRawXml;