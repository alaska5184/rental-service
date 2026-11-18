import { Box, HStack, Text, VStack } from "@seed-design/react";
import { useFlow, type StaticActivityComponentType } from "@stackflow/react";
import { useActivityParams } from "@stackflow/react";
import { ActionButton } from "seed-design/ui/action-button";
import { AppBar, AppBarBackButton, AppBarLeft } from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { Avatar } from "seed-design/ui/avatar";
import { IdentityPlaceholder } from "seed-design/ui/identity-placeholder";
import { MannerTempBadge } from "seed-design/ui/manner-temp-badge";
import { BottomBar } from "../components/BottomBar";
import { PhotoCarousel } from "../components/PhotoCarousel";
import { getProduct, isSafeRental } from "../data/products";
import { SafeRentalBadge, VerifiedBadge } from "../components/TrustBadges";
import { DURATION_LABEL, formatWon, rentalPrice, type Duration } from "../lib/rental";
import { PriceComparison } from "../components/PriceComparison";
import { RentalNotices } from "../components/RentalNotices";
import { useState } from "react";

const ProductDetailActivity: StaticActivityComponentType<"ProductDetailActivity"> = () => {
  const { productId } = useActivityParams<"ProductDetailActivity">();
  const { push } = useFlow();
  const product = getProduct(productId);
  const [duration, setDuration] = useState<Duration>(1);

  if (!product) {
    return (
      <AppScreen>
        <AppBar>
          <AppBarLeft>
            <AppBarBackButton />
          </AppBarLeft>
        </AppBar>
        <AppScreenContent>
          <Box p="x6">
            <Text>상품을 찾을 수 없어요.</Text>
          </Box>
        </AppScreenContent>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <AppBar>
        <AppBarLeft>
          <AppBarBackButton />
        </AppBarLeft>
      </AppBar>
      <AppScreenContent>
        <VStack minHeight="full">
          {/* 상품 사진 (캐러셀) */}
          <PhotoCarousel photos={product.photos} name={product.name} />

          {/* 대여자 닉네임 + 매너온도 */}
          <HStack
            gap="x3"
            px="spacingX.globalGutter"
            py="x4"
            borderBottomWidth={1}
            borderColor="stroke.neutralSubtle"
          >
            <Avatar size="42" fallback={<IdentityPlaceholder />} />
            <VStack gap="x0_5" flexGrow={1}>
              <HStack gap="x1_5" align="center">
                <Text textStyle="t5Bold" color="fg.neutral">
                  {product.lender.nickname}
                </Text>
                <VerifiedBadge verified={product.lender.verified} />
              </HStack>
              <Text textStyle="t3Regular" color="fg.neutralMuted">
                {product.lender.neighborhood}
              </Text>
            </VStack>
            <MannerTempBadge temperature={product.lender.mannerTemp} />
          </HStack>

          {/* 브랜드 · 구매시기 */}
          <VStack gap="x4" px="spacingX.globalGutter" py="x5" flexGrow={1}>
            <VStack gap="x1">
              <HStack gap="x1_5" align="center">
                <Text textStyle="t4Medium" color="fg.neutralMuted">
                  {product.brand}
                </Text>
                {isSafeRental(product) && <SafeRentalBadge />}
              </HStack>
              <Text as="h1" textStyle="t7Bold" color="fg.neutral">
                {product.name}
              </Text>
              <Text
                textStyle="t4Regular"
                color="fg.neutralMuted"
                maxLines={2}
                style={{ whiteSpace: "pre-line", marginTop: "var(--seed-dimension-x1)" }}
              >
                {product.description}
              </Text>
            </VStack>
            <VStack gap="x2">
              <InfoRow label="브랜드" value={product.brand} />
              <InfoRow label="대여자" value={product.lender.nickname} />
              <InfoRow label="구매시기" value={product.purchasedAt} />
            </VStack>

            <Box pt="x4">
              <PriceComparison product={product} selected={duration} onSelect={setDuration} />
            </Box>

            <Box pt="x4" pb="x4">
              <RentalNotices product={product} />
            </Box>
          </VStack>

          <BottomBar>
            <HStack gap="x3" align="center">
              <VStack gap="x0_5" flexGrow={1}>
                <Text textStyle="t5Bold" color="fg.neutral">
                  {formatWon(rentalPrice(product, duration))}
                </Text>
                <Text textStyle="t2Regular" color="fg.neutralMuted">
                  {DURATION_LABEL[duration]} 대여
                </Text>
              </VStack>
              <ActionButton
                variant="neutralWeak"
                size="large"
                onClick={() => push("ChatActivity", { productId: product.id })}
              >
                채팅하기
              </ActionButton>
              <ActionButton
                variant="brandSolid"
                size="large"
                onClick={() => push("BookingActivity", { productId: product.id, duration: String(duration) })}
              >
                대여하기
              </ActionButton>
            </HStack>
          </BottomBar>
        </VStack>
      </AppScreenContent>
    </AppScreen>
  );
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <HStack gap="x4">
      <Box width="x16" flexShrink={0}>
        <Text textStyle="t4Regular" color="fg.neutralMuted">
          {label}
        </Text>
      </Box>
      <Text textStyle="t4Medium" color="fg.neutral">
        {value}
      </Text>
    </HStack>
  );
}

export default ProductDetailActivity;
