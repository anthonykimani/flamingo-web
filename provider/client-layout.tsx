'use client'

import dynamic from "next/dynamic"

const Providers = dynamic(() => import("@/provider/providers"), { ssr: false })

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
