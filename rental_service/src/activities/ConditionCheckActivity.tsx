import { IconCameraLine, IconXmarkLine } from "@karrotmarket/react-monochrome-icon";
import { Box, HStack, Icon, PrefixIcon, Text, VStack } from "@seed-design/react";
import { useActivityParams, useFlow, type StaticActivityComponentType } from "@stackflow/react";
import { useEffect, useRef, useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { AppBar, AppBarBackButton, AppBarLeft, AppBarMain } from "seed-design/ui/app-bar";
import { AppScreen, AppScreenContent } from "seed-design/ui/app-screen";
import { Callout } from "seed-design/ui/callout";
import { Checkbox } from "seed-design/ui/checkbox";
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import { BottomBar } from "../components/BottomBar";
import { getProduct, type Category, type Product } from "../data/products";
import { sendConditionCheck, useStore, type ConditionStage } from "../lib/store";

interface CheckItem {
  id: string;
  label: string;
  hint: string;
}

const CONSUMABLE_ITEM: Record<Category, CheckItem> = {
  cleaner: { id: "consumable", label: "필터·브러시 상태", hint: "먼지통과 필터가 비어 있는지 봐요" },
  kitchen: { id: "consumable", label: "내부 청결 상태", hint: "음식물이 남아 있지 않은지 봐요" },
  beauty: { id: "consumable", label: "헤드·패드 위생 상태", hint: "소독이 되어 있는지 봐요" },
};

function getCheckItems(product: Product): CheckItem[] {
  return [
    { id: "outside", label: "겉면 흠집·파손", hint: "앞·뒤·옆면을 찍어주세요" },
    { id: "parts", label: "구성품", hint: "본체, 충전기, 부속품을 한 장에 모아 찍어요" },
    { id: "power", label: "전원·작동 확인", hint: "켜서 정상적으로 작동하는지 확인해요" },
    CONSUMABLE_ITEM[product.category],
  ];
}

const ConditionCheckActivity: StaticActivityComponentType<"ConditionCheckActivity"> = () => {
  const { productId, reservationId } = useActivityParams<"ConditionCheckActivity">();
  const product = getProduct(productId);
  const reservation = useStore((s) => s.reservations.find((r) => r.id === reservationId));
  if (!product) return null;
  // 반납일이 지났거나 오늘이면 '돌려줄 때'를 기본으로
  const defaultStage: ConditionStage =
    reservation && Date.now() >= reservation.end - 24 * 60 * 60 * 1000 ? "return" : "pickup";
  return <ConditionCheckScreen product={product} defaultStage={defaultStage} />;
};

function ConditionCheckScreen({
  product,
  defaultStage,
}: {
  product: Product;
  defaultStage: ConditionStage;
}) {
  const { pop } = useFlow();
  const items = getCheckItems(product);
  const [stage, setStage] = useState<ConditionStage>(defaultStage);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [photos, setPhotos] = useState<Record<string, string[]>>({});
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  // 미리보기용으로 만든 사진 주소는 화면을 나갈 때 정리
  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(
    () => () => {
      Object.values(photosRef.current)
        .flat()
        .forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const checkedCount = items.filter((it) => checked[it.id]).length;
  const photoCount = Object.values(photos).reduce((sum, list) => sum + list.length, 0);
  const allChecked = checkedCount === items.length;

  const addPhotos = (itemId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setPhotos((prev) => ({ ...prev, [itemId]: [...(prev[itemId] ?? []), ...urls] }));
    // 사진을 찍으면 그 항목은 확인한 걸로 체크
    setChecked((prev) => ({ ...prev, [itemId]: true }));
  };

  const removePhoto = (itemId: string, url: string) => {
    URL.revokeObjectURL(url);
    setPhotos((prev) => ({ ...prev, [itemId]: (prev[itemId] ?? []).filter((u) => u !== url) }));
  };

  const submit = () => {
    sendConditionCheck(product.id, {
      stage,
      items: items.filter((it) => checked[it.id]).map((it) => it.label),
      photoCount,
    });
    pop();
  };

  return (
    <AppScreen>
      <AppBar>
        <AppBarLeft>
          <AppBarBackButton />
        </AppBarLeft>
        <AppBarMain>상태 사진 체크</AppBarMain>
      </AppBar>
      <AppScreenContent>
        <VStack minHeight="full">
          <VStack gap="x6" px="spacingX.globalGutter" pt="x4" pb="x8" flexGrow={1}>
            <VStack gap="x3">
              <Text textStyle="t4Regular" color="fg.neutralMuted">
                {product.name}
              </Text>
              <SegmentedControl
                aria-label="확인 시점"
                value={stage}
                onValueChange={(v) => setStage(v as ConditionStage)}
                style={{ width: "100%" }}
              >
                <SegmentedControlItem value="pickup">받을 때</SegmentedControlItem>
                <SegmentedControlItem value="return">돌려줄 때</SegmentedControlItem>
              </SegmentedControl>
              <Callout
                tone="informative"
                description="대여자와 함께 보면서 체크하세요. 사진은 파손·분실 분쟁이 생겼을 때 근거가 돼요."
              />
            </VStack>

            <VStack gap="x3">
              {items.map((it) => (
                <Box
                  key={it.id}
                  borderWidth={1}
                  borderColor={checked[it.id] ? "stroke.brandWeak" : "stroke.neutralWeak"}
                  borderRadius="r3"
                  px="x4"
                  py="x3_5"
                >
                  <VStack gap="x2_5">
                    <HStack justify="space-between" align="center" gap="x3">
                      <Checkbox
                        label={it.label}
                        checked={Boolean(checked[it.id])}
                        onCheckedChange={(v) =>
                          setChecked((prev) => ({ ...prev, [it.id]: v === true }))
                        }
                      />
                      <ActionButton
                        size="small"
                        variant="neutralWeak"
                        onClick={() => fileInputs.current[it.id]?.click()}
                      >
                        <PrefixIcon svg={<IconCameraLine />} />
                        사진
                      </ActionButton>
                      <input
                        ref={(el) => {
                          fileInputs.current[it.id] = el;
                        }}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        hidden
                        onChange={(e) => {
                          addPhotos(it.id, e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </HStack>
                    <Text textStyle="t3Regular" color="fg.neutralMuted">
                      {it.hint}
                    </Text>
                    {(photos[it.id]?.length ?? 0) > 0 && (
                      <HStack gap="x2" wrap>
                        {photos[it.id].map((url) => (
                          <div className="check-photo" key={url}>
                            <img src={url} alt={`${it.label} 사진`} />
                            <button
                              type="button"
                              aria-label="사진 지우기"
                              onClick={() => removePhoto(it.id, url)}
                            >
                              <Icon svg={<IconXmarkLine />} size="x3" />
                            </button>
                          </div>
                        ))}
                      </HStack>
                    )}
                  </VStack>
                </Box>
              ))}
            </VStack>
          </VStack>

          <BottomBar>
            <HStack gap="x3" align="center">
              <VStack gap="x0_5" flexGrow={1}>
                <Text textStyle="t4Bold" color="fg.neutral">
                  {checkedCount}/{items.length} 확인
                </Text>
                <Text textStyle="t2Regular" color="fg.neutralMuted">
                  사진 {photoCount}장
                </Text>
              </VStack>
              <ActionButton
                variant="brandSolid"
                size="large"
                disabled={!allChecked}
                onClick={submit}
              >
                채팅에 공유하기
              </ActionButton>
            </HStack>
          </BottomBar>
        </VStack>
      </AppScreenContent>
    </AppScreen>
  );
}

export default ConditionCheckActivity;
