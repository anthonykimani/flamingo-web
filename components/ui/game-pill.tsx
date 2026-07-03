import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const gamePillVariants = cva(
  "inline-flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full font-oldschool",
  {
    variants: {
      variant: {
        default: "text-white/90 text-sm",
        meta: "text-white/80 text-xs uppercase tracking-wider",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface GamePillProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof gamePillVariants> {}

function GamePill({ className, variant, ...props }: GamePillProps) {
  return (
    <span
      data-slot="game-pill"
      className={cn(gamePillVariants({ variant }), className)}
      {...props}
    />
  )
}

export { GamePill, gamePillVariants }
