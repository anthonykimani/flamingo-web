import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "flex items-center gap-2 rounded-lg p-2 text-sm font-oldschool",
  {
    variants: {
      variant: {
        wallet: "bg-white text-black border-2 border-slate-800 border-b-[6px] border-r-[6px] active:border-b-2 active:border-r-2",
        guest: "bg-green-100 text-green-800 border-2 border-slate-800 border-b-[4px] border-r-[4px]",
        error: "bg-white/90 text-red-500",
      },
    },
    defaultVariants: {
      variant: "wallet",
    },
  }
)

interface StatusBadgeProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof statusBadgeVariants> {}

function StatusBadge({ className, variant, ...props }: StatusBadgeProps) {
  return (
    <div
      data-slot="status-badge"
      className={cn(statusBadgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { StatusBadge, statusBadgeVariants }
