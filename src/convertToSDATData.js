const convertToESLData = (XML) => {
  const type = XML.querySelector("rsm\\:DocumentID").textContent.slice(-3);
  const startDateTime = XML.querySelector("rsm\\:StartDateTime").textContent;
  const observations = XML.querySelectorAll("rsm\\:Observation");
  if (!observations) return null;

  return Array.from(observations).map((o) => {
    const sequence = o.querySelector("rsm\\:Sequence").textContent;
    const volume = o.querySelector("rsm\\:Volume").textContent;
    const dateTime = new Date(startDateTime);
    dateTime.setHours(dateTime.getHours() + 1);
    dateTime.setMinutes(dateTime.getMinutes() + (parseInt(sequence) - 1) * 15);

    if (type == "742") {
      return {
        timestamp: dateTime,
        valueEinspesung: volume,
      };
    } else if (type == "735") {
      return {
        timestamp: dateTime,
        valueBezug: volume,
      };
    } else {
      return null;
    }
  });
};

module.exports = convertToESLData;
