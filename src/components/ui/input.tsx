import { VariantProps, cva } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

// added manually
const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variantSize: {
        default: "h-10 px-3 py-2",
        sm: "h-9 px-2 py-2",
      },
    },
    defaultVariants: {
      variantSize: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
  VariantProps<typeof inputVariants>  {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className,variantSize, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({variantSize,     className}        ))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
