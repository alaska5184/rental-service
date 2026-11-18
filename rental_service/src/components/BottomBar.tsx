import { Box } from "@seed-design/react";

/** 화면 아래에 고정되는 액션 영역 */
export function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <Box
      position="sticky"
      bottom={0}
      bg="bg.layerDefault"
      borderTopWidth={1}
      borderColor="stroke.neutralSubtle"
      px="spacingX.globalGutter"
      pt="x3"
      pb="x4"
      style={{ paddingBottom: "max(var(--seed-dimension-x4), env(safe-area-inset-bottom))" }}
    >
      {children}
    </Box>
  );
}
