import { Text, VStack } from "@seed-design/react";
import type { Category, Product } from "../data/products";
import { DELIVERY_FEE, MAX_RENTAL_DAYS, formatWon } from "../lib/rental";

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
      body: `1일 · 3일 · 5일 · 1주일 중에 고를 수 있어요. 최대 ${MAX_RENTAL_DAYS}일까지 빌릴 수 있어요.`,
    },
    {
      title: "받는 방법",
      body: `대여자 근처(${product.lender.neighborhood})로 가지러 가거나, 택배로 받을 수 있어요. 택배는 왕복 ${formatWon(DELIVERY_FEE)}이에요.`,
    },
    {
      title: "보증금",
      body: `보증금 ${formatWon(product.deposit)}은 반납 후 대여자가 상태를 확인하면 돌려받아요.`,
    },
    {
      title: "늦게 반납하면",
      body: `반납이 늦어지면 하루마다 1일 요금(${formatWon(product.prices.d1)})이 추가돼요.`,
    },
    {
      title: "파손·분실",
      body: "고장이나 분실이 생기면 수리비만큼 보증금에서 빠져요. 받을 때 상태를 사진으로 남겨두세요.",
    },
    {
      title: "취소",
      body: "받는 날 하루 전까지는 무료로 취소할 수 있어요.",
    },
    CATEGORY_NOTICE[product.category],
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
