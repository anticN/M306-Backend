const convertToESLData = (XML) => {
  const startDateTime = XML.querySelector("rsm\\:StartDateTime").textContent;
  const observations = XML.querySelectorAll("rsm\\:Observation");

  return Array.from(observations).map((o) => {
    const sequence = o.querySelector("rsm\\:Sequence").textContent;
    const volume = o.querySelector("rsm\\:Volume").textContent;
    const dateTime = new Date(startDateTime);
    dateTime.setMinutes(dateTime.getMinutes() + (parseInt(sequence) - 1) * 15);

    return {
      timestamp: dateTime,
      value: volume,
    };
  });
};

module.exports = convertToESLData;
