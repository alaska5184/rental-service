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
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { BottomBar } from "../components/BottomBar";
import { getProduct, type Product } from "../data/products";
import {
  DELIVERY_FEE,
  DELIVERY_HOUR,
  DURATIONS,
  DURATION_LABEL,
  MAX_RENTAL_DAYS,
  PICKUP_HOURS,
  RECEIVE_METHOD_LABEL,
  addDays,
  dateHasSlot,
  formatDateOnly,
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
  type ReceiveMethod,
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

  // ① 날짜 (받는 날)
  const [date, setDate] = useState<DatePickerDate | undefined>();
  // ② 대여 기간
  const [durationChoice, setDurationChoice] = useState<Duration | undefined>(initialDuration);
  // ③ 받는 방법 · 시간 · 장소
  const [method, setMethod] = useState<ReceiveMethod>("pickup");
  const [hourChoice, setHourChoice] = useState<number | undefined>();
  const [address, setAddress] = useState("");

  const isDelivery = method === "delivery";

  /** 받는 방법에 따라 이 기간을 고를 수 있는지 */
  const durationAvailable = (d: Duration) => {
    if (!date) return false;
    return isDelivery
      ? isSlotAvailable(product, date, DELIVERY_HOUR, d, myBookings)
      : dateHasSlot(product, date, d, myBookings);
  };
  const duration = durationChoice && durationAvailable(durationChoice) ? durationChoice : undefined;

  const hourAvailable = (h: number) =>
    Boolean(date && duration && isSlotAvailable(product, date, h, duration, myBookings));
  const hour = isDelivery
    ? DELIVERY_HOUR
    : hourChoice !== undefined && hourAvailable(hourChoice)
      ? hourChoice
      : undefined;

  const interval =
    date && duration && hour !== undefined && hourAvailable(hour)
      ? rentalInterval(date, hour, duration)
      : undefined;

  const placeReady = isDelivery ? address.trim().length > 0 : true;
  const ready = Boolean(interval && placeReady);

  /** 달력에 칠할 범위: 받는 날부터 대여 기간만큼 (3일이면 20·21·22일) */
  const lastUseDay = date && duration ? lastRentalDay(date, duration) : date;
  const calendarRange: DatePickerRangeValue | undefined =
    date && lastUseDay ? { start: date, end: lastUseDay } : undefined;

  const price = duration ? rentalPrice(product, duration) : 0;
  const deliveryFee = isDelivery ? DELIVERY_FEE : 0;
  const total = price + deliveryFee + product.deposit;

  // 이미 예약이 찬 날짜는 고를 수 없게
  const constraints = useMemo(
    () => [
      dateOnOrAfter(today),
      dateOnOrBefore(addDays(today, BOOKABLE_DAYS)),
      excludeDates((d) => !dateHasSlot(product, d, 1, myBookings)),
    ],
    [today, product, myBookings],
  );

  const submit = () => {
    if (!interval || !duration || !ready) return;
    const reservation = createReservation({
      productId: product.id,
      start: interval.start,
      end: interval.end,
      duration,
      quantity: 1,
      method,
      address: isDelivery ? address.trim() : undefined,
      rentalPrice: price,
      deliveryFee,
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

            {/* ① 날짜 */}
            <Section step={1} title="받는 날" description="회색 날짜는 이미 예약이 차 있어요">
              {/* 받는 날을 누르면, 고른 대여 기간만큼 달력에 범위로 표시해요 */}
              <DatePicker
                selectionMode="range"
                today={today}
                value={calendarRange}
                onValueChange={(v) => {
                  // 범위의 시작일을 받는 날로 써요 (끝은 대여 기간으로 자동 계산)
                  const next = v?.start;
                  if (next) setDate(next);
                }}
                constraints={constraints}
              />
            </Section>

            {/* ② 대여 기간 */}
            <Section step={2} title="대여 기간" description={`최대 ${MAX_RENTAL_DAYS}일까지 빌릴 수 있어요`}>
              {date ? (
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
              ) : (
                <Placeholder>받는 날을 먼저 선택해 주세요</Placeholder>
              )}
              {date && duration && (
                <VStack gap="x0_5">
                  <Text textStyle="t4Medium" color="fg.brand">
                    {duration === 1
                      ? `${formatDay(date)} · ${DURATION_LABEL[duration]}`
                      : `${formatDay(date)} ~ ${formatDay(lastRentalDay(date, duration))} · ${DURATION_LABEL[duration]}`}
                  </Text>
                  <Text textStyle="t3Regular" color="fg.neutralMuted">
                    {isDelivery
                      ? `${formatDay(lastRentalDay(date, duration))}에 택배로 돌려보내면 돼요`
                      : `${formatDay(lastRentalDay(date, duration))} 밤 ${RETURN_HOUR - 12}시까지 돌려주면 돼요`}
                  </Text>
                </VStack>
              )}
            </Section>

            {/* ③ 받는 방법 · 시간 · 장소 */}
            <Section step={3} title="받는 방법">
              <SegmentedControl
                aria-label="받는 방법"
                value={method}
                onValueChange={(v) => setMethod(v as ReceiveMethod)}
                style={{ width: "100%" }}
              >
                {(Object.keys(RECEIVE_METHOD_LABEL) as ReceiveMethod[]).map((m) => (
                  <SegmentedControlItem key={m} value={m}>
                    {RECEIVE_METHOD_LABEL[m]}
                  </SegmentedControlItem>
                ))}
              </SegmentedControl>

              {isDelivery ? (
                <VStack gap="x3">
                  <TextField
                    label="배송지"
                    value={address}
                    onValueChange={({ value }) => setAddress(value)}
                  >
                    <TextFieldInput placeholder="받을 주소를 입력해 주세요" />
                  </TextField>
                  <Text textStyle="t3Regular" color="fg.neutralMuted">
                    받는 날 오전에 도착해요. 반납일에 택배로 돌려보내 주세요. (왕복 택배비{" "}
                    {formatWon(DELIVERY_FEE)})
                  </Text>
                </VStack>
              ) : (
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
                    받는 시간
                  </Text>
                  {date && duration ? (
                    <Chip.RadioRoot
                      aria-label="받는 시간"
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
                    <Placeholder>날짜와 대여 기간을 먼저 선택해 주세요</Placeholder>
                  )}
                </VStack>
              )}
            </Section>

            {/* 반납 일정 (자동) */}
            {interval && (
              <Box bg="bg.brandWeak" borderRadius="r3" px="x4" py="x3_5">
                <VStack gap="x1">
                  <HStack justify="space-between">
                    <Text textStyle="t4Regular" color="fg.neutralMuted">
                      {isDelivery ? "도착" : "받는 시간"}
                    </Text>
                    <Text textStyle="t4Medium" color="fg.neutral">
                      {isDelivery ? formatDateOnly(interval.start) : formatDateTime(interval.start)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text textStyle="t4Regular" color="fg.neutralMuted">
                      {isDelivery ? "반납 발송" : "돌려주는 시간"}
                    </Text>
                    <Text textStyle="t4Bold" color="fg.brand">
                      {isDelivery ? formatDateOnly(interval.end) : formatDateTime(interval.end)}
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
                {isDelivery && <PriceRow label="왕복 택배비" value={formatWon(deliveryFee)} />}
                <PriceRow label="보증금" value={formatWon(product.deposit)} />
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
