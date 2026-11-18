import { Text, VStack } from "@seed-design/react";
import {
  SAFE_RENTAL_COVERAGE,
  isSafeRental,
  type Category,
  type Product,
} from "../data/products";
import { MAX_RENTAL_DAYS, RETURN_HOUR, formatWon } from "../lib/rental";

const CATEGORY_NOTICE: Record<Category, { title: string; body: string }> = {
  cleaner: {
    title: "반납 전 먼지통 비우기",
    body: "먼지통과 필터를 비우고 돌려주세요. 소모품(필터·브러시) 교체가 필요하면 대여자와 상의해요.",
  },
  kitchen: {
    title: "사용 후 세척",
    body: "음식이 닿는 부분은 세척하고 물기를 말려서 돌려주세요.",
  },
  beauty: {
    title: "위생 관리",
    body: "피부·머리에 닿는 부분은 대여자가 소독한 뒤 빌려드려요. 사용 후에도 닦아서 돌려주세요.",
  },
};

/** 예약 전에 확인할 안내사항 */
export function RentalNotices({ product }: { product: Product }) {
  const notices = [
    {
      title: "대여 기간",
      body: `1일 · 3일 · 5일 · 1주일 중에 고를 수 있어요. 대여 시작일을 포함해 세고, 마지막 날 밤 ${RETURN_HOUR - 12}시까지 돌려주면 돼요. (최대 ${MAX_RENTAL_DAYS}일)`,
    },
    {
      title: "받는 방법",
      body: `대여자 근처(${product.lender.neighborhood})에서 직접 만나서 주고받아요. 정확한 장소는 채팅으로 정해요.`,
    },
    {
      title: "보증금 안전결제",
      body: `보증금 ${formatWon(product.deposit)}은 대여자에게 바로 가지 않고 결제대행사 안전결제(에스크로)에 보관돼요. 반납 후 대여자가 상태를 확인하면 돌려받아요.`,
    },
    {
      title: "늦게 반납하면",
      body: `반납이 늦어지면 하루마다 1일 요금(${formatWon(product.prices.d1)})이 추가돼요.`,
    },
    {
      title: "파손·분실",
      body: "고장이나 분실이 생기면 수리비만큼 보증금에서 빠져요. 주고받을 때 채팅의 '상태 사진 체크'로 상태를 남겨두면 분쟁 때 근거가 돼요.",
    },
    ...(isSafeRental(product)
      ? [
          {
            title: "안심 대여 (보험)",
            body: `고가 제품이라 보험이 함께 적용돼요. 실수로 파손·분실해도 최대 ${formatWon(SAFE_RENTAL_COVERAGE)}까지 보험으로 보장받아요.`,
          },
        ]
      : []),
    {
      title: "취소",
      body: "대여 시작일 하루 전까지는 무료로 취소할 수 있어요.",
    },
    CATEGORY_NOTICE[product.category],
    {
      title: "플랫폼 안내",
      body: "이 서비스는 이웃 간 대여를 연결해 주는 중개 플랫폼이에요. 거래 당사자는 대여자와 빌리는 사람이고, 분쟁이 생기면 고객센터가 조정을 도와드려요.",
    },
  ];

  return (
    <VStack gap="x3">
      <Text as="h2" textStyle="t5Bold" color="fg.neutral">
        안내사항
      </Text>
      <ul className="notice-list">
        {notices.map((n) => (
          <li key={n.title}>
            <Text as="p" textStyle="t4Bold" color="fg.neutral">
              {n.title}
            </Text>
            <Text as="p" textStyle="t4Regular" color="fg.neutralMuted">
              {n.body}
            </Text>
          </li>
        ))}
      </ul>
    </VStack>
  );
}
