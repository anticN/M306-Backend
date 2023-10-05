function sort(arr) {
  return arr.sort((a, b) => {
      if (a.timestamp < b.timestamp) return -1;
      if (a.timestamp > b.timestamp) return 1;
      return 0;
  });
}

module.exports = sort;