import { describe, expect, test } from "vitest";

import { validateMobile } from "../validateMobile";

describe("validateMobile", () => {
  test("should return false when value is empty", () => {
    expect(validateMobile("")).toEqual({
      success: false,
      message: "手机号不能为空",
    });
  });

  test("should return false when value is not a mobile number", () => {
    expect(validateMobile("12345678901")).toEqual({
      success: false,
      message: "手机号格式不正确",
    });
  });

  test("should return true when value is a mobile number", () => {
    expect(validateMobile("18352876756")).toEqual({
      success: true,
      message: "",
    });
  });
});
