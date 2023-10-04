// Funktion zur Entfernung von Redundanzen und Sortierung nach dem Zeitstempel
const removeRedundant = (data) => {
  const uniqueObjects = {};
  const result = [];

  for (const obj of data) {
    const timestamp = obj.timestamp;
    if (!uniqueObjects[timestamp]) {
      uniqueObjects[timestamp] = true;
      result.push(obj);
    }
  }

  result.sort((a, b) => {
    return new Date(a.timestamp) - new Date(b.timestamp);
  });

  return result;
}

module.exports = removeRedundant;