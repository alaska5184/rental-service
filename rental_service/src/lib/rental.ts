import type { DatePickerDate } from "@seed-design/react";
import type { Booking, Product } from "../data/products";

export type Duration = "h4" | "h8" | "day";

export const DURATION_LABEL: Record<Duration, string> = {
  h4: "4시간",
  h8: "8시간",
  day: "1일 이상",
};

/** 받는 시간으로 고를 수 있는 시각 (09:00 ~ 20:00, 1시간 간격) */
export const PICKUP_HOURS = Array.from({ length: 12 }, (_, i) => 9 + i);

const HOUR = 60 * 60 * 1000;

export function toDate(d: DatePickerDate, hour = 0): Date {
  return new Date(d.year, d.month - 1, d.day, hour, 0, 0, 0);
}

export function fromDate(date: Date): DatePickerDate {
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

export function addDays(d: DatePickerDate, days: number): DatePickerDate {
  const date = toDate(d);
  date.setDate(date.getDate() + days);
  return fromDate(date);
}

export function today(): DatePickerDate {
  return fromDate(new Date());
}

/** 두 날짜 사이의 일수 (end - start) */
export function diffDays(start: DatePickerDate, end: DatePickerDate): number {
  return Math.round((toDate(end).getTime() - toDate(start).getTime()) / (24 * HOUR));
}

/** 대여 구간 계산: 받는 시각 ~ 돌려주는 시각 */
export function rentalInterval(
  pickupDate: DatePickerDate,
  hour: number,
  duration: Duration,
  days: number,
): { start: number; end: number } {
  const start = toDate(pickupDate, hour).getTime();
  if (duration === "h4") return { start, end: start + 4 * HOUR };
  if (duration === "h8") return { start, end: start + 8 * HOUR };
  return { start, end: toDate(addDays(pickupDate, days), hour).getTime() };
}

/** 구간 동안 빌릴 수 있는 남은 수량 */
export function availableUnits(
  product: Product,
  start: number,
  end: number,
  extraBookings: Booking[] = [],
): number {
  const booked = [...product.bookings, ...extraBookings]
    .filter((b) => b.start < end && start < b.end)
    .reduce((sum, b) => sum + b.quantity, 0);
  return Math.max(0, product.stock - booked);
}

export function isSlotAvailable(
  product: Product,
  pickupDate: DatePickerDate,
  hour: number,
  duration: Duration,
  days: number,
  extraBookings: Booking[] = [],
): boolean {
  const { start, end } = rentalInterval(pickupDate, hour, duration, days);
  if (start <= Date.now()) return false;
  return availableUnits(product, start, end, extraBookings) > 0;
}

/** 그 날짜에 받을 수 있는 시간이 하나라도 있는지 */
export function dateHasSlot(
  product: Product,
  date: DatePickerDate,
  duration: Duration,
  extraBookings: Booking[] = [],
): boolean {
  const days = duration === "day" ? 1 : 0;
  return PICKUP_HOURS.some((h) => isSlotAvailable(product, date, h, duration, days, extraBookings));
}

/** 목록에 보여줄 가장 빠른 대여 가능 날짜 */
export function firstAvailableDate(
  product: Product,
  extraBookings: Booking[] = [],
): DatePickerDate | undefined {
  const base = today();
  for (let i = 0; i < 60; i++) {
    const d = addDays(base, i);
    if (dateHasSlot(product, d, "h4", extraBookings)) return d;
  }
  return undefined;
}

export function unitPrice(product: Product, duration: Duration): number {
  return product.prices[duration];
}

export function rentalPrice(
  product: Product,
  duration: Duration,
  days: number,
  quantity: number,
): number {
  const multiplier = duration === "day" ? days : 1;
  return unitPrice(product, duration) * multiplier * quantity;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function formatWon(value: number): string {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function formatDay(d: DatePickerDate): string {
  const date = toDate(d);
  return `${d.month}.${d.day}(${WEEKDAYS[date.getDay()]})`;
}

export function formatDateTime(ms: number): string {
  const date = new Date(ms);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${formatDay(fromDate(date))} ${hh}:${mm}`;
}

export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

/** 목록용: "오늘부터", "내일부터", "11.20(목)부터" */
export function formatAvailableFrom(d: DatePickerDate | undefined): string {
  if (!d) return "예약 마감";
  const offset = diffDays(today(), d);
  if (offset === 0) return "오늘부터 대여 가능";
  if (offset === 1) return "내일부터 대여 가능";
  return `${formatDay(d)}부터 대여 가능`;
}

export function durationText(duration: Duration, days: number): string {
  if (duration === "day") return `${days}일`;
  return DURATION_LABEL[duration];
}
