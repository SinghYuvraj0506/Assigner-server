//  email validator ------------------------
export function validateEmail(email: string): boolean {
  // Regular expression for validating email addresses
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

//  date validator ------------------------
export function isValidDate(dateString:string) {
  // Check if the input is a string
  if (typeof dateString !== 'string') {
      return false;
  }

  // Try parsing the input string as a date
  const date = new Date(dateString);

  // Check if the parsed date is valid
  // JavaScript Date object handles invalid dates by setting it to NaN
  return !isNaN(date.getTime());
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
