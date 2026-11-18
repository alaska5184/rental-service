import "@seed-design/css/base.css";
import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SnackbarProvider } from "seed-design/ui/snackbar";
import { Stack } from "./stackflow";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SnackbarProvider>
      <div className="app-frame">
        <Stack />
      </div>
    </SnackbarProvider>
  </StrictMode>,
);
