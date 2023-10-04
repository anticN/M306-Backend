const convertToESLData = (XML) => {
  const elementSell = XML.querySelector('ValueRow[obis="1-1:1.8.1"]')
  const elementBuy = XML.querySelector('ValueRow[obis="1-1:2.8.1"]')
  if (!elementSell || !elementBuy) {
      return null;
  }
  const valueSell = elementSell.getAttribute('value');
  const valueBuy = elementBuy.getAttribute('value');
  // Suche nach dem ValueRow-Element mit obis="1-1:1.8.1"
  // const valueRowElement = document.querySelector('ValueRow[obis="1-1:1.8.1"]');

  // Extrahiere den Wert des 'value'-Attributs
  return {
      timestamp: '2019-03-13T23:00:00.000',
      valueSell: valueSell,
      valueBuy: valueBuy
    }
}

module.exports = convertToESLData;