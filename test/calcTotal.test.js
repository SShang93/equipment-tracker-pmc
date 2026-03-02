describe("calcTotal", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    app = require("../assets/scripts/app");
  });

  test("returns 0 for empty list", () => {
    expect(app.calcTotal([])).toBe(0);
  });

  test("sums values returned by calcHireCost", () => {
    app.deps.calcHireCost = jest
      .fn()
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(200)
      .mockReturnValueOnce(50);

    const list = [
      { rate: 10, startDate: "2026-03-01" },
      { rate: 20, startDate: "2026-03-02" },
      { rate: 5, startDate: "2026-03-03" },
    ];

    const result = app.calcTotal(list);

    expect(result).toBe(350);
    expect(app.deps.calcHireCost).toHaveBeenCalledTimes(3);
  });

  test("passes correct arguments to calcHireCost", () => {
    app.deps.calcHireCost = jest.fn().mockReturnValue(100);

    const list = [{ rate: 40, startDate: "2026-03-05" }];

    app.calcTotal(list);

    expect(app.deps.calcHireCost).toHaveBeenCalledWith(40, "2026-03-05");
  });
});