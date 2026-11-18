import { Badge } from "seed-design/ui/badge";

/** 휴대폰 본인인증을 마친 대여자 */
export function VerifiedBadge({ verified }: { verified: boolean }) {
  if (!verified) {
    return (
      <Badge tone="neutral" variant="weak">
        본인인증 전
      </Badge>
    );
  }
  return (
    <Badge tone="positive" variant="weak">
      본인인증
    </Badge>
  );
}

/** 보험이 붙는 고가 제품 */
export function SafeRentalBadge() {
  return (
    <Badge tone="informative" variant="weak">
      안심 대여
    </Badge>
  );
}
