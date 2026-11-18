import { useRef, useState } from "react";
import type { Category } from "../data/products";
import { ProductPhoto } from "./ProductPhoto";

/**
 * Seed Design에는 이미지 캐러셀 컴포넌트가 없어서
 * CSS scroll-snap으로 좌우 스와이프 캐러셀을 만들고 Seed 토큰으로 스타일을 맞췄어요.
 */
export function PhotoCarousel({ category, count }: { category: Category; count: number }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== active) setActive(index);
  };

  return (
    <div className="carousel" aria-roledescription="carousel" aria-label="상품 사진">
      <div className="carousel-track" ref={trackRef} onScroll={handleScroll}>
        {Array.from({ length: count }, (_, i) => (
          <div
            className="carousel-slide"
            key={i}
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${count}`}
          >
            <ProductPhoto category={category} index={i} />
          </div>
        ))}
      </div>
      {count > 1 && (
        <div className="carousel-dots" aria-hidden>
          {Array.from({ length: count }, (_, i) => (
            <span className="carousel-dot" key={i} data-active={i === active} />
          ))}
        </div>
      )}
    </div>
  );
}
