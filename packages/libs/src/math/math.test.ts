import { add, subtract, multiply, divide, clamp } from "./math";

describe("add", () => {
  it("adds two positive numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("adds negative numbers", () => {
    expect(add(-1, -2)).toBe(-3);
  });

  it("adds zero", () => {
    expect(add(5, 0)).toBe(5);
  });
});

describe("subtract", () => {
  it("subtracts two numbers", () => {
    expect(subtract(5, 3)).toBe(2);
  });

  it("returns negative when second is larger", () => {
    expect(subtract(3, 5)).toBe(-2);
  });
});

describe("multiply", () => {
  it("multiplies two numbers", () => {
    expect(multiply(3, 4)).toBe(12);
  });

  it("returns zero when multiplied by zero", () => {
    expect(multiply(5, 0)).toBe(0);
  });

  it("handles negative numbers", () => {
    expect(multiply(-3, 4)).toBe(-12);
  });
});

describe("divide", () => {
  it("divides two numbers", () => {
    expect(divide(10, 2)).toBe(5);
  });

  it("returns decimal results", () => {
    expect(divide(7, 2)).toBe(3.5);
  });

  it("throws on division by zero", () => {
    expect(() => divide(5, 0)).toThrow("Division by zero");
  });
});

describe("clamp", () => {
  it("returns value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("clamps to min when below range", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("clamps to max when above range", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("returns boundary value when equal to min", () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it("returns boundary value when equal to max", () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });
});
