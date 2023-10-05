const convertToESLData = (XML) => {
  let data = [];
  const elementBezug = XML.querySelectorAll('ValueRow[obis="1-1:1.8.1"]')
  const elementEinspesung = XML.querySelector('ValueRow[obis="1-1:2.8.1"]')
  const date = XML.querySelectorAll('TimePeriod');

  if (!elementEinspesung || !elementBezug) return null;

  date.forEach(element => {
    const currentDate = new Date(element.getAttribute('end'))
    currentDate.setHours(currentDate.getHours() + 1);

    if (!element.querySelector('ValueRow[obis="1-1:1.8.1"]') || !element.querySelector('ValueRow[obis="1-1:2.8.1"]')) return null;
    data.push({
      timestamp: currentDate,
      valueBezug: parseFloat(element.querySelector('ValueRow[obis="1-1:1.8.1"]').getAttribute('value')) + parseFloat(element.querySelector('ValueRow[obis="1-1:1.8.2"]').getAttribute('value')),
      valueEinspesung: parseFloat(element.querySelector('ValueRow[obis="1-1:2.8.1"]').getAttribute('value') + parseFloat(element.querySelector('ValueRow[obis="1-1:2.8.2"]').getAttribute('value')))
    })
  });

  return data;
}

module.exports = convertToESLData;