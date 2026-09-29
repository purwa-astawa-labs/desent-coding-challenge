export interface CheckoutInput {
  name: string;
  email: string;
  /** `YYYY-MM-DD` from an <input type="date">. */
  startDate: string;
  /** Raw text from the weeks field. */
  weeks: string;
}

export type CheckoutErrors = Partial<Record<keyof CheckoutInput, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Local calendar date as `YYYY-MM-DD` (not UTC). */
export function localDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isRealDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

/** Parse the weeks field; returns NaN unless it is a whole number. */
export function parseWeeks(value: string): number {
  const trimmed = value.trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : NaN;
}

/**
 * Validate checkout details. `today` is the user's local date as `YYYY-MM-DD`;
 * dates are compared as strings, so there is no UTC off-by-one.
 */
export function validateCheckout(input: CheckoutInput, today: string): CheckoutErrors {
  const errors: CheckoutErrors = {};
  if (!input.name.trim()) errors.name = "Enter your name.";
  if (!EMAIL_RE.test(input.email.trim())) errors.email = "Enter a valid email address.";
  if (!isRealDate(input.startDate)) errors.startDate = "Choose a start date.";
  else if (input.startDate < today) errors.startDate = "Start date can't be in the past.";
  const weeks = parseWeeks(input.weeks);
  if (!Number.isInteger(weeks) || weeks < 1) errors.weeks = "Enter a whole number of weeks (1 or more).";
  return errors;
}

export function hasErrors(errors: CheckoutErrors): boolean {
  return Object.keys(errors).length > 0;
}
