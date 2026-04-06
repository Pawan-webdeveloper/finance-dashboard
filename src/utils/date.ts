/**
 * Parse ISO date strings to Date objects for filtering.
 */
export function parseDateRange(from?: string, to?: string): { from?: Date; to?: Date } {
  const result: { from?: Date; to?: Date } = {};

  if (from) {
    const parsed = new Date(from);
    if (!isNaN(parsed.getTime())) {
      result.from = parsed;
    }
  }

  if (to) {
    const parsed = new Date(to);
    if (!isNaN(parsed.getTime())) {
      // Set to end of day
      parsed.setHours(23, 59, 59, 999);
      result.to = parsed;
    }
  }

  return result;
}

/**
 * Get the start and end of the current month.
 */
export function getCurrentMonthRange(): { from: Date; to: Date } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from, to };
}
