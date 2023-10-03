// const fs = require("fs");
// const { JSDOM } = require("jsdom");

// const processXML = (xmlFiles) => {
//   // read ./sample.xml
//   const xml = fs.readFileSync('./sample.xml', 'utf8');

//   console.log(xml)
//   const dom = new JSDOM(xml, { contentType: 'text/xml' });
//   const startDateTime = dom.window.document.querySelector('rsm\\:StartDateTime').textContent;
//   console.log(startDateTime);

//   return startDateTime
// };

// module.exports = processXML;
