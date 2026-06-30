function parseAdminEmailAllowlist() {
  return (process.env.ADMIN_EMAIL_ALLOWLIST ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmailAllowed(email: string) {
  const allowedEmails = parseAdminEmailAllowlist();

  if (allowedEmails.length === 0) {
    return true;
  }

  return allowedEmails.includes(email.trim().toLowerCase());
}
