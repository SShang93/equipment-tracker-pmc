describe("Storage functions", () => {
  let app;

  beforeEach(() => {
    // Minimal DOM so import doesn't crash
    document.body.innerHTML = `
      <form id="equipment-form"></form>
      <input id="name" />
      <input id="site" />
      <input id="rate" />
      <input id="start-date" />
      <ul id="active-list"></ul>
      <ul id="archived-list"></ul>
      <span id="total-active"></span>
      <span id="total-archived"></span>
    `;

    jest.resetModules();
    app = require("../assets/scripts/app");

    // Mock localStorage methods
    jest.spyOn(Storage.prototype, "setItem");
    jest.spyOn(Storage.prototype, "getItem");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("saveToStorage stores JSON string under STORAGE_KEY", () => {
    const data = [{ id: "a1" }];

    app.saveToStorage(data);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "equipmentTracker_v1",
      JSON.stringify(data)
    );
  });

  test("loadFromStorage returns parsed data if present", () => {
    const storedData = [{ id: "b2" }];

    localStorage.getItem.mockReturnValue(JSON.stringify(storedData));

    const result = app.loadFromStorage();

    expect(localStorage.getItem).toHaveBeenCalledWith("equipmentTracker_v1");
    expect(result).toEqual(storedData);
  });

  test("loadFromStorage returns empty array if nothing stored", () => {
    localStorage.getItem.mockReturnValue(null);

    const result = app.loadFromStorage();

    expect(result).toEqual([]);
  });
});