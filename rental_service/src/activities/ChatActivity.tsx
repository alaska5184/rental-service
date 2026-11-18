import { IconPaperplaneFill } from "@karrotmarket/react-monochrome-icon";
import { Box, HStack, Icon, Text, VStack } from "@seed-design/react";
import { useActivityParams, useFlow, type StaticActivityComponentType } from "@stackflow/react";
import { useEffect, useRef, useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { AppBar, AppBarBackButton, AppBarLeft, AppBarMain } from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { Avatar } from "seed-design/ui/avatar";
import { Badge } from "seed-design/ui/badge";
import { IdentityPlaceholder } from "seed-design/ui/identity-placeholder";
import { MannerTempBadge } from "seed-design/ui/manner-temp-badge";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { ProductPhoto } from "../components/ProductPhoto";
import { getProduct, type Product } from "../data/products";
import { durationText, formatDateTime, formatWon } from "../lib/rental";
import {
  getReservation,
  sendMessage,
  shareReservationInChat,
  useStore,
  type ChatMessage,
  type Reservation,
} from "../lib/store";

const EMPTY: ChatMessage[] = [];

const ChatActivity: StaticActivityComponentType<"ChatActivity"> = () => {
  const { productId, reservationId } = useActivityParams<"ChatActivity">();
  const product = getProduct(productId);
  if (!product) return null;
  return <ChatScreen product={product} reservationId={reservationId} />;
};

function ChatScreen({ product, reservationId }: { product: Product; reservationId?: string }) {
  const { push } = useFlow();
  const snackbar = useSnackbarAdapter();
  const messages = useStore((s) => s.chats[product.id] ?? EMPTY);
  const reservations = useStore((s) => s.reservations);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // 예약 완료 화면에서 들어오면 첫 메시지로 예약 카드를 보냄
  useEffect(() => {
    if (!reservationId) return;
    const reservation = getReservation(reservationId);
    if (reservation) shareReservationInChat(reservation);
  }, [reservationId]);

  // 대여자가 수락하면 알려주기
  const confirmedCount = reservations.filter(
    (r) => r.productId === product.id && r.status === "confirmed",
  ).length;
  const prevConfirmed = useRef(confirmedCount);
  useEffect(() => {
    if (confirmedCount > prevConfirmed.current) {
      snackbar.create({
        render: () => <Snackbar variant="positive" message="대여자가 예약을 수락했어요" />,
      });
    }
    prevConfirmed.current = confirmedCount;
  }, [confirmedCount, snackbar]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    sendMessage(product.id, text);
    setDraft("");
  };

  return (
    <AppScreen>
      <AppBar>
        <AppBarLeft>
          <AppBarBackButton />
        </AppBarLeft>
        <AppBarMain>
          <HStack gap="x1_5" align="center" justify="center">
            <Text textStyle="t5Bold" color="fg.neutral">
              {product.lender.nickname}
            </Text>
            <MannerTempBadge temperature={product.lender.mannerTemp} />
          </HStack>
        </AppBarMain>
      </AppBar>
      <AppScreenContent>
        <VStack height="full">
          {/* 대화 중인 상품 */}
          <HStack
            gap="x3"
            px="spacingX.globalGutter"
            py="x3"
            borderBottomWidth={1}
            borderColor="stroke.neutralSubtle"
            align="center"
          >
            <Box width="x10" height="x10" borderRadius="r2" overflowX="hidden" overflowY="hidden" flexShrink={0}>
              <ProductPhoto photoId={product.photos[0]} alt={product.name} size="small" />
            </Box>
            <VStack gap="x0_5" flexGrow={1} minWidth="0">
              <Text textStyle="t4Medium" color="fg.neutral" maxLines={1}>
                {product.name}
              </Text>
              <Text textStyle="t3Bold" color="fg.neutral">
                1일 {formatWon(product.prices.day)}
              </Text>
            </VStack>
            <ActionButton
              size="small"
              variant="neutralWeak"
              onClick={() => push("BookingActivity", { productId: product.id })}
            >
              대여하기
            </ActionButton>
          </HStack>

          {/* 메시지 */}
          <VStack gap="x3" px="spacingX.globalGutter" py="x4" flexGrow={1} overflowY="auto">
            {messages.length === 0 && (
              <VStack align="center" gap="x1" py="x10">
                <Text textStyle="t4Medium" color="fg.neutralMuted">
                  {product.lender.nickname}님과 대화를 시작해보세요
                </Text>
                <Text textStyle="t3Regular" color="fg.neutralSubtle">
                  사용법, 주고받을 장소를 물어보면 좋아요
                </Text>
              </VStack>
            )}
            {messages.map((m) => (
              <MessageRow
                key={m.id}
                message={m}
                product={product}
                reservation={
                  m.reservationId ? reservations.find((r) => r.id === m.reservationId) : undefined
                }
              />
            ))}
            <div ref={bottomRef} />
          </VStack>

          {/* 입력창 */}
          <Box
            as="form"
            onSubmit={submit}
            px="spacingX.globalGutter"
            py="x2_5"
            borderTopWidth={1}
            borderColor="stroke.neutralSubtle"
            bg="bg.layerDefault"
          >
            <HStack gap="x2" align="center">
              <Box flexGrow={1}>
                <TextField
                  value={draft}
                  onValueChange={({ value }) => setDraft(value)}
                  aria-label="메시지 입력"
                >
                  <TextFieldInput placeholder="메시지 보내기" />
                </TextField>
              </Box>
              <ActionButton
                type="submit"
                variant="brandSolid"
                layout="iconOnly"
                aria-label="보내기"
                disabled={!draft.trim()}
              >
                <Icon svg={<IconPaperplaneFill />} />
              </ActionButton>
            </HStack>
          </Box>
        </VStack>
      </AppScreenContent>
    </AppScreen>
  );
}

function formatTime(ms: number) {
  const d = new Date(ms);
  const h = d.getHours();
  return `${h < 12 ? "오전" : "오후"} ${h % 12 === 0 ? 12 : h % 12}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function MessageRow({
  message,
  product,
  reservation,
}: {
  message: ChatMessage;
  product: Product;
  reservation?: Reservation;
}) {
  return (
    <VStack gap="x1_5" align={message.from === "me" ? "flex-end" : "flex-start"}>
      {reservation && <ReservationCard reservation={reservation} product={product} />}
      {message.text && (
        <div className="bubble-row" data-from={message.from}>
          {message.from === "lender" && (
            <Avatar size="36" fallback={<IdentityPlaceholder />} />
          )}
          <div className="bubble" data-from={message.from}>
            {message.text}
          </div>
          <span className="bubble-time">{formatTime(message.at)}</span>
        </div>
      )}
    </VStack>
  );
}

function ReservationCard({ reservation, product }: { reservation: Reservation; product: Product }) {
  const confirmed = reservation.status === "confirmed";
  return (
    <div className="reservation-card">
      <Box px="x4" py="x3" bg="bg.neutralWeak">
        <HStack justify="space-between" align="center">
          <Text textStyle="t3Bold" color="fg.neutral">
            예약 요청
          </Text>
          <Badge tone={confirmed ? "positive" : "warning"} variant="weak">
            {confirmed ? "예약 확정" : "수락 대기"}
          </Badge>
        </HStack>
      </Box>
      <VStack gap="x1" px="x4" py="x3">
        <Text textStyle="t4Bold" color="fg.neutral" maxLines={1}>
          {product.name}
        </Text>
        <Text textStyle="t3Regular" color="fg.neutralMuted">
          {formatDateTime(reservation.start)} ~ {formatDateTime(reservation.end)}
        </Text>
        <Text textStyle="t3Regular" color="fg.neutralMuted">
          {durationText(reservation.duration, reservation.days)} · {reservation.quantity}개 ·{" "}
          {formatWon(reservation.rentalPrice + reservation.deposit)}
        </Text>
      </VStack>
    </div>
  );
}

export default ChatActivity;
