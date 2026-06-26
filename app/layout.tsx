import type { Metadata } from "next";
import localFont from "next/font/local";
import ClientLayout from "@/provider/client-layout";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${oldschool.variable} antialiased font-poppins font-oldschool`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
