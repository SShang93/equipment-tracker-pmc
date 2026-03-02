describe("escapeHtml", () => {
  let escapeHtml;

  beforeEach(() => {
    jest.resetModules();
    ({ escapeHtml } = require("../assets/scripts/app"));
  });

  test("escapes ampersand", () => {
    expect(escapeHtml("Fish & Chips")).toBe("Fish &amp; Chips");
  });

  test("escapes less than and greater than", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
  });

  test("escapes double quotes", () => {
    expect(escapeHtml('"hello"')).toBe("&quot;hello&quot;");
  });

  test("escapes single quotes", () => {
    expect(escapeHtml("O'Reilly")).toBe("O&#039;Reilly");
  });

  test("escapes multiple characters in same string", () => {
    const input = `<a href="test">Tom & Jerry's</a>`;
    const expected =
      "&lt;a href=&quot;test&quot;&gt;Tom &amp; Jerry&#039;s&lt;/a&gt;";

    expect(escapeHtml(input)).toBe(expected);
  });

  test("converts non-string input to string safely", () => {
    expect(escapeHtml(123)).toBe("123");
    expect(escapeHtml(null)).toBe("null");
    expect(escapeHtml(undefined)).toBe("undefined");
  });

  test("returns empty string when empty string passed", () => {
    expect(escapeHtml("")).toBe("");
  });
});