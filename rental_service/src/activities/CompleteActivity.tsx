import { IconCheckmarkCircleFill, IconXmarkLine } from "@karrotmarket/react-monochrome-icon";
import { Box, Divider, HStack, Icon, Text, VStack } from "@seed-design/react";
import {
  useActivityParams,
  useFlow,
  useStack,
  type StaticActivityComponentType,
} from "@stackflow/react";
import { ActionButton } from "seed-design/ui/action-button";
import { AppBar, AppBarIconButton, AppBarLeft } from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { Badge } from "seed-design/ui/badge";
import { Callout } from "seed-design/ui/callout";
import { ResultSection } from "seed-design/ui/result-section";
import { BottomBar } from "../components/BottomBar";
import { getProduct } from "../data/products";
import {
  DURATION_LABEL,
  formatDateTime,
  formatWon,
} from "../lib/rental";
import { useStore } from "../lib/store";

const CompleteActivity: StaticActivityComponentType<"CompleteActivity"> = () => {
  const { reservationId } = useActivityParams<"CompleteActivity">();
  const { push, pop } = useFlow();
  const stack = useStack();
  const reservation = useStore((s) => s.reservations.find((r) => r.id === reservationId));
  const product = reservation ? getProduct(reservation.productId) : undefined;

  const goHome = () => {
    const depth = stack.activities.filter((a) => a.transitionState.startsWith("enter")).length;
    if (depth > 1) pop(depth - 1);
  };

  if (!reservation || !product) {
    return (
      <AppScreen>
        <AppBar>
          <AppBarLeft>
            <AppBarIconButton aria-label="홈으로" onClick={goHome}>
              <IconXmarkLine />
            </AppBarIconButton>
          </AppBarLeft>
        </AppBar>
        <AppScreenContent>
          <ResultSection
            title="예약 정보를 찾을 수 없어요"
            description="새로고침하면 데모 예약 정보가 사라져요."
            primaryActionProps={{ children: "홈으로", onClick: goHome }}
          />
        </AppScreenContent>
      </AppScreen>
    );
  }

  const confirmed = reservation.status === "confirmed";
  const total = reservation.rentalPrice + reservation.deposit;

  return (
    <AppScreen>
      <AppBar>
        <AppBarLeft>
          <AppBarIconButton aria-label="홈으로" onClick={goHome}>
            <IconXmarkLine />
          </AppBarIconButton>
        </AppBarLeft>
      </AppBar>
      <AppScreenContent>
        <VStack minHeight="full">
          <VStack flexGrow={1} pb="x8">
            <ResultSection
              asset={
                <Box pb="x4">
                  <Icon
                    svg={<IconCheckmarkCircleFill />}
                    size="x14"
                    color={confirmed ? "fg.positive" : "fg.brand"}
                  />
                </Box>
              }
              title={confirmed ? "예약이 확정됐어요" : "예약 요청을 보냈어요"}
              description={
                confirmed
                  ? "대여자와 채팅으로 만날 장소를 정해보세요."
                  : "대여자가 수락하면 예약이 확정돼요."
              }
            />

            <VStack gap="x4" px="spacingX.globalGutter">
              <Box
                borderWidth={1}
                borderColor="stroke.neutralWeak"
                borderRadius="r4"
                px="x4"
                py="x4"
              >
                <VStack gap="x3">
                  <HStack justify="space-between" align="center">
                    <Text textStyle="t5Bold" color="fg.neutral">
                      예약 내역
                    </Text>
                    <Badge tone={confirmed ? "positive" : "warning"} variant="weak">
                      {confirmed ? "예약 확정" : "수락 대기"}
                    </Badge>
                  </HStack>
                  <Divider />
                  <SummaryRow label="제품명" value={product.name} />
                  <SummaryRow
                    label="대여 날짜"
                    value={`${formatDateTime(reservation.start)}\n~ ${formatDateTime(reservation.end)}`}
                  />
                  <SummaryRow label="대여 기간" value={DURATION_LABEL[reservation.duration]} />
                  <SummaryRow
                    label="방문 장소"
                    value={`${product.lender.neighborhood} · 채팅으로 정해요`}
                  />
                  <SummaryRow label="대여 가격" value={formatWon(reservation.rentalPrice)} />
                  <SummaryRow label="보증금" value={formatWon(reservation.deposit)} />
                  <Divider />
                  <HStack justify="space-between" align="center">
                    <Text textStyle="t5Bold" color="fg.neutral">
                      결제 금액
                    </Text>
                    <Text textStyle="t6Bold" color="fg.brand">
                      {formatWon(total)}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
              <Callout
                tone="neutral"
                description="보증금은 안전결제(에스크로)에 보관돼 있어요. 반납 후 대여자가 상태를 확인하면 돌려받아요."
              />
            </VStack>
          </VStack>

          <BottomBar>
            <VStack gap="x2">
              <ActionButton
                variant="brandSolid"
                size="large"
                style={{ width: "100%" }}
                onClick={() =>
                  push("ChatActivity", {
                    productId: product.id,
                    reservationId: reservation.id,
                  })
                }
              >
                대여자와 채팅하기
              </ActionButton>
              <ActionButton variant="neutralWeak" size="large" style={{ width: "100%" }} onClick={goHome}>
                홈으로
              </ActionButton>
            </VStack>
          </BottomBar>
        </VStack>
      </AppScreenContent>
    </AppScreen>
  );
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <HStack justify="space-between" align="flex-start" gap="x4">
      <Text textStyle="t4Regular" color="fg.neutralMuted" style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <Text
        textStyle="t4Medium"
        color="fg.neutral"
        align="right"
        style={{ whiteSpace: "pre-line" }}
      >
        {value}
      </Text>
    </HStack>
  );
}

export default CompleteActivity;
