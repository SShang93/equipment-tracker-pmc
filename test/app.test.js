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
    // Minimal DOM the function depends on
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

    // Spy/mocks for dependencies called by addEquipmentFromForm
    jest.spyOn(app, "createEquipment").mockImplementation((name, site, rate, startDate) => ({
      id: "test-id",
      name,
      site,
      rate,
      startDate,
      isArchived: false,
      archivedDate: null,
    }));

    jest.spyOn(app, "saveToStorage").mockImplementation(() => {});
    jest.spyOn(app, "setDefaultStartDate").mockImplementation(() => {});
    jest.spyOn(app, "render").mockImplementation(() => {});

    // Ensure form.reset() exists + is spyable (jsdom supports it, but we make it explicit)
    const form = document.getElementById("equipment-form");
    jest.spyOn(form, "reset").mockImplementation(() => {
      // mimic reset behaviour for inputs
      document.getElementById("name").value = "";
      document.getElementById("site").value = "";
      document.getElementById("rate").value = "";
      // start-date typically resets too, but your app sets it again via setDefaultStartDate()
      document.getElementById("start-date").value = "";
    });

    // Start with clean list (if your module keeps equipmentList internal, this test
    // focuses on calls + effects rather than reading the list directly)
    // If you export equipmentList later, we can assert push length too.
  });

  test("returns early if any required field is missing", () => {
    document.getElementById("name").value = "";
    document.getElementById("site").value = "Site A";
    document.getElementById("rate").value = "50";
    document.getElementById("start-date").value = "2026-03-01";

    app.addEquipmentFromForm();

    expect(app.createEquipment).not.toHaveBeenCalled();
    expect(app.saveToStorage).not.toHaveBeenCalled();
    expect(app.render).not.toHaveBeenCalled();
    expect(app.setDefaultStartDate).not.toHaveBeenCalled();
  });

  test("returns early if rate is not a valid number (0 or NaN)", () => {
    document.getElementById("name").value = "Drill";
    document.getElementById("site").value = "Site A";
    document.getElementById("rate").value = "0"; // falsy -> should return
    document.getElementById("start-date").value = "2026-03-01";

    app.addEquipmentFromForm();

    expect(app.createEquipment).not.toHaveBeenCalled();
    expect(app.saveToStorage).not.toHaveBeenCalled();
    expect(app.render).not.toHaveBeenCalled();
  });

  test("creates equipment, saves to storage, resets form, sets default date, and re-renders", () => {
    document.getElementById("name").value = "  Drill  ";
    document.getElementById("site").value = "  Site A  ";
    document.getElementById("rate").value = "50";
    document.getElementById("start-date").value = "2026-03-01";

    app.addEquipmentFromForm();

    expect(app.createEquipment).toHaveBeenCalledTimes(1);
    expect(app.createEquipment).toHaveBeenCalledWith("Drill", "Site A", 50, "2026-03-01");

    // saveToStorage called with an array containing the created item
    expect(app.saveToStorage).toHaveBeenCalledTimes(1);
    const savedArg = app.saveToStorage.mock.calls[0][0];
    expect(Array.isArray(savedArg)).toBe(true);
    expect(savedArg).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "test-id",
          name: "Drill",
          site: "Site A",
          rate: 50,
          startDate: "2026-03-01",
        }),
      ])
    );

    expect(document.getElementById("equipment-form").reset).toHaveBeenCalledTimes(1);
    expect(app.setDefaultStartDate).toHaveBeenCalledTimes(1);
    expect(app.render).toHaveBeenCalledTimes(1);
  });
});