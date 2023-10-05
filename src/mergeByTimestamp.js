function mergeByTimestamp(arr) {
  const mergedData = {};

  // Loop over each object in the array
  arr.forEach(item => {
      const timestamp = item.timestamp;

      // If the timestamp doesn't exist in mergedData, create a new object with the timestamp
      if (!mergedData[timestamp]) {
          mergedData[timestamp] = {timestamp: timestamp};
      }

      // If the item has a valueEinspesung, add or overwrite it in the mergedData
      if ('valueEinspesung' in item) {
        if (!mergedData[timestamp].valueEinspesung || item.valueEinspesung > mergedData[timestamp].valueEinspesung) {
            mergedData[timestamp].valueEinspesung = item.valueEinspesung;
        }
    }


      // If the item has a valueBezug, add or overwrite it in the mergedData
      if ('valueBezug' in item) {
        if (!mergedData[timestamp].valueBezug || item.valueBezug > mergedData[timestamp].valueBezug) {
            mergedData[timestamp].valueBezug = item.valueBezug;
        }
    }
  });

  // Convert the merged data object back into an array
  return Object.values(mergedData);
}

module.exports = mergeByTimestamp;