import React from 'react';
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none",
        {
          "bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700": variant === "default",
          "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
          "border border-gray-200 hover:bg-gray-100 hover:text-gray-900": variant === "outline",
          "hover:bg-gray-100 hover:text-gray-900": variant === "ghost",
          "bg-transparent underline-offset-4 hover:underline": variant === "link",
          "h-10 px-4 py-2": size === "default",
          "h-9 rounded-md px-3": size === "sm",
          "h-11 rounded-md px-8": size === "lg",
        },
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };