import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import PrivyProviders from '@/provider'
import { PostHogProvider } from '@/provider/posthog'
import AppKitContextProvider from '@/provider/appkit'
import { headers } from 'next/headers'
import { RainbowKitProviderContainer } from '@/provider/rainbow'

const oldschool = localFont({
  src: [
    {
      path: '../public/fonts/oldschool/OldschoolGrotesk-NormalLight.otf',
      weight: '200',
    },
    {
      path: '../public/fonts/oldschool/OldschoolGrotesk-NormalRegular.otf',
      weight: '300',
    },
    {
      path: '../public/fonts/oldschool/OldschoolGrotesk-NormalMedium.otf',
      weight: '400',
    },
    {
      path: '../public/fonts/oldschool/OldschoolGrotesk-NormalBook.otf',
      weight: '500',
    },
    {
      path: '../public/fonts/oldschool/OldschoolGrotesk-NormalBold.otf',
      weight: '600',
    },
  ],
  variable: '--font-oldschool',
})

const oi = localFont({
  src: [
    {
      path: '../public/fonts/oi/Oi-Regular.ttf',
      weight: '400',
    },
  ],
  variable: '--font-oi',
})

export const metadata: Metadata = {
  title: 'Flamingo',
  description: 'A real-time multiplayer quiz game similar to Kahoot',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookies = (await headers()).get('cookie')

  return (
    <html lang="en">
      <body className={`${oldschool.variable} font-poppins font-oldschool antialiased`}>
        {/* <PrivyProviders> */}
        {/* <AppKitContextProvider cookies={cookies}> */}
        <RainbowKitProviderContainer>
          <PostHogProvider>{children}</PostHogProvider>
        </RainbowKitProviderContainer>
        {/* </AppKitContextProvider> */}

        {/* </PrivyProviders> */}
      </body>
    </html>
  )
}
