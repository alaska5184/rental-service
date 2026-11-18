import {
  IconCupHeatwaveLine,
  IconHeartLine,
  IconSparkle2Line,
} from "@karrotmarket/react-monochrome-icon";
import { Icon } from "@seed-design/react";
import type { Category } from "../data/products";

const CATEGORY_ICON: Record<Category, React.ReactNode> = {
  cleaner: <IconSparkle2Line />,
  kitchen: <IconCupHeatwaveLine />,
  beauty: <IconHeartLine />,
};

const PHOTO_CAPTIONS = ["정면", "측면", "구성품", "사용 모습"];

/** 실제 사진 대신 쓰는 자리표시 이미지 */
export function ProductPhoto({
  category,
  index,
  size = "large",
}: {
  category: Category;
  index?: number;
  size?: "small" | "large";
}) {
  return (
    <div className="photo" data-category={category} role="img" aria-label="상품 사진">
      <Icon svg={CATEGORY_ICON[category]} size={size === "large" ? "x16" : "x6"} />
      {size === "large" && index !== undefined && (
        <span className="photo-caption">{PHOTO_CAPTIONS[index % PHOTO_CAPTIONS.length]}</span>
      )}
    </div>
  );
}
