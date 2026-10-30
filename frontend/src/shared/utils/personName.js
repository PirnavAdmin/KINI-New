// Allow international letters and punctuation, but require letters and reject numbers.
export const isValidPersonName = (value) => /\p{L}/u.test(value) && !/\p{N}/u.test(value);
export const personNameError = (value, label) => {
  if (!value.trim()) return label + " is required.";
  return isValidPersonName(value) ? "" : label + " must contain letters and cannot include numbers.";
};
