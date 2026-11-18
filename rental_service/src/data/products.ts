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
  /** 대여 요금 (원) */
  prices: { h4: number; h8: number; day: number };
  /** 대여자가 보유한 수량 */
  stock: number;
  /** 보증금 (원), 반납 확인 후 돌려받음 */
  deposit: number;
  /** 캐러셀 사진 장 수 (사진 자리표시 이미지로 표현) */
  photoCount: number;
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
    name: "무선 청소기 V15 디텍트",
    brand: "다이슨",
    category: "cleaner",
    lender: { nickname: "깔끔한고양이", neighborhood: "역삼동", mannerTemp: 42.3 },
    purchasedAt: "2025년 3월",
    prices: { h4: 6000, h8: 9000, day: 15000 },
    stock: 1,
    deposit: 100000,
    photoCount: 4,
    bookings: [
      { start: at(0, 10), end: at(0, 18), quantity: 1 },
      { start: at(2, 9), end: at(4, 9), quantity: 1 },
    ],
  },
  {
    id: "p2",
    name: "비스포크 제트 AI 청소기",
    brand: "삼성전자",
    category: "cleaner",
    lender: { nickname: "역삼동살림꾼", neighborhood: "역삼동", mannerTemp: 38.1 },
    purchasedAt: "2025년 9월",
    prices: { h4: 7000, h8: 10000, day: 16000 },
    stock: 1,
    deposit: 100000,
    photoCount: 3,
    bookings: [{ start: at(1, 9), end: at(3, 9), quantity: 1 }],
  },
  {
    id: "p3",
    name: "로봇청소기 S8 MaxV Ultra",
    brand: "로보락",
    category: "cleaner",
    lender: { nickname: "로봇덕후", neighborhood: "도곡동", mannerTemp: 51.0 },
    purchasedAt: "2024년 11월",
    prices: { h4: 9000, h8: 14000, day: 22000 },
    stock: 1,
    deposit: 150000,
    photoCount: 3,
    bookings: [],
  },
  {
    id: "p4",
    name: "에어프라이어 오븐 12L",
    brand: "쿠쿠",
    category: "kitchen",
    lender: { nickname: "주말요리사", neighborhood: "역삼동", mannerTemp: 36.8 },
    purchasedAt: "2024년 5월",
    prices: { h4: 3000, h8: 5000, day: 8000 },
    stock: 2,
    deposit: 30000,
    photoCount: 3,
    bookings: [{ start: at(0, 12), end: at(0, 20), quantity: 1 }],
  },
  {
    id: "p5",
    name: "전자동 커피머신 마니피카 S",
    brand: "드롱기",
    category: "kitchen",
    lender: { nickname: "라떼한잔", neighborhood: "개포동", mannerTemp: 44.5 },
    purchasedAt: "2025년 1월",
    prices: { h4: 5000, h8: 8000, day: 12000 },
    stock: 1,
    deposit: 80000,
    photoCount: 4,
    bookings: [{ start: at(1, 14), end: at(1, 22), quantity: 1 }],
  },
  {
    id: "p6",
    name: "초고속 블렌더 E310",
    brand: "바이타믹스",
    category: "kitchen",
    lender: { nickname: "스무디장인", neighborhood: "역삼동", mannerTemp: 39.2 },
    purchasedAt: "2023년 12월",
    prices: { h4: 4000, h8: 6000, day: 10000 },
    stock: 1,
    deposit: 50000,
    photoCount: 2,
    bookings: [],
  },
  {
    id: "p7",
    name: "슈퍼소닉 헤어드라이어",
    brand: "다이슨",
    category: "beauty",
    lender: { nickname: "단발머리", neighborhood: "도곡동", mannerTemp: 40.7 },
    purchasedAt: "2025년 6월",
    prices: { h4: 4000, h8: 6000, day: 9000 },
    stock: 1,
    deposit: 50000,
    photoCount: 3,
    bookings: [{ start: at(0, 9), end: at(1, 9), quantity: 1 }],
  },
  {
    id: "p8",
    name: "LED 마스크 프라엘 더마",
    brand: "LG전자",
    category: "beauty",
    lender: { nickname: "피부관리중", neighborhood: "역삼동", mannerTemp: 37.4 },
    purchasedAt: "2024년 8월",
    prices: { h4: 5000, h8: 8000, day: 12000 },
    stock: 1,
    deposit: 80000,
    photoCount: 3,
    bookings: [],
  },
  {
    id: "p9",
    name: "마사지건 하이퍼볼트 2 Pro",
    brand: "테라건",
    category: "beauty",
    lender: { nickname: "헬린이탈출", neighborhood: "개포동", mannerTemp: 45.9 },
    purchasedAt: "2025년 4월",
    prices: { h4: 3000, h8: 5000, day: 7000 },
    stock: 3,
    deposit: 30000,
    photoCount: 2,
    bookings: [{ start: at(0, 9), end: at(2, 9), quantity: 2 }],
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
