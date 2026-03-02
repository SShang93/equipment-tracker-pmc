describe("calcHireCost", () => {
  let calcHireCost;

  beforeEach(() => {
    jest.resetModules();
    ({ calcHireCost } = require("../assets/scripts/app"));

    jest.useFakeTimers();
    // Freeze "today" so tests are deterministic
    jest.setSystemTime(new Date("2026-03-10T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("charges at least 1 day when startDate is today", () => {
    const cost = calcHireCost(50, "2026-03-10");
    expect(cost).toBe(50); // 1 day minimum
  });

  test("charges at least 1 day when startDate is in the future", () => {
    const cost = calcHireCost(50, "2026-03-20");
    expect(cost).toBe(50); // diffMs negative -> still 1 day
  });

  test("charges 1 day when less than 24 hours have passed", () => {
    // same day, earlier time in UTC
    const cost = calcHireCost(50, "2026-03-10T00:01:00.000Z");
    expect(cost).toBe(50);
  });

  test("charges 2 days when just over 1 day has passed (ceil)", () => {
    // From March 9 to March 10 = 1 day -> ceil(1) = 1, but we want just over 1 day:
    // March 8 23:59 to March 10 12:00 is > 1 day
    const cost = calcHireCost(50, "2026-03-09T11:59:00.000Z");
    // diff is 24h + 1 min => ceil -> 2 days
    expect(cost).toBe(100);
  });

  test("charges correct days for a clear multi-day difference", () => {
    const cost = calcHireCost(40, "2026-03-05"); // 5 days difference to 10th
    // 2026-03-05 to 2026-03-10 is 5 days => ceil(5) = 5
    expect(cost).toBe(200);
  });

  test("returns 0 if rate is 0", () => {
    const cost = calcHireCost(0, "2026-03-05");
    expect(cost).toBe(0);
  });
});