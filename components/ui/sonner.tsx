"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      richColors
      className="toaster group font-oldschool"
      style={
        {
          // Default toast: white card, brand chunky border
          "--normal-bg": "#ffffff",
          "--normal-text": "#1e293b",
          "--normal-border": "#1e293b",
          // Variant toasts: full-color, matching the answer buttons
          "--success-bg": "#009900",
          "--success-text": "#ffffff",
          "--success-border": "#006600",
          "--warning-bg": "#FF9700",
          "--warning-text": "#ffffff",
          "--warning-border": "#cc7800",
          "--info-bg": "#2819DB",
          "--info-text": "#ffffff",
          "--info-border": "#1a0f8a",
          "--error-bg": "#ef4444",
          "--error-text": "#ffffff",
          "--error-border": "#b91c1c",
          // Match card/dialog radius
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border-2 group-[.toaster]:border-b-[6px] group-[.toaster]:border-r-[6px]",
          title: "font-oldschool text-base",
          description: "font-poppins text-sm opacity-90",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
