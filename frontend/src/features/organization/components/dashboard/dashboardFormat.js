/** A value the APIs did not return renders as an em dash, never as a made-up 0. */
export const show = (value) => (value === null || value === undefined || value === "" ? "—" : value);
