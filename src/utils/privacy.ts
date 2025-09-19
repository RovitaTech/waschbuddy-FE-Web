// Privacy utilities for EU compliance

export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters for processing
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length < 4) return phone;
  
  // Show first 2 and last 2 digits, mask the middle
  const first = digits.slice(0, 2);
  const last = digits.slice(-2);
  const middle = '*'.repeat(Math.max(4, digits.length - 4));
  
  // Keep original formatting structure if it exists
  if (phone.includes('+')) {
    return `+${first}${middle}${last}`;
  } else if (phone.includes(' ') || phone.includes('-')) {
    // Try to maintain some formatting
    return `${first}${middle}${last}`;
  }
  
  return `${first}${middle}${last}`;
}

export function maskEmail(email: string, shouldMask: boolean = false): string {
  // For EU compliance, emails are shown fully as per requirements
  // Only mask if explicitly requested
  if (!shouldMask || !email) return email;
  
  const [local, domain] = email.split('@');
  if (!domain) return email;
  
  const maskedLocal = local.length > 2 
    ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`
    : local;
  
  return `${maskedLocal}@${domain}`;
}