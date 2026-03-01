const { setDefaultStartDate } = require("../assets/scripts/app");

describe("setDefaultStartDate", () => {
  beforeEach(() => {
    // Build the DOM BEFORE importing the module
    document.body.innerHTML = `
      <form id="equipment-form"></form>
      <input id="name" />
      <input id="site" />
      <input id="rate" />
      <input id="start-date" value="" />

      <ul id="active-list"></ul>
      <ul id="archived-list"></ul>

      <span id="total-active"></span>
      <span id="total-archived"></span>
    `;

    jest.resetModules(); // important: forces a fresh import each test
  });

  test("sets today's date when input is empty", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-01T12:00:00.000Z"));

    const { setDefaultStartDate } = require("../assets/scripts/app");

    setDefaultStartDate();

    expect(document.getElementById("start-date").value).toBe("2026-03-01");

    jest.useRealTimers();
  });

  test("does not overwrite existing value", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-01T12:00:00.000Z"));

    document.getElementById("start-date").value = "2026-02-15";

    const { setDefaultStartDate } = require("../assets/scripts/app");

    setDefaultStartDate();

    expect(document.getElementById("start-date").value).toBe("2026-02-15");

    jest.useRealTimers();
  });
});
