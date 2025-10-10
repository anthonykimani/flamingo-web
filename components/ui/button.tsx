import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { XCircleIcon } from "@phosphor-icons/react"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-md font-book transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-white/70 hover:bg-white text-slate-400 hover:text-black border-2 border-slate-600 hover:border-slate-800 border-b-[6px] border-r-[6px] active:border-b-2 active:border-r-2",
        active:
          "bg-white text-black border-2 border-slate-800 border-b-[6px] border-r-[6px] active:border-b-2 active:border-r-2 w-full",
        primary:
          "bg-sky-400 text-primary-foreground hover:bg-sky-400/90 border-sky-500 border-2 border-b-[6px] border-r-[6px] active:border-b-2 active:border-r-2",
        outline:
          "bg-white text-sky-500 hover:bg-slate-100 border-2",
        destructive:
          "bg-red-500 text-white border-2 border-slate-800 border-b-[6px] border-r-[6px] active:border-b-2 active:border-r-2 w-full"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-14 rounded-xl px-8",
        gametype: "h-[110px] w-full sm:w-[210px] px-8 m-2",
        sidebarquestion: "h-[110px] w-full px-16 mb-2",
        gameanswer: "h-[150px] w-full",
        resultButton: "h-[150px] w-[150px] rounded-full",
        icon: "size-9",
      },
      buttoncolor: {
        gametype: "bg-[#2819DB] text-white border-2 border-[#1a0f8a] border-b-[6px] border-r-[6px] active:border-b-2 active:border-r-2",
        gameCanvas: "bg-[#DA0202] text-white border-2 border-[#8a0101] border-b-[6px] border-r-[6px] active:border-b-2 active:border-r-2",
        transparent: "bg-transparent text-white border-2 border-white/30",
        gamePin: "bg-[#FF9700] text-white border-2 border-[#cc7800] border-b-[6px] border-r-[6px] active:border-b-2 active:border-r-2",
        darkened: "bg-[#E950BE] text-white border-2 border-[#b93d96] border-b-[6px] border-r-[6px] active:border-b-2 active:border-r-2"
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

interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  showDelete?: boolean
  onDelete?: (e: React.MouseEvent) => void
  leftIcon?: React.ReactNode
  centerIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    width,
    buttoncolor,
    asChild = false,
    showDelete = false,
    onDelete,
    children,
    leftIcon,
    centerIcon,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const hasLeftIcon = !!leftIcon
    const hasCenterIcon = !!centerIcon

    return (
      <div className="relative inline-block">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900 pointer-events-none z-10">
            {leftIcon}
          </div>
        )}
        {centerIcon && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-900 pointer-events-none z-10">
            {centerIcon}
          </div>
        )}
        <Comp
          ref={ref}
          data-slot="button"
          className={cn(
            buttonVariants({ variant, size, width, buttoncolor, className }),
            hasLeftIcon && "pl-14",
            hasCenterIcon && "pl-8"
          )}
          {...props}
        >
          {children}
        </Comp>
        {showDelete && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="absolute -top-1 -right-1 bg-white rounded-full border border-black z-10 cursor-pointer hover:bg-gray-100 transition-colors"
            aria-label="Delete question"
          >
            <XCircleIcon size={24} weight="bold" />
          </button>
        )}
      </div>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }