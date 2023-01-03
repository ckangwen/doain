interface ValidateResponse {
  success: boolean;
  message: string;
}

const MOBILE_RE = /^1[3456789]\d{9}$/;

const isMobile = (str: string): boolean => MOBILE_RE.test(str);

export const validateMobile = (value: string): ValidateResponse => {
  const valueNoWhitespace = value?.replace(/\s/g, "");
  const validateResponse = {
    success: false,
    message: "手机号不能为空",
  };

  if (!valueNoWhitespace || valueNoWhitespace === "") {
    return validateResponse;
  }

  if (!isMobile(valueNoWhitespace)) {
    validateResponse.message = "手机号格式不正确";
  } else {
    validateResponse.success = true;
    validateResponse.message = "";
  }

  return validateResponse;
};
