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
  compareDates,
  rangeDayCountAtLeast,
  type DatePickerConstraintContext,
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
import { QuantityPicker } from "seed-design/ui/quantity-picker";
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import { BottomBar } from "../components/BottomBar";
import { getProduct, type Product } from "../data/products";
import {
  DURATION_LABEL,
  PICKUP_HOURS,
  addDays,
  availableUnits,
  dateHasSlot,
  diffDays,
  durationText,
  formatDateTime,
  formatDay,
  formatHour,
  formatWon,
  isSlotAvailable,
  rentalInterval,
  rentalPrice,
  today as getToday,
  unitPrice,
  type Duration,
} from "../lib/rental";
import { createReservation, useMyBookings } from "../lib/store";

const BOOKABLE_DAYS = 60;

const BookingActivity: StaticActivityComponentType<"BookingActivity"> = () => {
  const { productId } = useActivityParams<"BookingActivity">();
  const product = getProduct(productId);
  if (!product) return null;
  return <BookingScreen product={product} />;
};

function BookingScreen({ product }: { product: Product }) {
  const { replace } = useFlow();
  const myBookings = useMyBookings(product.id);
  const today = useMemo(() => getToday(), []);

  // ① 대여 기간
  const [duration, setDuration] = useState<Duration>("h4");
  // ② 날짜 (4·8시간: 하루 선택 / 1일 이상: 받는 날 ~ 돌려주는 날)
  const [date, setDate] = useState<DatePickerDate | undefined>();
  const [range, setRange] = useState<DatePickerRangeValue | undefined>();
  // ③ 받는 시간
  const [hour, setHour] = useState<number | undefined>();
  // ⑤ 수량
  const [quantity, setQuantity] = useState(1);

  const isDayMode = duration === "day";
  const pickupDate = isDayMode ? range?.start : date;
  const days = isDayMode && range?.start && range.end ? diffDays(range.start, range.end) : isDayMode ? 0 : 1;
  const dateReady = isDayMode ? Boolean(range?.start && range?.end) : Boolean(date);

  // 이미 예약된 날짜는 고를 수 없게
  const constraints = useMemo(
    () => [
      dateOnOrAfter(today),
      dateOnOrBefore(addDays(today, BOOKABLE_DAYS)),
      ...(isDayMode
        ? [
            rangeDayCountAtLeast(2),
            // 받는 날: 그날부터 하루 이상 빌릴 수 있어야 함
            // 돌려주는 날: 받는 날부터 그날까지 비어 있는 시간이 하나라도 있어야 함
            (candidate: DatePickerDate, ctx: DatePickerConstraintContext) => {
              const start = ctx.rangeStart;
              if (!start || compareDates(candidate, start) <= 0) {
                return dateHasSlot(product, candidate, "day", myBookings);
              }
              const n = diffDays(start, candidate);
              return PICKUP_HOURS.some((h) =>
                isSlotAvailable(product, start, h, "day", n, myBookings),
              );
            },
          ]
        : [excludeDates((d) => !dateHasSlot(product, d, duration, myBookings))]),
    ],
    [today, product, duration, myBookings, isDayMode],
  );

  // ③ 받는 시간: 반납 시간까지 다른 예약과 겹치면 막기
  const slotAvailability = useMemo(() => {
    if (!pickupDate || !dateReady) return new Map<number, boolean>();
    return new Map(
      PICKUP_HOURS.map((h) => [
        h,
        isSlotAvailable(product, pickupDate, h, duration, days, myBookings),
      ]),
    );
  }, [pickupDate, dateReady, product, duration, days, myBookings]);

  const interval =
    pickupDate && dateReady && hour !== undefined && slotAvailability.get(hour)
      ? rentalInterval(pickupDate, hour, duration, days)
      : undefined;

  // ⑤ 수량: 그 시간에 남아 있는 수량까지만
  const maxQuantity = interval
    ? availableUnits(product, interval.start, interval.end, myBookings)
    : product.stock;
  const safeQuantity = Math.min(quantity, Math.max(1, maxQuantity));

  const price = interval ? rentalPrice(product, duration, days, safeQuantity) : 0;
  const deposit = product.deposit * safeQuantity;
  const total = price + deposit;

  const changeDuration = (next: Duration) => {
    setDuration(next);
    setHour(undefined);
    if (next === "day") {
      const start = date ?? range?.start;
      if (!start || !dateHasSlot(product, start, "day", myBookings)) {
        setRange(undefined);
      } else {
        const oneDayAvailable = PICKUP_HOURS.some((h) =>
          isSlotAvailable(product, start, h, "day", 1, myBookings),
        );
        setRange(oneDayAvailable ? { start, end: addDays(start, 1) } : { start });
      }
    } else {
      setDate(date ?? range?.start);
    }
  };

  const submit = () => {
    if (!interval) return;
    const reservation = createReservation({
      productId: product.id,
      start: interval.start,
      end: interval.end,
      duration,
      days,
      quantity: safeQuantity,
      rentalPrice: price,
      deposit,
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
            <Section step={1} title="대여 기간">
              <SegmentedControl
                aria-label="대여 기간"
                value={duration}
                onValueChange={(v) => changeDuration(v as Duration)}
                style={{ width: "100%" }}
              >
                {(Object.keys(DURATION_LABEL) as Duration[]).map((d) => (
                  <SegmentedControlItem key={d} value={d}>
                    {DURATION_LABEL[d]}
                  </SegmentedControlItem>
                ))}
              </SegmentedControl>
              <Text textStyle="t3Regular" color="fg.neutralMuted">
                4시간 {formatWon(unitPrice(product, "h4"))} · 8시간{" "}
                {formatWon(unitPrice(product, "h8"))} · 1일 {formatWon(unitPrice(product, "day"))}
              </Text>
            </Section>

            {/* ② 날짜 */}
            <Section
              step={2}
              title={isDayMode ? "받는 날 · 돌려주는 날" : "날짜"}
              description={
                isDayMode
                  ? "받는 날을 누르고, 돌려주는 날을 눌러주세요"
                  : "회색 날짜는 이미 예약이 차 있어요"
              }
            >
              <Box>
                {isDayMode ? (
                  <DatePicker
                    key="range"
                    selectionMode="range"
                    today={today}
                    defaultValue={range}
                    onValueChange={(v) => {
                      setRange(v ?? undefined);
                      setHour(undefined);
                    }}
                    constraints={constraints}
                  />
                ) : (
                  <DatePicker
                    key="single"
                    today={today}
                    defaultValue={date}
                    onValueChange={(v) => {
                      setDate(v ?? undefined);
                      setHour(undefined);
                    }}
                    constraints={constraints}
                  />
                )}
              </Box>
              {isDayMode && range?.start && (
                <Text textStyle="t4Medium" color="fg.brand">
                  {formatDay(range.start)} ~ {range.end ? `${formatDay(range.end)} · ${days}일` : "돌려주는 날을 선택해 주세요"}
                </Text>
              )}
            </Section>

            {/* ③ 받는 시간 */}
            <Section step={3} title="받는 시간" description="돌려주는 시간은 자동으로 계산돼요">
              {dateReady ? (
                <Chip.RadioRoot
                  aria-label="받는 시간"
                  value={hour !== undefined ? String(hour) : ""}
                  onValueChange={(v) => setHour(Number(v))}
                >
                  <Grid columns={4} gap="x2" width="full">
                    {PICKUP_HOURS.map((h) => (
                      <Chip.RadioItem
                        key={h}
                        value={String(h)}
                        disabled={!slotAvailability.get(h)}
                        style={{ width: "100%", justifyContent: "center" }}
                      >
                        <Chip.Label>{formatHour(h)}</Chip.Label>
                      </Chip.RadioItem>
                    ))}
                  </Grid>
                </Chip.RadioRoot>
              ) : (
                <Placeholder>날짜를 먼저 선택해 주세요</Placeholder>
              )}
            </Section>

            {/* ④ 돌려주는 시간 (자동) */}
            <Section step={4} title="돌려주는 시간">
              {interval ? (
                <Box bg="bg.brandWeak" borderRadius="r3" px="x4" py="x3_5">
                  <VStack gap="x1">
                    <HStack justify="space-between">
                      <Text textStyle="t4Regular" color="fg.neutralMuted">
                        받는 시간
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
              ) : (
                <Placeholder>받는 시간을 고르면 자동으로 계산돼요</Placeholder>
              )}
            </Section>

            {/* ⑤ 수량 */}
            <Section step={5} title="수량" description={`대여자가 ${product.stock}개 가지고 있어요`}>
              <HStack justify="space-between" align="center" gap="x3">
                <Text textStyle="t4Regular" color="fg.neutralMuted">
                  {interval
                    ? `이 시간에 ${maxQuantity}개까지 빌릴 수 있어요`
                    : "시간을 고르면 빌릴 수 있는 수량이 보여요"}
                </Text>
                <QuantityPicker
                  aria-label="대여 수량"
                  min={1}
                  max={Math.max(1, maxQuantity)}
                  value={safeQuantity}
                  onValueChange={(v) => setQuantity(v)}
                  disabled={!interval || maxQuantity <= 1}
                />
              </HStack>
            </Section>

            {/* 금액 */}
            {interval && (
              <VStack gap="x3">
                <Divider />
                <PriceRow
                  label={`대여료 (${durationText(duration, days)} × ${safeQuantity}개)`}
                  value={formatWon(price)}
                />
                <PriceRow label={`보증금 (${safeQuantity}개)`} value={formatWon(deposit)} />
                <Callout
                  tone="informative"
                  description="보증금은 물건을 돌려주고 대여자가 상태를 확인하면 돌려받아요. 예약은 대여자가 수락하면 확정돼요."
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
              <ActionButton
                variant="brandSolid"
                size="large"
                disabled={!interval}
                onClick={submit}
              >
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
