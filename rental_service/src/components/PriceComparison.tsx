import { HStack, Text, VStack } from "@seed-design/react";
import { Badge } from "seed-design/ui/badge";
import type { Product } from "../data/products";
import { DURATIONS, DURATION_LABEL, formatWon, rentalPrice, type Duration } from "../lib/rental";

/** 1일 요금으로 같은 기간을 빌렸을 때보다 얼마나 싼지 */
function compare(product: Product, d: Duration) {
  const total = rentalPrice(product, d);
  const perDay = Math.round(total / d / 10) * 10;
  const plain = product.prices.d1 * d;
  const saved = plain - total;
  const discount = Math.round((saved / plain) * 100);
  return { total, perDay, saved, discount };
}

/**
 * 기간별 요금 비교.
 * 행을 누르면 그 기간이 선택되고, 대여하기로 넘어갈 때 그대로 이어져요.
 */
export function PriceComparison({
  product,
  selected,
  onSelect,
}: {
  product: Product;
  selected: Duration;
  onSelect: (d: Duration) => void;
}) {
  return (
    <VStack gap="x3">
      <VStack gap="x1">
        <Text as="h2" textStyle="t5Bold" color="fg.neutral">
          기간별 요금 비교
        </Text>
        <Text textStyle="t3Regular" color="fg.neutralMuted">
          오래 빌릴수록 하루 요금이 내려가요
        </Text>
      </VStack>

      <VStack gap="x2" role="radiogroup" aria-label="대여 기간별 요금">
        {DURATIONS.map((d) => {
          const c = compare(product, d);
          const isSelected = d === selected;
          return (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className="price-row"
              data-selected={isSelected}
              onClick={() => onSelect(d)}
            >
              <HStack justify="space-between" align="center" gap="x3">
                <HStack gap="x1_5" align="center">
                  <Text textStyle="t5Bold" color="fg.neutral">
                    {DURATION_LABEL[d]}
                  </Text>
                  {c.discount > 0 && (
                    <Badge tone="brand" variant="weak" size="medium">
                      {c.discount}% 할인
                    </Badge>
                  )}
                </HStack>
                <Text textStyle="t5Bold" color={isSelected ? "fg.brand" : "fg.neutral"}>
                  {formatWon(c.total)}
                </Text>
              </HStack>
              <HStack justify="space-between" align="center" gap="x2" pt="x1_5">
                {/* 1일씩 따로 빌릴 때와 비교한 절약 금액 */}
                <Text textStyle="t3Medium" color={c.saved > 0 ? "fg.brand" : "fg.neutralSubtle"}>
                  {c.saved > 0 ? `${formatWon(c.saved)}을 아낄 수 있어요` : "기본 요금"}
                </Text>
                <Text textStyle="t3Regular" color="fg.neutralMuted" style={{ flexShrink: 0 }}>
                  1일당 {formatWon(c.perDay)}
                </Text>
              </HStack>
            </button>
          );
        })}
      </VStack>
    </VStack>
  );
}
