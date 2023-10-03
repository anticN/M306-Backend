const convertToData = (XML) => {
  let data = [];
  const observations = XML.querySelectorAll("rsm\\:Volume");
  const startDateTime = XML.querySelector("rsm\\:StartDateTime").textContent;

  observations.forEach((observation, index) => {
    const sequence = observation.parentElement.querySelector("rsm\\:Sequence").textContent;
    const volume = observation.textContent;
    const dateTime = new Date(startDateTime);
    dateTime.setMinutes(dateTime.getMinutes() + (parseInt(sequence) - 1) * 15);

    const formattedDateTime = dateTime.toISOString().replace("Z", "");
    data.push({ timestamp: formattedDateTime, value: volume });
  });
  console.log(data);
  return data;
};

module.exports = convertToData; 