import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Primitive } from "@radix-ui/react-primitive";
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    // Added `disableSelectionPrevention`
    VariantProps<typeof labelVariants> & { disableSelectionPrevention?: boolean }
>(({ className, disableSelectionPrevention, ...props }, ref) => {
  const Component = disableSelectionPrevention
    ? Primitive.label
    : LabelPrimitive.Root;

  return (
    <Component
      ref={ref}
      className={cn(labelVariants(), className)}
      {...props}
    />
  );
})
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
