// shadcn-source: radix-wrap:n/a — thin wrapper over local Input primitive (from-scratch-approved: design-system-architect-2026-06-01) (n/a, 2026-06-01)
import * as React from "react"
import { Search } from "lucide-react"
import { Input, type InputProps } from "./input"

type WithAriaLabel = { "aria-label": string; "aria-labelledby"?: string }
type WithAriaLabelledBy = { "aria-label"?: string; "aria-labelledby": string }

export type SearchInputProps = Omit<
  InputProps,
  "leading" | "type" | "value" | "defaultValue" | "onChange"
> &
  (WithAriaLabel | WithAriaLabelledBy) & {
    icon?: React.ReactNode
    defaultValue?: string
    onLiveChange?: (value: string) => void
    /**
     * Fires when React's scheduler resolves the deferred value
     * (adapts to device speed; no fixed delay).
     */
    onValueChange?: (value: string) => void
  }

const defaultIcon = (
  <Search aria-hidden="true" className="size-4 text-meta-foreground" />
)

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      icon,
      defaultValue = "",
      onLiveChange,
      onValueChange,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState(defaultValue)
    const deferredValue = React.useDeferredValue(value)

    // Skip the initial mount emission — only fire after user has interacted.
    const didInteract = React.useRef(false)

    React.useEffect(() => {
      if (!didInteract.current) return
      onValueChange?.(deferredValue)
    }, [deferredValue, onValueChange])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      didInteract.current = true
      const next = e.target.value
      setValue(next)
      onLiveChange?.(next)
    }

    return (
      <Input
        ref={ref}
        type="search"
        leading={icon === undefined ? defaultIcon : icon}
        value={value}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
