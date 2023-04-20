const express = require("express");

const app = express();

const { readJsonInput, getDayOfWeek, addDaystoDate } = require("./utils");
const { DAYS_OF_WEEK } = require("./constants");

//map to check the count, how many times a day is checked. anyday will be checked at most 2 times
let map;

//variable to keep the count of how many times a day is checked
let recursiveCount;

//variable to keep the count of how many slots are checked
let checkCount;

const findAvailabilityOfDay = (time, dayOfWeekIndex, availabilityTimings) => {
  //increment the count of day checked
  map[dayOfWeekIndex]++;
  if (map[dayOfWeekIndex] > 2) {
    return null;
  }

  const availabilities = availabilityTimings[DAYS_OF_WEEK[dayOfWeekIndex]];
  const [checkHour, checkMinute] = time.split(":").map(Number);
  const checkTimeMinutes = checkHour * 60 + checkMinute;

  let nextAvailableTime = null;
  let cur = 0;

  // loop through all the slots in a day
  for (const availableTime of availabilities) {
    const [availableStartHour, availableStartMinute] = availableTime.start
      .split(":")
      .map(Number);
    const [availableEndHour, availableEndMinute] = availableTime.end
      .split(":")
      .map(Number);
    const availableStartTimeMinutes =
      availableStartHour * 60 + availableStartMinute;
    const availableEndTimeMinutes = availableEndHour * 60 + availableEndMinute;

    if (
      checkTimeMinutes >= availableStartTimeMinutes &&
      checkTimeMinutes < availableEndTimeMinutes
    ) {
      // Doctor is available at the given time
      return time;
    } else if (checkTimeMinutes < availableStartTimeMinutes) {
      checkCount++;

      // to handle the case when slots are not sorted
      if (nextAvailableTime === null) {
        nextAvailableTime = availableTime.start;
        cur = availableStartTimeMinutes;
      } else {
        if (cur > availableStartTimeMinutes) {
          nextAvailableTime = availableTime.start;
          cur = availableEndTimeMinutes;
        }
      }
    }
  }

  //call recursive function when no slots found on the given day
  if (nextAvailableTime === null) {
    recursiveCount++;
    dayOfWeekIndex++;
    dayOfWeekIndex = dayOfWeekIndex % 7;
    nextAvailableTime = findAvailabilityOfDay(
      "00:00",
      dayOfWeekIndex,
      availabilityTimings
    );
  }
  return nextAvailableTime;
};

app.get("/health", (req, res) => res.send("Server is running"));

app.get("/doctor-availability", async (req, res) => {
  let input = readJsonInput();
  map = new Array(7).fill(0);
  recursiveCount = 0;
  checkCount = 0;

  const date = req.query.date;
  const time = req.query.time;
  const nextTime = findAvailabilityOfDay(
    time,
    getDayOfWeek(date),
    input.availabilityTimings
  );
  const nextDate = addDaystoDate(date, recursiveCount);

  if (checkCount == 0 && recursiveCount == 0) {
    res.send({ isAvailable: true });
  } else {
    res.send({
      isAvailable: false,
      nextAvailableSlot: {
        date: nextDate,
        time: nextTime,
      },
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Server is running on PORT..." + PORT));