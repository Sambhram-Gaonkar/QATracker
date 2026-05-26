export type ValidationResult = { valid: true } | { valid: false; message: string };

export function required(value: string | null | undefined, label: string): ValidationResult {
  if (!value || !value.trim()) return { valid: false, message: `${label} is required.` };
  return { valid: true };
}

export function validateEmail(email: string): ValidationResult {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, message: "Enter a valid email address." };
  }
  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters." };
  }
  return { valid: true };
}
