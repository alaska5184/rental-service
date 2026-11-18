import { useRef, useState } from "react";
import { ProductPhoto } from "./ProductPhoto";

/**
 * Seed Design에는 이미지 캐러셀 컴포넌트가 없어서
 * CSS scroll-snap으로 좌우 스와이프 캐러셀을 만들고 Seed 토큰으로 스타일을 맞췄어요.
 */
export function PhotoCarousel({ photos, name }: { photos: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const count = photos.length;

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== active) setActive(index);
  };

  return (
    <div className="carousel" aria-roledescription="carousel" aria-label={`${name} 사진`}>
      <div className="carousel-track" ref={trackRef} onScroll={handleScroll}>
        {photos.map((id, i) => (
          <div
            className="carousel-slide"
            key={id}
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${count}`}
          >
            <ProductPhoto photoId={id} alt={`${name} 사진 ${i + 1}`} />
          </div>
        ))}
      </div>
      {count > 1 && (
        <div className="carousel-dots" aria-hidden>
          {photos.map((id, i) => (
            <span className="carousel-dot" key={id} data-active={i === active} />
          ))}
        </div>
      )}
    </div>
  );
}
