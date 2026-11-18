import { useMemo, useSyncExternalStore } from "react";
import type { Booking } from "../data/products";
import type { Duration, ReceiveMethod } from "./rental";

export type ReservationStatus = "requested" | "confirmed";

export interface Reservation {
  id: string;
  productId: string;
  start: number;
  end: number;
  duration: Duration;
  quantity: number;
  method: ReceiveMethod;
  /** 택배로 받을 때 주소 */
  address?: string;
  rentalPrice: number;
  deliveryFee: number;
  deposit: number;
  status: ReservationStatus;
}

export interface ChatLocation {
  title: string;
  detail: string;
}

export interface ChatMessage {
  id: string;
  from: "me" | "lender";
  at: number;
  text?: string;
  /** 예약 내용 카드 */
  reservationId?: string;
  /** 위치 카드 */
  location?: ChatLocation;
}

interface State {
  reservations: Reservation[];
  chats: Record<string, ChatMessage[]>;
}

const STORAGE_KEY = "rental-demo-state-v2";

// 새로고침해도 데모 예약·채팅이 남도록 탭 세션에 저장
function load(): State {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as State;
  } catch {
    // 저장소를 쓸 수 없는 환경이면 빈 상태로 시작
  }
  return { reservations: [], chats: {} };
}

let state: State = load();
const listeners = new Set<() => void>();

function setState(next: State) {
  state = next;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 무시
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state));
}

let seq = 0;
const nextId = (prefix: string) => `${prefix}${Date.now().toString(36)}${(seq++).toString(36)}`;

/** 내가 한 예약도 다른 예약처럼 막아야 하므로 Booking 형태로 돌려줌 */
export function myBookingsFor(productId: string): Booking[] {
  return state.reservations
    .filter((r) => r.productId === productId)
    .map((r) => ({ start: r.start, end: r.end, quantity: r.quantity }));
}

export function useMyBookings(productId: string): Booking[] {
  const reservations = useStore((s) => s.reservations);
  return useMemo(
    () =>
      reservations
        .filter((r) => r.productId === productId)
        .map((r) => ({ start: r.start, end: r.end, quantity: r.quantity })),
    [reservations, productId],
  );
}

export function createReservation(input: Omit<Reservation, "id" | "status">): Reservation {
  const reservation: Reservation = { ...input, id: nextId("r"), status: "requested" };
  setState({ ...state, reservations: [...state.reservations, reservation] });
  return reservation;
}

export function getReservation(id: string): Reservation | undefined {
  return state.reservations.find((r) => r.id === id);
}

function pushMessage(productId: string, message: Omit<ChatMessage, "id" | "at">) {
  const list = state.chats[productId] ?? [];
  setState({
    ...state,
    chats: { ...state.chats, [productId]: [...list, { ...message, id: nextId("m"), at: Date.now() }] },
  });
}

function confirmReservation(id: string) {
  setState({
    ...state,
    reservations: state.reservations.map((r) => (r.id === id ? { ...r, status: "confirmed" } : r)),
  });
}

/** 예약 완료 후 채팅으로 들어갈 때 첫 메시지로 예약 카드를 보냄 (한 번만) */
export function shareReservationInChat(reservation: Reservation) {
  const list = state.chats[reservation.productId] ?? [];
  if (list.some((m) => m.reservationId === reservation.id)) return;

  pushMessage(reservation.productId, {
    from: "me",
    reservationId: reservation.id,
    text: "안녕하세요! 예약 요청 보냈어요. 확인 부탁드려요 🙂",
  });

  // 데모용: 대여자가 잠시 뒤 수락하고 답장
  window.setTimeout(() => {
    confirmReservation(reservation.id);
    pushMessage(reservation.productId, {
      from: "lender",
      text:
        reservation.method === "delivery"
          ? "예약 수락했어요! 받는 날 오전에 도착하게 보내드릴게요."
          : "예약 수락했어요! 받으실 때 어디서 만나면 편하세요?",
    });
  }, 1800);
}

export function sendMessage(productId: string, text: string) {
  pushMessage(productId, { from: "me", text });
  const hasLenderReply = (state.chats[productId] ?? []).some((m) => m.from === "lender");
  if (!hasLenderReply) {
    window.setTimeout(() => {
      pushMessage(productId, {
        from: "lender",
        text: "안녕하세요! 네, 궁금한 점 편하게 물어보세요.",
      });
    }, 1200);
  }
}

/** AI 추천 메시지 보내기: 메시지를 보내고 데모용 대여자 답장을 받아요 */
export function sendSuggestedMessage(
  productId: string,
  message: { text?: string; location?: ChatLocation },
  reply: string,
) {
  pushMessage(productId, { from: "me", ...message });
  window.setTimeout(() => {
    pushMessage(productId, { from: "lender", text: reply });
  }, 1200);
}
