/**
 * Format a date to a readable date and time string
 * Example: "Jan 15, 2024, 2:30 PM"
 */
export function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format a date to a time string only
 * Example: "2:30 PM"
 */
export function formatTime(date: Date): string {
  return new Date(date).toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
