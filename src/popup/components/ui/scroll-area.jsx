// src/popup/components/ui/scroll-area.jsx
import * as React from "react"
import { cn } from "../../lib/utils"

const ScrollArea = React.forwardRef((props, ref) => {
  const { className, children, ...otherProps } = props
  
  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...otherProps}
    >
      <div className="h-full w-full overflow-auto">
        {children}
      </div>
    </div>
  )
})

ScrollArea.displayName = "ScrollArea"

export { ScrollArea }