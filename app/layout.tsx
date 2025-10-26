import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ContextProvider from "@/context";
import { headers } from "next/headers";

const oldschool = localFont({
  src: [
    {
      path: "../public/fonts/oldschool/OldschoolGrotesk-NormalLight.otf",
      weight: "200",
    },
    {
      path: "../public/fonts/oldschool/OldschoolGrotesk-NormalRegular.otf",
      weight: "300",
    },
    {
      path: "../public/fonts/oldschool/OldschoolGrotesk-NormalMedium.otf",
      weight: "400",
    },
    {
      path: "../public/fonts/oldschool/OldschoolGrotesk-NormalBook.otf",
      weight: "500",
    },
    {
      path: "../public/fonts/oldschool/OldschoolGrotesk-NormalBold.otf",
      weight: "600",
    },
  ],
  variable: "--font-oldschool",
});

const oi = localFont({
  src: [
    {
      path: "../public/fonts/oi/Oi-Regular.ttf",
      weight: "400"
    }
  ],
  variable: "--font-oi"
})


export const metadata: Metadata = {
  title: "Flamingo",
  description: "A real-time multiplayer quiz game similar to Kahoot",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie')

  return (
    <html lang="en">
      <body
        className={`${oldschool.variable} antialiased font-poppins font-oldschool`}
      >
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  );
}
