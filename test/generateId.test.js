describe("generateId", () => {
  let generateId;

  beforeEach(() => {
    jest.resetModules();
    ({ generateId } = require("../assets/scripts/app"));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns a string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
  });

  test("includes timestamp portion in base36", () => {
    jest.spyOn(Date, "now").mockReturnValue(1000); // fixed time
    jest.spyOn(Math, "random").mockReturnValue(0.123456);

    const id = generateId();

    const expectedTimePart = (1000).toString(36);
    expect(id.startsWith(expectedTimePart)).toBe(true);
  });

  test("includes random portion of length 6", () => {
    jest.spyOn(Date, "now").mockReturnValue(1000);
    jest.spyOn(Math, "random").mockReturnValue(0.987654321);

    const id = generateId();

    const timePart = (1000).toString(36);
    const randomPart = id.slice(timePart.length);

    expect(randomPart.length).toBe(6);
  });

  test("generates different ids when random changes", () => {
    jest.spyOn(Date, "now").mockReturnValue(1000);

    jest.spyOn(Math, "random")
      .mockReturnValueOnce(0.111111)
      .mockReturnValueOnce(0.222222);

    const id1 = generateId();
    const id2 = generateId();

    expect(id1).not.toBe(id2);
  });
});