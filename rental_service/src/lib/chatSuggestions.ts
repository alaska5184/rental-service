import type { Category, Product } from "../data/products";
import { formatDateTime } from "./rental";
import type { ChatLocation, Reservation } from "./store";

export interface ChatSuggestion {
  id: string;
  label: string;
  kind: "location" | "text";
  /** 보낼 메시지 */
  text?: string;
  location?: ChatLocation;
  /** 데모용 대여자 답장 */
  reply: string;
}

/** 데모에서 쓰는 내 위치 */
const MY_LOCATION: ChatLocation = {
  title: "역삼역 3번 출구",
  detail: "강남구 역삼동 · 대여자와 도보 6분",
};

const COMPONENTS_REPLY: Record<Category, string> = {
  cleaner: "본체, 충전기, 헤드 2개, 거치대까지 다 드려요!",
  kitchen: "본체랑 기본 트레이, 설명서 함께 드려요.",
  beauty: "본체랑 기본 헤드·충전기 드려요. 소독해서 드릴게요!",
};

/**
 * 대화 상황(예약 전 / 예약 후)에 맞춰 보낼 만한 메시지를 추천해요.
 * 실제 서비스에서는 대화 내용을 AI가 읽고 고르면 되고, 여기서는 규칙으로 흉내 내요.
 */
export function getChatSuggestions(
  product: Product,
  reservation: Reservation | undefined,
): ChatSuggestion[] {
  if (!reservation) {
    return [
      {
        id: "location",
        label: "위치 보내기",
        kind: "location",
        location: MY_LOCATION,
        reply: "가까우시네요! 예약하시면 그 근처에서 드릴게요.",
      },
      {
        id: "how-to",
        label: "사용법 알려주세요",
        kind: "text",
        text: "처음 써보는 거라 사용법 알려주실 수 있나요?",
        reply: "그럼요! 받으실 때 직접 보여드릴게요. 어렵지 않아요 🙂",
      },
      {
        id: "components",
        label: "구성품 물어보기",
        kind: "text",
        text: "구성품은 뭐가 있나요?",
        reply: COMPONENTS_REPLY[product.category],
      },
      {
        id: "weekend",
        label: "주말에 빌릴 수 있나요?",
        kind: "text",
        text: "이번 주말에 빌릴 수 있을까요?",
        reply: "네! 대여하기에서 날짜 고르시면 바로 확인돼요.",
      },
    ];
  }

  return [
    {
      id: "location",
      label: "위치 보내기",
      kind: "location",
      location: MY_LOCATION,
      reply: `좋아요! ${formatDateTime(reservation.start)}에 거기서 뵐게요.`,
    },
    {
      id: "time",
      label: "방문 시간 확인",
      kind: "text",
      text: `${formatDateTime(reservation.start)}에 방문하는 거 맞으시죠?`,
      reply: "네 맞아요! 늦으시면 미리 알려주세요.",
    },
    {
      id: "arrived",
      label: "도착했어요",
      kind: "text",
      text: "도착했어요!",
      reply: "금방 나갈게요!",
    },
    {
      id: "return-place",
      label: "반납도 같은 곳에서",
      kind: "text",
      text: "반납도 같은 곳에서 하면 될까요?",
      reply: `네, ${formatDateTime(reservation.end)}에 같은 곳에서 받을게요.`,
    },
  ];
}
