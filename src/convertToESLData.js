const convertToESLData = (XML) => {
  const elementSell = XML.querySelector('ValueRow[obis="1-1:1.8.1"]')
  const elementBuy = XML.querySelector('ValueRow[obis="1-1:2.8.1"]')
  const date = XML.querySelector('TimePeriod');
  
  if (!elementSell || !elementBuy) {
    return null;
  }
  const valueSell = elementSell.getAttribute('value');
  const valueBuy = elementBuy.getAttribute('value');
  const endDate = date.getAttribute('end');

  // Extrahiere den Wert des 'value'-Attributs
  return {
      timestamp: endDate,
      valueSell: valueSell,
      valueBuy: valueBuy
    }
}

module.exports = convertToESLData;