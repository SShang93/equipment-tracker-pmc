const { setDefaultStartDate } = require("../assets/scripts/app");

describe("setDefaultStartDate", () => {

  beforeEach(() => {
    document.body.innerHTML = `
      <input id="start-date" value="">
    `;
    global.startDateInput = document.getElementById("start-date");

    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-01T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("sets today's date when input is empty", () => {
    setDefaultStartDate();
    expect(startDateInput.value).toBe("2026-03-01");
  });

  test("does not overwrite existing value", () => {
    startDateInput.value = "2026-02-15";
    setDefaultStartDate();
    expect(startDateInput.value).toBe("2026-02-15");
  });

});