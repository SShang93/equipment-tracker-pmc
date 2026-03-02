describe("restoreEquipment", () => {
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

    app.deps.saveToStorage = jest.fn();
    app.deps.render = jest.fn();
  });

  test("restores archived item and clears archivedDate", () => {
    const list = [
      { id: "a1", isArchived: true, archivedDate: "2026-03-01" },
      { id: "b2", isArchived: false, archivedDate: null },
    ];

    app.__setEquipmentList(list);

    app.restoreEquipment("a1");

    const updated = app.__getEquipmentList();

    expect(updated[0].isArchived).toBe(false);
    expect(updated[0].archivedDate).toBeNull();

    expect(app.deps.saveToStorage).toHaveBeenCalledWith(updated);
    expect(app.deps.render).toHaveBeenCalled();
  });

  test("does nothing if id not found", () => {
    const list = [
      { id: "a1", isArchived: true, archivedDate: "2026-03-01" },
    ];

    app.__setEquipmentList(list);

    app.restoreEquipment("nope");

    expect(app.__getEquipmentList()).toEqual(list);
    expect(app.deps.saveToStorage).not.toHaveBeenCalled();
    expect(app.deps.render).not.toHaveBeenCalled();
  });
});