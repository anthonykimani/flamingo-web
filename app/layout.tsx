import type { Metadata } from "next";
import localFont from "next/font/local";
import { Poppins } from "next/font/google";
import Providers from "@/provider/providers";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const oldschool = localFont({
  src: [
    {
      path: "../public/fonts/oldschool/OldschoolGrotesk-NormalMedium.otf",
      weight: "400",
    },
    {
      path: "../public/fonts/oldschool/OldschoolGrotesk-NormalBold.otf",
      weight: "700",
    },
  ],
  variable: "--font-oldschool",
  display: "swap",
});

const oi = localFont({
  src: [
    {
      path: "../public/fonts/oi/Oi-Regular.ttf",
      weight: "400"
    }
  ],
  variable: "--font-oi",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Flamingo",
  description: "A real-time multiplayer quiz game similar to Kahoot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${oldschool.variable} ${oi.variable} ${poppins.variable} font-poppins antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
