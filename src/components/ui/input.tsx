import { VariantProps, cva } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

// Created
const inputVariants = cva(
  "flex w-full rounded-md border bg-background text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variantSize: {
        default: "h-10 px-3 py-2",
        sm: "h-9 px-2 py-2",
      },
      state:{
        default: "border-input",
        error: "border-destructive focus-visible:ring-destructive",
      }
    },
    defaultVariants: {
      variantSize: "default",
      state:"default"
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
  VariantProps<typeof inputVariants> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variantSize, state, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({variantSize, state}), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
