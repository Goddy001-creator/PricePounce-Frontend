const COMMON_PASSWORDS = [
  "1234567890", "0123456789", "0987654321", "1234512345", "123456789a",
  "password12", "password123", "password1234", "passw0rd123",
  "qwertyuiop", "qwerty12345", "qwerty123456", "1q2w3e4r5t",
  "iloveyou12", "iloveyou123", "welcome123", "letmein1234",
  "administrator", "abcdefghij", "abcd123456", "pricepounce",
];

export function validateName(value) {
  const name = value.trim().replace(/\s+/g, " ");

  if (name.length < 2 || name.length > 60) {
    return "Enter your name (2 to 60 characters).";
  }

  return "";
}

export function validateEmail(value) {
  const email = value.trim();

  if (!email) return "Email is required.";
  if (email.length > 254) return "Email is too long.";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return "Enter a valid email address.";
  }

  return "";
}

// Mirrors the server rules. The server is still the real check.
export function getPasswordRules(password, email = "") {
  const localPart = email.split("@")[0].toLowerCase();

  return [
    {
      id: "length",
      label: "10 to 128 characters",
      ok: password.length >= 10 && password.length <= 128,
    },
    {
      id: "common",
      label: "Not a commonly used password",
      ok: !COMMON_PASSWORDS.includes(password.toLowerCase()),
    },
    {
      id: "email",
      label: "Doesn't contain your email name",
      ok: localPart.length < 4 || !password.toLowerCase().includes(localPart),
    },
    {
      id: "variety",
      label: "Uses a mix of characters",
      ok: new Set(password).size >= 4,
    },
  ];
}

export function isPasswordValid(password, email = "") {
  return (
    password.length > 0 &&
    getPasswordRules(password, email).every((rule) => rule.ok)
  );
}