import { photoUrl } from "../data/products";

/** 상품 사진. 목록 썸네일은 작게, 상세 캐러셀은 크게 받아요. */
export function ProductPhoto({
  photoId,
  alt,
  size = "large",
}: {
  photoId: string;
  alt: string;
  size?: "small" | "large";
}) {
  const px = size === "large" ? 860 : 200;
  return (
    <img
      className="photo"
      src={photoUrl(photoId, px)}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}
