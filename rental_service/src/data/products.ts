export type Category = "cleaner" | "kitchen" | "beauty";

export const CATEGORY_LABEL: Record<Category, string> = {
  cleaner: "청소기류",
  kitchen: "주방 가전",
  beauty: "뷰티·헬스",
};

export interface Lender {
  nickname: string;
  neighborhood: string;
  mannerTemp: number;
  /** 휴대폰 본인인증 완료 */
  verified: boolean;
}

export interface Booking {
  /** epoch ms */
  start: number;
  /** epoch ms */
  end: number;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  lender: Lender;
  /** 구매시기 (예: 2025년 3월) */
  purchasedAt: string;
  /** 한 줄 소개 (2줄) */
  description: string;
  /** 대여 요금 (원): 1일, 3일, 5일, 1주일 */
  prices: { d1: number; d3: number; d5: number; d7: number };
  /** 대여자가 보유한 수량 */
  stock: number;
  /** 보증금 (원), 반납 확인 후 돌려받음 */
  deposit: number;
  /** 상품 사진 (Unsplash 사진 ID). 첫 번째가 대표 사진 */
  photos: string[];
  /** 이미 잡혀 있는 예약 */
  bookings: Booking[];
}

/** 오늘 0시 기준으로 dayOffset일 뒤 hour시 */
function at(dayOffset: number, hour: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour);
  return d.getTime();
}

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    description:
      "레이저로 미세먼지까지 보여주는 무선 청소기예요.\n흡입력이 강하고 헤드 3종이 함께 있어요.",
    name: "무선 청소기 V15 디텍트",
    brand: "다이슨",
    category: "cleaner",
    lender: { nickname: "깔끔한고양이", neighborhood: "역삼동", mannerTemp: 42.3, verified: true },
    purchasedAt: "2025년 3월",
    prices: { d1: 15000, d3: 40000, d5: 64000, d7: 84000 },
    stock: 1,
    deposit: 100000,
    photos: [
      "1746645297698-306ef29852ca",
      "1765970101654-337b573142fb",
      "1765970101634-9cb341a94ea0",
      "1765970101531-8d116223af49",
    ],
    bookings: [
      { start: at(0, 10), end: at(0, 18), quantity: 1 },
      { start: at(2, 9), end: at(4, 9), quantity: 1 },
    ],
  },
  {
    id: "p2",
    description:
      "AI가 바닥 종류를 알아서 흡입력을 조절해요.\n청정스테이션으로 먼지통 비우기가 편해요.",
    name: "비스포크 제트 AI 청소기",
    brand: "삼성전자",
    category: "cleaner",
    lender: { nickname: "역삼동살림꾼", neighborhood: "역삼동", mannerTemp: 38.1, verified: true },
    purchasedAt: "2025년 9월",
    prices: { d1: 16000, d3: 43000, d5: 68000, d7: 90000 },
    stock: 1,
    deposit: 100000,
    photos: [
      "1722710070534-e31f0290d8de",
      "1527515637462-cff94eecc1ac",
      "1778062868373-e3cb41963ae5",
    ],
    bookings: [{ start: at(1, 9), end: at(3, 9), quantity: 1 }],
  },
  {
    id: "p3",
    description:
      "물걸레와 흡입을 한 번에 하는 로봇청소기예요.\n자동 먼지 비움·걸레 세척 스테이션 포함이에요.",
    name: "로봇청소기 S8 MaxV Ultra",
    brand: "로보락",
    category: "cleaner",
    lender: { nickname: "로봇덕후", neighborhood: "도곡동", mannerTemp: 51.0, verified: false },
    purchasedAt: "2024년 11월",
    prices: { d1: 22000, d3: 59000, d5: 94000, d7: 123000 },
    stock: 1,
    deposit: 150000,
    photos: [
      "1558317374-067fb5f30001",
      "1558317374-24793bc9f2fb",
      "1762500825301-569628303acb",
    ],
    bookings: [],
  },
  {
    id: "p4",
    description:
      "기름 없이 바삭하게 굽는 12L 오븐형 에어프라이어예요.\n트레이 2단으로 한 번에 많이 조리할 수 있어요.",
    name: "에어프라이어 오븐 12L",
    brand: "쿠쿠",
    category: "kitchen",
    lender: { nickname: "주말요리사", neighborhood: "역삼동", mannerTemp: 36.8, verified: true },
    purchasedAt: "2024년 5월",
    prices: { d1: 8000, d3: 22000, d5: 34000, d7: 45000 },
    stock: 2,
    deposit: 30000,
    photos: [
      "1774074645537-f72f70d40d12",
      "1774074645546-13474e7e6128",
      "1781737857663-f1f14a60ba46",
    ],
    bookings: [{ start: at(0, 12), end: at(0, 20), quantity: 1 }],
  },
  {
    id: "p5",
    description:
      "원두를 갈아서 바로 내려주는 전자동 커피머신이에요.\n우유 스팀으로 라떼까지 만들 수 있어요.",
    name: "전자동 커피머신 마니피카 S",
    brand: "드롱기",
    category: "kitchen",
    lender: { nickname: "라떼한잔", neighborhood: "개포동", mannerTemp: 44.5, verified: true },
    purchasedAt: "2025년 1월",
    prices: { d1: 12000, d3: 32000, d5: 51000, d7: 67000 },
    stock: 1,
    deposit: 80000,
    photos: [
      "1620807773206-49c1f2957417",
      "1583165278997-0250ea5d72e2",
      "1475296204602-08d15839e95f",
      "1616388761741-a5936c6f61f6",
    ],
    bookings: [{ start: at(1, 14), end: at(1, 22), quantity: 1 }],
  },
  {
    id: "p6",
    description:
      "스무디, 수프, 견과류 버터까지 만드는 초고속 블렌더예요.\n2L 대용량 용기로 가족용으로도 충분해요.",
    name: "초고속 블렌더 E310",
    brand: "바이타믹스",
    category: "kitchen",
    lender: { nickname: "스무디장인", neighborhood: "역삼동", mannerTemp: 39.2, verified: true },
    purchasedAt: "2023년 12월",
    prices: { d1: 10000, d3: 27000, d5: 42000, d7: 56000 },
    stock: 1,
    deposit: 50000,
    photos: [
      "1570222094114-d054a817e56b",
      "1622818426197-d54f85b88690",
      "1780511879744-af5e51e70f28",
    ],
    bookings: [],
  },
  {
    id: "p7",
    description:
      "빠르게 말리면서 열 손상을 줄여주는 헤어드라이어예요.\n노즐 5종이 함께 있어요.",
    name: "슈퍼소닉 헤어드라이어",
    brand: "다이슨",
    category: "beauty",
    lender: { nickname: "단발머리", neighborhood: "도곡동", mannerTemp: 40.7, verified: true },
    purchasedAt: "2025년 6월",
    prices: { d1: 9000, d3: 24000, d5: 38000, d7: 50000 },
    stock: 1,
    deposit: 50000,
    photos: [
      "1522338140262-f46f5913618a",
      "1522336284037-91f7da073525",
      "1727364438136-6edc10ef0a52",
    ],
    bookings: [{ start: at(0, 9), end: at(1, 9), quantity: 1 }],
  },
  {
    id: "p8",
    description:
      "집에서 쓰는 LED 피부관리 마스크예요.\n하루 9분, 주 3회 사용을 권장해요.",
    name: "LED 마스크 프라엘 더마",
    brand: "LG전자",
    category: "beauty",
    lender: { nickname: "피부관리중", neighborhood: "역삼동", mannerTemp: 37.4, verified: true },
    purchasedAt: "2024년 8월",
    prices: { d1: 12000, d3: 32000, d5: 51000, d7: 67000 },
    stock: 1,
    deposit: 80000,
    photos: [
      "1720424643394-cf605de24655",
      "1720424643388-0a5f72948ea7",
      "1710839465443-8671ced76e09",
    ],
    bookings: [],
  },
  {
    id: "p9",
    description:
      "근육 뭉침을 풀어주는 무선 마사지건이에요.\n속도 3단계, 헤드 5종이 함께 있어요.",
    name: "마사지건 하이퍼볼트 2 Pro",
    brand: "테라건",
    category: "beauty",
    lender: { nickname: "헬린이탈출", neighborhood: "개포동", mannerTemp: 45.9, verified: true },
    purchasedAt: "2025년 4월",
    prices: { d1: 7000, d3: 19000, d5: 30000, d7: 39000 },
    stock: 3,
    deposit: 30000,
    photos: [
      "1746278925416-9d6c71f55c2d",
      "1755254926874-0512d5ae1a60",
      "1768508236664-3f294aaf7d41",
    ],
    bookings: [{ start: at(0, 9), end: at(2, 9), quantity: 2 }],
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

/** Unsplash 사진 주소 (정사각형으로 잘라서 받기) */
export function photoUrl(photoId: string, size: number): string {
  return `https://images.unsplash.com/photo-${photoId}?w=${size}&h=${size}&fit=crop&auto=format&q=75`;
}

/** 보증금 10만원 이상 고가 제품은 보험이 붙는 '안심 대여' */
export const SAFE_RENTAL_MIN_DEPOSIT = 100000;
/** 안심 대여 보험 보장 한도 (예시 값) */
export const SAFE_RENTAL_COVERAGE = 1000000;

export function isSafeRental(product: Product): boolean {
  return product.deposit >= SAFE_RENTAL_MIN_DEPOSIT;
}
