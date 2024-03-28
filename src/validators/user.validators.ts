//  email validator ------------------------
export function validateEmail(email: string): boolean {
  // Regular expression for validating email addresses
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


// empty fields validators ------------------
export function checkEmptyValues(data: string[]): boolean {
  return data?.some((field) => {
    return !field || field?.trim() === "";
  });
}

// check for values is within an enum
export function isValidValue(value: string | number, checkData: (string | number)[]): boolean {
    if (value !== undefined && value !== null) {
        return checkData.includes(value);
    }
    return false;
}
