describe("Integration: full form submission flow", () => {
  beforeEach(() => {
    // Build the real DOM your app expects
    document.body.innerHTML = `
      <main id="equipment-tracker">
        <form id="equipment-form">
          <input id="name" />
          <input id="site" />
          <input id="rate" />
          <input id="start-date" />
          <button type="submit">Add</button>
        </form>

        <ul id="active-list"></ul>
        <ul id="archived-list"></ul>

        <span id="total-active"></span>
        <span id="total-archived"></span>
      </main>
    `;

    // Stable "today"
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-10T12:00:00.000Z"));

    // Clean module + clean storage
    jest.resetModules();
    localStorage.clear();

    // Spy on storage writes (integration should verify save happens)
    jest.spyOn(Storage.prototype, "setItem");
    jest.spyOn(Storage.prototype, "getItem");
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("submitting the form adds an item, saves it, resets the form, sets default date, and re-renders UI + totals", () => {
    // Import AFTER DOM exists so init() can wire events
    const app = require("../assets/scripts/app");

    // Fill the form
    document.getElementById("name").value = "Drill";
    document.getElementById("site").value = "Site A";
    document.getElementById("rate").value = "50";
    document.getElementById("start-date").value = "2026-03-05";

    // Submit (this should trigger the real submit handler attached in init())
    const form = document.getElementById("equipment-form");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    // 1) State updated
    const list = app.__getEquipmentList();
    expect(list.length).toBe(1);
    expect(list[0]).toEqual(
      expect.objectContaining({
        name: "Drill",
        site: "Site A",
        rate: 50,
        startDate: "2026-03-05",
        isArchived: false,
        archivedDate: null,
      })
    );

    // 2) Saved to localStorage
    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
    const [key, value] = localStorage.setItem.mock.calls[0];
    expect(key).toBe("equipmentTracker_v1");
    expect(JSON.parse(value)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Drill",
          site: "Site A",
          rate: 50,
          startDate: "2026-03-05",
          isArchived: false,
          archivedDate: null,
        }),
      ])
    );

    // 3) Form reset + default date set back to today
    expect(document.getElementById("name").value).toBe("");
    expect(document.getElementById("site").value).toBe("");
    expect(document.getElementById("rate").value).toBe("");
    expect(document.getElementById("start-date").value).toBe("2026-03-10");

    // 4) UI rendered: Site heading + item shown in active list
    const activeList = document.getElementById("active-list");
    expect(activeList.innerHTML).toContain("<h3>Site A</h3>");
    expect(activeList.innerHTML).toContain("<strong>Drill</strong>");
    expect(activeList.innerHTML).toContain("£50/day since 2026-03-05");

    // 5) Totals updated (calendar-day logic)
    // Frozen today: 2026-03-10, start: 2026-03-05 => 5 days, 50/day => 250
    expect(document.getElementById("total-active").textContent).toBe("250.00");
    expect(document.getElementById("total-archived").textContent).toBe("0.00");
  });
});