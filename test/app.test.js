const { loadAppModuleFresh } = require("assets/scripts/app.js");

function buildMinimalDom() {
  document.body.innerHTML = `
    <form id="equipment-form"></form>

    <input id="name" />
    <input id="site" />
    <input id="rate" />
    <input id="start-date" />

    <ul id="active-list"></ul>
    <ul id="archived-list"></ul>

    <span id="total-active">0</span>
    <span id="total-archived">0</span>
  `;
}


function loadAppModuleFresh() {
  jest.resetModules(); 
  buildMinimalDom();
  localStorage.clear();
  return require("../js/app.js");
}

describe("Equipment Tracker core functions", () => {
  beforeEach(() => {
    jest.useRealTimers();
  });

  test("createEquipment creates the correct object shape", () => {
    const { createEquipment } = loadAppModuleFresh();

    const item = createEquipment("Genie Lift", "Site A", 120, "2026-02-01");

    expect(item).toEqual(
      expect.objectContaining({
        name: "Genie Lift",
        site: "Site A",
        rate: 120,
        startDate: "2026-02-01",
        isArchived: false,
        archivedDate: null
      })
    );

    // id should exist and be a string
    expect(typeof item.id).toBe("string");
    expect(item.id.length).toBeGreaterThan(5);
  });

  test("calcHireCost returns rate * days (minimum 1 day)", () => {
    const { calcHireCost } = loadAppModuleFresh();

    // Freeze time so the test is deterministic
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-02-22T12:00:00Z")); // your current date context

    // Same day -> minimum 1 day
    expect(calcHireCost(100, "2026-02-22")).toBe(100);

    // 2 days difference (22nd vs 20th) -> should charge 2 days
    expect(calcHireCost(50, "2026-02-20")).toBe(100);

    // 1 day difference (22nd vs 21st) -> 1 day (ceil)
    expect(calcHireCost(75, "2026-02-21")).toBe(75);
  });

  test("calcTotal sums hire costs across a list", () => {
    const { calcTotal } = loadAppModuleFresh();

    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-02-22T12:00:00Z"));

    const list = [
      { rate: 100, startDate: "2026-02-22" }, // 1 day -> 100
      { rate: 50, startDate: "2026-02-20" }   // 2 days -> 100
    ];

    expect(calcTotal(list)).toBe(200);
  });

  test("saveToStorage + loadFromStorage round-trip data correctly", () => {
    const { saveToStorage, loadFromStorage } = loadAppModuleFresh();

    const data = [
      {
        id: "abc123",
        name: "Wacker Plate",
        site: "Site B",
        rate: 40,
        startDate: "2026-02-10",
        isArchived: false,
        archivedDate: null
      }
    ];

    saveToStorage(data);
    const loaded = loadFromStorage();

    expect(loaded).toEqual(data);
  });

  test("loadFromStorage returns [] if nothing stored", () => {
    const { loadFromStorage } = loadAppModuleFresh();
    expect(loadFromStorage()).toEqual([]);
  });
});