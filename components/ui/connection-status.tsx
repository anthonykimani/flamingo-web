import * as React from "react"
import { cn } from "@/lib/utils"

function ConnectionStatus({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="connection-status"
      className={cn(
        "absolute top-4 right-4 bg-black/50 text-white text-xs p-2 rounded space-y-0.5",
        className
      )}
      {...props}
    />
  )
}

export { ConnectionStatus }
