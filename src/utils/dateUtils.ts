import { format, toZonedTime } from 'date-fns-tz';
import { differenceInMonths, differenceInYears, parseISO } from 'date-fns';

export const DHAKA_TZ = 'Asia/Dhaka';

export function getDhakaNow(): string {
  return new Date().toISOString();
}

export function getDhakaToday(): string {
  const now = new Date();
  const zoned = toZonedTime(now, DHAKA_TZ);
  return format(zoned, 'yyyy-MM-dd', { timeZone: DHAKA_TZ });
}

export function formatDateDisplay(isoDate: string): string {
  try {
    const zoned = toZonedTime(parseISO(isoDate), DHAKA_TZ);
    return format(zoned, 'dd MMM yyyy', { timeZone: DHAKA_TZ });
  } catch {
    return isoDate;
  }
}

export function formatDateForInput(isoDate: string): string {
  try {
    const zoned = toZonedTime(parseISO(isoDate), DHAKA_TZ);
    return format(zoned, 'yyyy-MM-dd', { timeZone: DHAKA_TZ });
  } catch {
    return isoDate.substring(0, 10);
  }
}

export function calculateAge(dateOfBirth: string): string {
  try {
    const dob = parseISO(dateOfBirth);
    const now = new Date();
    const years = differenceInYears(now, dob);
    const months = differenceInMonths(now, dob) % 12;
    if (years === 0) return `${months}M`;
    if (months === 0) return `${years}Y`;
    return `${years}Y ${months}M`;
  } catch {
    return '';
  }
}

export function generatePrescriptionNumber(prefix: string, counter: number): string {
  return `${prefix}-${String(counter).padStart(4, '0')}`;
}

export function getCurrentDhakaTime(): string {
  const now = new Date();
  const zoned = toZonedTime(now, DHAKA_TZ);
  return format(zoned, 'hh:mm a', { timeZone: DHAKA_TZ });
}
