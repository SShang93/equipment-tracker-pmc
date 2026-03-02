describe("groupBySite", () => {
  let groupBySite;

  beforeEach(() => {
    jest.resetModules();
    ({ groupBySite } = require("../assets/scripts/app"));
  });

  test("groups items by site name", () => {
    const items = [
      { id: 1, site: "Site A" },
      { id: 2, site: "Site B" },
      { id: 3, site: "Site A" },
    ];

    const result = groupBySite(items);

    expect(Object.keys(result)).toEqual(["Site A", "Site B"]);
    expect(result["Site A"].length).toBe(2);
    expect(result["Site B"].length).toBe(1);
  });

  test("trims whitespace from site names", () => {
    const items = [
      { id: 1, site: "  Site A  " },
      { id: 2, site: "Site A" },
    ];

    const result = groupBySite(items);

    expect(Object.keys(result)).toEqual(["Site A"]);
    expect(result["Site A"].length).toBe(2);
  });

  test("uses 'Unknown site' if site is empty string", () => {
    const items = [
      { id: 1, site: "" },
      { id: 2, site: "   " },
    ];

    const result = groupBySite(items);

    expect(Object.keys(result)).toEqual(["Unknown site"]);
    expect(result["Unknown site"].length).toBe(2);
  });

  test("uses 'Unknown site' if site is undefined or null", () => {
    const items = [
      { id: 1, site: undefined },
      { id: 2, site: null },
    ];

    const result = groupBySite(items);

    expect(Object.keys(result)).toEqual(["Unknown site"]);
    expect(result["Unknown site"].length).toBe(2);
  });

  test("returns empty object when items array is empty", () => {
    const result = groupBySite([]);

    expect(result).toEqual({});
  });
});