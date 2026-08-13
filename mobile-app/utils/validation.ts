const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function validateSignupForm(fields: {
  username: string;
  email: string;
  password: string;
}): string | null {
  const { username, email, password } = fields;

  if (!username.trim() || !email.trim() || !password) {
    return 'All fields are required.';
  }

  if (!isValidEmail(email)) {
    return 'Please enter a valid email address.';
  }

  return null;
}

export function validateLoginForm(fields: {
  email: string;
  password: string;
}): string | null {
  const { email, password } = fields;

  if (!email.trim() || !password) {
    return 'All fields are required.';
  }

  if (!isValidEmail(email)) {
    return 'Please enter a valid email address.';
  }

  return null;
}
