import type { DatePickerDate } from "@seed-design/react";
import type { Booking, Product } from "../data/products";

/** 대여 기간 (일). 최대 1주일 */
export type Duration = 1 | 3 | 5 | 7;
export const DURATIONS: Duration[] = [1, 3, 5, 7];
export const MAX_RENTAL_DAYS = 7;

export const DURATION_LABEL: Record<Duration, string> = {
  1: "1일",
  3: "3일",
  5: "5일",
  7: "1주일",
};

/** 받는 방법 */
export type ReceiveMethod = "pickup" | "delivery";
export const RECEIVE_METHOD_LABEL: Record<ReceiveMethod, string> = {
  pickup: "가지러 가기",
  delivery: "택배로 받기",
};
/** 택배 왕복 비용 (빌리는 사람 부담) */
export const DELIVERY_FEE = 6000;
/** 택배는 받는 날 오전에 도착한다고 보고 9시 기준으로 계산 */
export const DELIVERY_HOUR = 9;

/** 반납 마감 시각: 대여 기간 마지막 날 밤 10시 */
export const RETURN_HOUR = 22;

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

/** 대여 기간 마지막 날 (받는 날 포함 N일째) */
export function lastRentalDay(pickupDate: DatePickerDate, days: number): DatePickerDate {
  return addDays(pickupDate, days - 1);
}

/** 대여 구간: 받는 시각 ~ 마지막 날 밤 10시 (3일이면 20일 받고 22일 반납) */
export function rentalInterval(
  pickupDate: DatePickerDate,
  hour: number,
  days: number,
): { start: number; end: number } {
  const start = toDate(pickupDate, hour).getTime();
  return { start, end: toDate(lastRentalDay(pickupDate, days), RETURN_HOUR).getTime() };
}

/** 구간 동안 남아 있는 수량 */
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
  days: number,
  extraBookings: Booking[] = [],
): boolean {
  const { start, end } = rentalInterval(pickupDate, hour, days);
  if (start <= Date.now()) return false;
  return availableUnits(product, start, end, extraBookings) > 0;
}

/** 그 날짜에 받아서 days일 동안 빌릴 수 있는 시간이 하나라도 있는지 */
export function dateHasSlot(
  product: Product,
  date: DatePickerDate,
  days: number,
  extraBookings: Booking[] = [],
): boolean {
  return PICKUP_HOURS.some((h) => isSlotAvailable(product, date, h, days, extraBookings));
}

/** 목록에 보여줄 가장 빠른 대여 가능 날짜 */
export function firstAvailableDate(
  product: Product,
  extraBookings: Booking[] = [],
): DatePickerDate | undefined {
  const base = today();
  for (let i = 0; i < 60; i++) {
    const d = addDays(base, i);
    if (dateHasSlot(product, d, 1, extraBookings)) return d;
  }
  return undefined;
}

export function rentalPrice(product: Product, duration: Duration): number {
  return product.prices[`d${duration}`];
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

export function formatDateOnly(ms: number): string {
  return formatDay(fromDate(new Date(ms)));
}

export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

/** 목록용: "오늘 대여 가능", "11.20(목)부터 대여 가능" */
export function formatAvailableFrom(d: DatePickerDate | undefined): string {
  if (!d) return "예약 마감";
  if (diffDays(today(), d) === 0) return "오늘 대여 가능";
  return `${formatDay(d)}부터 대여 가능`;
}
