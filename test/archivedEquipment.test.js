describe("archiveEquipment", () => {
  let app;

  beforeEach(() => {
    // Minimal DOM so importing app.js doesn't crash
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

    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-10T12:00:00.000Z"));

    app.deps.saveToStorage = jest.fn();
    app.deps.render = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("archives item and sets archivedDate", () => {
    const list = [
      { id: "a1", isArchived: false, archivedDate: null },
      { id: "b2", isArchived: false, archivedDate: null },
    ];

    app.__setEquipmentList(list);

    app.archiveEquipment("b2");

    const updated = app.__getEquipmentList();
    expect(updated[1].isArchived).toBe(true);
    expect(updated[1].archivedDate).toBe("2026-03-10");

    expect(app.deps.saveToStorage).toHaveBeenCalledWith(updated);
    expect(app.deps.render).toHaveBeenCalled();
  });

  test("does nothing when id not found", () => {
    const list = [{ id: "a1", isArchived: false, archivedDate: null }];
    app.__setEquipmentList(list);

    app.archiveEquipment("nope");

    expect(app.__getEquipmentList()).toEqual(list);
    expect(app.deps.saveToStorage).not.toHaveBeenCalled();
    expect(app.deps.render).not.toHaveBeenCalled();
  });
});