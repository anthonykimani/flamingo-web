import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { Checkbox } from "./checkbox"

const inputVariants = cva(
  "border-2 border-slate-800 border-b-6 border-r-6 h-9 w-full min-w-0 rounded-xl bg-white px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-lg ",
  {
    variants: {
      variant: {
        title: "h-14 w-full text-center text-3xl md:text-2xl",
        question: "h-[110px] w-full text-center text-md md:text-3xl placeholder:text-md placeholder:text-3xl",
        answer: "h-[110px] w-full text-center text-md md:text-2xl placeholder:text-md placeholder:text-2xl"
      }
    }
  }
)

interface InputProps extends React.ComponentProps<"input">, VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightCheckbox?: boolean
  checkboxChecked?: boolean
  onCheckboxChange?: (checked: boolean) => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, leftIcon, rightCheckbox, checkboxChecked, onCheckboxChange, placeholder, ...props }, ref) => {
    const hasLeftIcon = !!leftIcon
    const hasRightCheckbox = !!rightCheckbox

    return (
      <div className="relative w-full flex items-center justify-around">
        {leftIcon && (
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-900 pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          type={type}
          data-slot="input"
          ref={ref}
          placeholder={placeholder}
          className={cn(
            inputVariants({ variant }),
            hasLeftIcon && "pl-14",
            hasRightCheckbox && "pr-14",
            className
          )}
          {...props}
        />
        
        {rightCheckbox && (
          <div className="absolute right-8 flex">
            <Checkbox 
              checked={checkboxChecked}
              onCheckedChange={onCheckboxChange}
            />
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input, inputVariants }