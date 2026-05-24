import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "DiasporaFlow",
  description: "Send money home — fast, cheap, direct.",
  other: {
    "talentapp:project_verification": "4ec4db067cdc951ab6f851b28f473e702462607c9b760ab26aed3538d901afcee74321804fa17338fe90bbb0a0b9affedaa69e5aafea9a544e5d8bc75feb4367",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
