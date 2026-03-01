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

// test/addEquipmentFromForm.test.js
// L5 standard: arrange DOM, mock dependencies, assert behaviour (including side effects)

describe("addEquipmentFromForm", () => {
  let app;

  beforeEach(() => {
    document.body.innerHTML = `
      <form id="equipment-form">
        <input id="name" />
        <input id="site" />
        <input id="rate" />
        <input id="start-date" />
      </form>

      <ul id="active-list"></ul>
      <ul id="archived-list"></ul>
      <span id="total-active"></span>
      <span id="total-archived"></span>
    `;

    jest.resetModules();
    app = require("../assets/scripts/app");

    // Mock deps (this is the key)
    app.deps.createEquipment = jest.fn((name, site, rate, startDate) => ({
      id: "test-id",
      name,
      site,
      rate,
      startDate,
      isArchived: false,
      archivedDate: null
    }));

    app.deps.saveToStorage = jest.fn();
    app.deps.setDefaultStartDate = jest.fn();
    app.deps.render = jest.fn();

    // Spy on form.reset
    jest.spyOn(document.getElementById("equipment-form"), "reset").mockImplementation(() => {});
  });

  test("returns early when required fields are missing", () => {
    document.getElementById("name").value = "";
    document.getElementById("site").value = "Site A";
    document.getElementById("rate").value = "50";
    document.getElementById("start-date").value = "2026-03-01";

    app.addEquipmentFromForm();

    expect(app.deps.createEquipment).not.toHaveBeenCalled();
    expect(app.deps.saveToStorage).not.toHaveBeenCalled();
    expect(document.getElementById("equipment-form").reset).not.toHaveBeenCalled();
    expect(app.deps.setDefaultStartDate).not.toHaveBeenCalled();
    expect(app.deps.render).not.toHaveBeenCalled();
  });

  test("returns early when rate is 0 or invalid", () => {
    document.getElementById("name").value = "Drill";
    document.getElementById("site").value = "Site A";
    document.getElementById("rate").value = "0";
    document.getElementById("start-date").value = "2026-03-01";

    app.addEquipmentFromForm();

    expect(app.deps.createEquipment).not.toHaveBeenCalled();
    expect(app.deps.saveToStorage).not.toHaveBeenCalled();
    expect(app.deps.render).not.toHaveBeenCalled();
  });

  test("creates item, saves, resets form, sets default date, and renders", () => {
    document.getElementById("name").value = "  Drill  ";
    document.getElementById("site").value = "  Site A  ";
    document.getElementById("rate").value = "50";
    document.getElementById("start-date").value = "2026-03-01";

    app.addEquipmentFromForm();

    expect(app.deps.createEquipment).toHaveBeenCalledWith("Drill", "Site A", 50, "2026-03-01");

    expect(app.deps.saveToStorage).toHaveBeenCalledTimes(1);
    const savedList = app.deps.saveToStorage.mock.calls[0][0];

    expect(Array.isArray(savedList)).toBe(true);
    expect(savedList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "test-id", name: "Drill", site: "Site A", rate: 50, startDate: "2026-03-01" })
      ])
    );

    expect(document.getElementById("equipment-form").reset).toHaveBeenCalledTimes(1);
    expect(app.deps.setDefaultStartDate).toHaveBeenCalledTimes(1);
    expect(app.deps.render).toHaveBeenCalledTimes(1);
  });
});