const fs = require("fs");

//read input from json file
const readJsonInput = () => {
  return JSON.parse(fs.readFileSync("availability.json", "utf8"));
};

const getDayOfWeek = (dateString) => {
  const date = new Date(dateString);
  const dayOfWeekIndex = date.getDay();
  return dayOfWeekIndex;
};

const addDaystoDate = (dateString, days) => {
  let date = new Date(dateString);
  date.setDate(date.getDate() + days);
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

module.exports = {
  readJsonInput,
  getDayOfWeek,
  addDaystoDate
};
