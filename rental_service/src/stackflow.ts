import { defineConfig } from "@stackflow/config";
import { seedPlugin } from "@seed-design/stackflow";
import { stackflow } from "@stackflow/react";
import { basicRendererPlugin } from "@stackflow/plugin-renderer-basic";
import { historySyncPlugin } from "@stackflow/plugin-history-sync";
import ProductListActivity from "./activities/ProductListActivity";
import ProductDetailActivity from "./activities/ProductDetailActivity";
import BookingActivity from "./activities/BookingActivity";
import ChatActivity from "./activities/ChatActivity";
import CompleteActivity from "./activities/CompleteActivity";
import ConditionCheckActivity from "./activities/ConditionCheckActivity";

declare module "@stackflow/config" {
  interface Register {
    ProductListActivity: {};
    ProductDetailActivity: { productId: string };
    BookingActivity: { productId: string; duration?: string };
    ChatActivity: { productId: string; reservationId?: string };
    CompleteActivity: { reservationId: string };
    ConditionCheckActivity: { productId: string; reservationId: string };
  }
}

export const config = defineConfig({
  activities: [
    { name: "ProductListActivity", route: "/" },
    { name: "ProductDetailActivity", route: "/products/:productId" },
    { name: "BookingActivity", route: "/products/:productId/booking" },
    { name: "ChatActivity", route: "/chat/:productId" },
    { name: "CompleteActivity", route: "/reservations/:reservationId" },
    { name: "ConditionCheckActivity", route: "/reservations/:reservationId/check" },
  ],
  transitionDuration: 270,
  initialActivity: () => "ProductListActivity",
});

export const { Stack } = stackflow({
  config,
  components: {
    ProductListActivity,
    ProductDetailActivity,
    BookingActivity,
    ChatActivity,
    CompleteActivity,
    ConditionCheckActivity,
  },
  plugins: [
    basicRendererPlugin(),
    seedPlugin({ theme: "cupertino" }),
    historySyncPlugin({
      config,
      fallbackActivity: () => "ProductListActivity",
    }),
  ],
});
