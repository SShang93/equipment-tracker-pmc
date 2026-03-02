describe("deleteEquipment", () => {
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

  test("removes item with matching id", () => {
    const list = [
      { id: "a1" },
      { id: "b2" },
      { id: "c3" },
    ];

    app.__setEquipmentList(list);

    app.deleteEquipment("b2");

    const updated = app.__getEquipmentList();

    expect(updated).toEqual([
      { id: "a1" },
      { id: "c3" },
    ]);

    expect(app.deps.saveToStorage).toHaveBeenCalledWith(updated);
    expect(app.deps.render).toHaveBeenCalled();
  });

  test("does nothing to list if id not found (but still saves + renders)", () => {
    const list = [
      { id: "a1" },
      { id: "b2" },
    ];

    app.__setEquipmentList(list);

    app.deleteEquipment("nope");

    const updated = app.__getEquipmentList();

    expect(updated).toEqual(list);

    // current implementation still saves + renders
    expect(app.deps.saveToStorage).toHaveBeenCalledWith(updated);
    expect(app.deps.render).toHaveBeenCalled();
  });

  test("removes all items with matching id (if duplicates exist)", () => {
    const list = [
      { id: "a1" },
      { id: "b2" },
      { id: "b2" },
    ];

    app.__setEquipmentList(list);

    app.deleteEquipment("b2");

    const updated = app.__getEquipmentList();

    expect(updated).toEqual([{ id: "a1" }]);
  });
});