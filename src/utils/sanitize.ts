export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export function sanitizeAll(obj: Record<string, any>, fields: string[]): Record<string, any> {
  const sanitized = { ...obj };
  for (const field of fields) {
    if (typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeInput(sanitized[field]);
    }
  }
  return sanitized;
}
