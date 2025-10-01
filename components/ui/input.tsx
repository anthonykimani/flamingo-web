import * as React from "react"

import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const inputVariants = cva("border-2 border-slate-800 border-b-6 border-r-6 h-9 w-full min-w-0 rounded-xl bg-white px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none  disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", {
  variants: {
    variant: {
      title: "h-14 w-full"
    }
  }
})

function Input({ className, type, variant, ...props }: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        inputVariants({
          variant, className
        })
      )}
      {...props}
    />
  )
}

export { Input, inputVariants }
