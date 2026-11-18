import {
  Box,
  Divider,
  Grid,
  HStack,
  Text,
  VStack,
  dateOnOrAfter,
  dateOnOrBefore,
  excludeDates,
  type DatePickerDate,
  type DatePickerRangeValue,
} from "@seed-design/react";
import { useActivityParams, useFlow, type StaticActivityComponentType } from "@stackflow/react";
import { useMemo, useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { AppBar, AppBarBackButton, AppBarLeft, AppBarMain } from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { Callout } from "seed-design/ui/callout";
import { Chip } from "seed-design/ui/chip";
import { DatePicker } from "seed-design/ui/date-picker";
import { BottomBar } from "../components/BottomBar";
import { getProduct, type Product } from "../data/products";
import {
  DURATIONS,
  DURATION_LABEL,
  MAX_RENTAL_DAYS,
  PICKUP_HOURS,
  addDays,
  dateHasSlot,
  formatDateTime,
  formatDay,
  formatHour,
  formatWon,
  isSlotAvailable,
  lastRentalDay,
  rentalInterval,
  RETURN_HOUR,
  rentalPrice,
  today as getToday,
  type Duration,
} from "../lib/rental";
import { createReservation, useMyBookings } from "../lib/store";

const BOOKABLE_DAYS = 60;

const BookingActivity: StaticActivityComponentType<"BookingActivity"> = () => {
  const { productId, duration } = useActivityParams<"BookingActivity">();
  const product = getProduct(productId);
  if (!product) return null;
  const initial = Number(duration);
  return (
    <BookingScreen
      product={product}
      initialDuration={DURATIONS.includes(initial as Duration) ? (initial as Duration) : undefined}
    />
  );
};

function BookingScreen({
  product,
  initialDuration,
}: {
  product: Product;
  initialDuration?: Duration;
}) {
  const { replace } = useFlow();
  const myBookings = useMyBookings(product.id);
  const today = useMemo(() => getToday(), []);

  // ② 대여 시작일
  const [date, setDate] = useState<DatePickerDate | undefined>();
  // ① 대여 기간
  const [durationChoice, setDurationChoice] = useState<Duration | undefined>(initialDuration);
  // ③ 방문 시간
  const [hourChoice, setHourChoice] = useState<number | undefined>();

  /** 이 기간을 고를 수 있는지 (시작일을 고르기 전에는 모두 가능) */
  const durationAvailable = (d: Duration) => {
    if (!date) return true;
    return dateHasSlot(product, date, d, myBookings);
  };
  const duration = durationChoice && durationAvailable(durationChoice) ? durationChoice : undefined;

  const hourAvailable = (h: number) =>
    Boolean(date && duration && isSlotAvailable(product, date, h, duration, myBookings));
  const hour = hourChoice !== undefined && hourAvailable(hourChoice) ? hourChoice : undefined;

  const interval =
    date && duration && hour !== undefined && hourAvailable(hour)
      ? rentalInterval(date, hour, duration)
      : undefined;

  const ready = Boolean(interval);

  /** 달력에 칠할 범위: 대여 시작일부터 대여 기간만큼 (3일이면 20·21·22일) */
  const lastUseDay = date && duration ? lastRentalDay(date, duration) : date;
  const calendarRange: DatePickerRangeValue | undefined =
    date && lastUseDay ? { start: date, end: lastUseDay } : undefined;

  const price = duration ? rentalPrice(product, duration) : 0;
  const total = price + product.deposit;

  // 이미 예약이 찬 날짜는 고를 수 없게
  const constraints = useMemo(
    () => [
      dateOnOrAfter(today),
      dateOnOrBefore(addDays(today, BOOKABLE_DAYS)),
      // 고른 대여 기간을 다 채울 수 없는 날은 시작일로 고를 수 없게
      excludeDates((d) => !dateHasSlot(product, d, durationChoice ?? 1, myBookings)),
    ],
    [today, product, myBookings, durationChoice],
  );

  const submit = () => {
    if (!interval || !duration || !ready) return;
    const reservation = createReservation({
      productId: product.id,
      start: interval.start,
      end: interval.end,
      duration,
      quantity: 1,
      rentalPrice: price,
      deposit: product.deposit,
    });
    // 완료 화면에서 뒤로 가면 예약 화면이 아니라 상품 상세로 돌아가도록 replace
    replace("CompleteActivity", { reservationId: reservation.id });
  };

  return (
    <AppScreen>
      <AppBar>
        <AppBarLeft>
          <AppBarBackButton />
        </AppBarLeft>
        <AppBarMain>대여 날짜 선택</AppBarMain>
      </AppBar>
      <AppScreenContent>
        <VStack minHeight="full">
          <VStack gap="x8" px="spacingX.globalGutter" pt="x4" pb="x8" flexGrow={1}>
            <VStack gap="x1">
              <Text textStyle="t3Regular" color="fg.neutralMuted">
                {product.brand}
              </Text>
              <Text textStyle="t6Bold" color="fg.neutral">
                {product.name}
              </Text>
            </VStack>

            {/* ① 대여 기간 */}
            <Section step={1} title="대여 기간" description={`최대 ${MAX_RENTAL_DAYS}일까지 빌릴 수 있어요`}>
              <Chip.RadioRoot
                aria-label="대여 기간"
                value={duration ? String(duration) : ""}
                onValueChange={(v) => setDurationChoice(Number(v) as Duration)}
              >
                <Grid columns={2} gap="x2">
                  {DURATIONS.map((d) => (
                    <Chip.RadioItem
                      key={d}
                      value={String(d)}
                      disabled={!durationAvailable(d)}
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      <Chip.Label>
                        {DURATION_LABEL[d]} · {formatWon(rentalPrice(product, d))}
                      </Chip.Label>
                    </Chip.RadioItem>
                  ))}
                </Grid>
              </Chip.RadioRoot>
            </Section>

            {/* ② 대여 시작일 */}
            <Section step={2} title="대여 시작일" description="회색 날짜는 이미 예약이 차 있어요">
              {/* 시작일을 누르면, 고른 대여 기간만큼 달력에 범위로 표시해요 */}
              <DatePicker
                selectionMode="range"
                today={today}
                value={calendarRange}
                onValueChange={(v) => {
                  // 범위의 시작일을 대여 시작일로 써요 (끝은 대여 기간으로 자동 계산)
                  const next = v?.start;
                  if (next) setDate(next);
                }}
                constraints={constraints}
              />
              {date && duration && (
                <VStack gap="x0_5">
                  <Text textStyle="t4Medium" color="fg.brand">
                    {duration === 1
                      ? `${formatDay(date)} · ${DURATION_LABEL[duration]}`
                      : `${formatDay(date)} ~ ${formatDay(lastRentalDay(date, duration))} · ${DURATION_LABEL[duration]}`}
                  </Text>
                  <Text textStyle="t3Regular" color="fg.neutralMuted">
                    {`${formatDay(lastRentalDay(date, duration))} 밤 ${RETURN_HOUR - 12}시까지 돌려주면 돼요`}
                  </Text>
                </VStack>
              )}
            </Section>

            {/* ③ 방문 장소 · 시간 */}
            <Section step={3} title="방문 장소 · 시간" description="대여자 근처에서 직접 만나서 받아요">
                <VStack gap="x3">
                  <Box bg="bg.neutralWeak" borderRadius="r3" px="x4" py="x3_5">
                    <VStack gap="x0_5">
                      <Text textStyle="t4Medium" color="fg.neutral">
                        {product.lender.neighborhood} · {product.lender.nickname}님 근처
                      </Text>
                      <Text textStyle="t3Regular" color="fg.neutralMuted">
                        정확한 장소는 예약 후 채팅으로 정해요
                      </Text>
                    </VStack>
                  </Box>
                  <Text textStyle="t4Bold" color="fg.neutral">
                    방문 시간
                  </Text>
                  {date && duration ? (
                    <Chip.RadioRoot
                      aria-label="방문 시간"
                      value={hour !== undefined ? String(hour) : ""}
                      onValueChange={(v) => setHourChoice(Number(v))}
                    >
                      <Grid columns={4} gap="x2">
                        {PICKUP_HOURS.map((h) => (
                          <Chip.RadioItem
                            key={h}
                            value={String(h)}
                            disabled={!hourAvailable(h)}
                            style={{ width: "100%", justifyContent: "center" }}
                          >
                            <Chip.Label>{formatHour(h)}</Chip.Label>
                          </Chip.RadioItem>
                        ))}
                      </Grid>
                    </Chip.RadioRoot>
                  ) : (
                    <Placeholder>대여 기간과 시작일을 먼저 선택해 주세요</Placeholder>
                  )}
                </VStack>
            </Section>

            {/* 반납 일정 (자동) */}
            {interval && (
              <Box bg="bg.brandWeak" borderRadius="r3" px="x4" py="x3_5">
                <VStack gap="x1">
                  <HStack justify="space-between">
                    <Text textStyle="t4Regular" color="fg.neutralMuted">
                      방문 시간
                    </Text>
                    <Text textStyle="t4Medium" color="fg.neutral">
                      {formatDateTime(interval.start)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text textStyle="t4Regular" color="fg.neutralMuted">
                      돌려주는 시간
                    </Text>
                    <Text textStyle="t4Bold" color="fg.brand">
                      {formatDateTime(interval.end)}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            )}

            {/* 금액 */}
            {interval && duration && (
              <VStack gap="x3">
                <Divider />
                <PriceRow label={`대여료 (${DURATION_LABEL[duration]})`} value={formatWon(price)} />
                <PriceRow label="보증금" value={formatWon(product.deposit)} />
                <Callout
                  tone="informative"
                  description="보증금은 안전결제(에스크로)에 보관됐다가 반납 확인 후 돌려받아요. 이웃 간 대여라 플랫폼은 거래 당사자가 아니고, 예약은 대여자가 수락하면 확정돼요."
                />
              </VStack>
            )}
          </VStack>

          <BottomBar>
            <HStack gap="x3" align="center">
              <VStack gap="x0_5" flexGrow={1}>
                <Text textStyle="t2Regular" color="fg.neutralMuted">
                  총 결제 금액
                </Text>
                <Text textStyle="t6Bold" color="fg.neutral">
                  {interval ? formatWon(total) : "-"}
                </Text>
              </VStack>
              <ActionButton variant="brandSolid" size="large" disabled={!ready} onClick={submit}>
                예약 요청하기
              </ActionButton>
            </HStack>
          </BottomBar>
        </VStack>
      </AppScreenContent>
    </AppScreen>
  );
}

function Section({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <VStack gap="x3" align="stretch">
      <VStack gap="x1">
        <HStack gap="x1_5" align="center">
          <Text textStyle="t5Bold" color="fg.brand">
            {step}
          </Text>
          <Text as="h2" textStyle="t5Bold" color="fg.neutral">
            {title}
          </Text>
        </HStack>
        {description && (
          <Text textStyle="t3Regular" color="fg.neutralMuted">
            {description}
          </Text>
        )}
      </VStack>
      {children}
    </VStack>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <Box bg="bg.neutralWeak" borderRadius="r3" px="x4" py="x3_5">
      <Text textStyle="t4Regular" color="fg.neutralSubtle">
        {children}
      </Text>
    </Box>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <HStack justify="space-between">
      <Text textStyle="t4Regular" color="fg.neutralMuted">
        {label}
      </Text>
      <Text textStyle="t4Medium" color="fg.neutral">
        {value}
      </Text>
    </HStack>
  );
}

export default BookingActivity;
