import { IconBellLine, IconChevronDownSmallLine } from "@karrotmarket/react-monochrome-icon";
import { Box, HStack, Icon, Text, VStack } from "@seed-design/react";
import { useFlow, type StaticActivityComponentType } from "@stackflow/react";
import { Fragment, useState } from "react";
import { AppBar, AppBarIconButton, AppBarLeft, AppBarRight } from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { ChipTabsList, ChipTabsRoot, ChipTabsTrigger } from "seed-design/ui/chip-tabs";
import { List, ListButtonItem, ListDivider } from "seed-design/ui/list";
import { ProductPhoto } from "../components/ProductPhoto";
import { CATEGORY_LABEL, PRODUCTS, type Category, type Product } from "../data/products";
import { firstAvailableDate, formatAvailableFrom, formatWon } from "../lib/rental";
import { useStore } from "../lib/store";

type Filter = "all" | Category;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "cleaner", label: CATEGORY_LABEL.cleaner },
  { value: "kitchen", label: CATEGORY_LABEL.kitchen },
  { value: "beauty", label: CATEGORY_LABEL.beauty },
];

const ProductListActivity: StaticActivityComponentType<"ProductListActivity"> = () => {
  const { push } = useFlow();
  const [filter, setFilter] = useState<Filter>("all");
  const reservations = useStore((s) => s.reservations);

  const products = PRODUCTS.filter((p) => filter === "all" || p.category === filter);

  return (
    <AppScreen>
      <AppBar>
        <AppBarLeft>
          <HStack gap="x1" px="x1">
            <Text textStyle="t6Bold" color="fg.neutral">
              역삼동
            </Text>
            <Icon svg={<IconChevronDownSmallLine />} size="x5" color="fg.neutral" />
          </HStack>
        </AppBarLeft>
        <AppBarRight>
          <AppBarIconButton aria-label="알림">
            <IconBellLine />
          </AppBarIconButton>
        </AppBarRight>
      </AppBar>
      <AppScreenContent>
        <VStack gap="x1" px="spacingX.globalGutter" pt="x2" pb="x3">
          <Text as="h1" textStyle="t7Bold" color="fg.neutral">
            우리 동네 가전 빌리기
          </Text>
          <Text textStyle="t4Regular" color="fg.neutralMuted">
            자주 안 쓰는 가전, 사기 전에 이웃에게 빌려서 써보세요
          </Text>
        </VStack>

        <ChipTabsRoot value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <ChipTabsList>
            {FILTERS.map((f) => (
              <ChipTabsTrigger key={f.value} value={f.value}>
                {f.label}
              </ChipTabsTrigger>
            ))}
          </ChipTabsList>
        </ChipTabsRoot>

        <List pt="x2">
          {products.map((product, i) => {
            const myBookings = reservations
              .filter((r) => r.productId === product.id)
              .map((r) => ({ start: r.start, end: r.end, quantity: r.quantity }));
            return (
              <Fragment key={product.id}>
                {i > 0 && <ListDivider />}
                <ProductRow
                  product={product}
                  availableFrom={formatAvailableFrom(firstAvailableDate(product, myBookings))}
                  onClick={() => push("ProductDetailActivity", { productId: product.id })}
                />
              </Fragment>
            );
          })}
        </List>
      </AppScreenContent>
    </AppScreen>
  );
};

function ProductRow({
  product,
  availableFrom,
  onClick,
}: {
  product: Product;
  availableFrom: string;
  onClick: () => void;
}) {
  return (
    <ListButtonItem
      alignItems="flex-start"
      onClick={onClick}
      prefix={
        <Box
          width="x16"
          height="x16"
          borderRadius="r3"
          overflowX="hidden"
          overflowY="hidden"
          flexShrink={0}
        >
          <ProductPhoto photoId={product.photos[0]} alt={product.name} size="small" />
        </Box>
      }
      title={product.name}
      detail={
        <VStack as="span" gap="x1" align="flex-start">
          <Text as="span" textStyle="t3Regular" color="fg.neutralMuted">
            {product.brand} · {product.lender.nickname}
          </Text>
          <Text as="span" textStyle="t3Medium" color="fg.brand">
            {availableFrom}
          </Text>
          <Text as="span" textStyle="t5Bold" color="fg.neutral">
            1일 {formatWon(product.prices.day)}~
          </Text>
        </VStack>
      }
    />
  );
}

export default ProductListActivity;
