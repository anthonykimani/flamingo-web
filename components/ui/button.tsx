import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-md font-book transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-white/70 hover:bg-white text-slate-400 hover:text-black  border-2 border-slate-600 hover:border-slate-800 border-b-6 border-r-6 active:border-b-2 active:border-r-2",
        active:
          "bg-white text-black border-2 border-slate-800 border-b-6 border-r-6 active:border-b-2 active:border-r-2",
        primary:
          "bg-sky-400 text-primary-foreground hover:bg-sky-400/90 border-sky-500 border-2 border-b-6 border-r-6 active:border-b-2 active:border-r-2",
        outline:
          "bg-white text-sky-500 hover:bg-slate-100"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-14 rounded-xl px-8 ",
        gametype:"h-[110px] w-full sm:w-[210px] px-8 m-2",
        icon: "size-9",
      },
      color: {
        gametype: "bg-[#2819DB] text-white",
        gameCanvas: "bg-[#DA0202] text-white",
        transparent: "bg-transparent text-white"
      },
      width: {
        full: "w-full",
        half: "w-1/2",
        fifth: "w-2/5"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "xl",
    },
  }
)

function Button({
  className,
  variant,
  size,
  width,
  color,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, width, color, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
