/**
 * Utility functions for timezone conversion and formatting
 */

/**
 * Converts a UTC datetime string to a specific timezone and formats it as time
 * @param utcTimeString - ISO datetime string in UTC (e.g., "2014-07-24T07:00:00Z")
 * @param timezone - Target timezone (e.g., "Europe/Tirane")
 * @param locale - Locale for formatting (default: "en-US")
 * @param options - Additional Intl.DateTimeFormat options
 * @returns Formatted time string in the target timezone
 */
export const formatTimeInTimezone = (
  utcTimeString: string,
  timezone: string,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }
): string => {
  const date = new Date(utcTimeString);
  return date.toLocaleTimeString(locale, {
    ...options,
    timeZone: timezone
  });
};

/**
 * Converts a UTC datetime string to a specific timezone and formats it as date
 * @param utcTimeString - ISO datetime string in UTC
 * @param timezone - Target timezone
 * @param locale - Locale for formatting (default: "en-US")
 * @param options - Additional Intl.DateTimeFormat options
 * @returns Formatted date string in the target timezone
 */
export const formatDateInTimezone = (
  utcTimeString: string,
  timezone: string,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }
): string => {
  const date = new Date(utcTimeString);
  return date.toLocaleDateString(locale, {
    ...options,
    timeZone: timezone
  });
};

/**
 * Converts a UTC datetime string to a specific timezone and formats it as full datetime
 * @param utcTimeString - ISO datetime string in UTC
 * @param timezone - Target timezone
 * @param locale - Locale for formatting (default: "en-US")
 * @returns Formatted datetime string in the target timezone
 */
export const formatDateTimeInTimezone = (
  utcTimeString: string,
  timezone: string,
  locale: string = 'en-US'
): string => {
  const date = new Date(utcTimeString);
  return date.toLocaleString(locale, {
    timeZone: timezone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Gets the current date in a specific timezone
 * @param timezone - Target timezone
 * @returns Date object representing current time in the timezone
 */
export const getCurrentDateInTimezone = (timezone: string): Date => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
}; 