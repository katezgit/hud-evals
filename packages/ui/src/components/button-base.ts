// Shared base classes for Button + IconButton.
// Both wrap the same <button> element; only the size/shape variants differ.
// Defaults here: font-sans (primary overrides to font-mono) and disabled text token.
// gap, rounded-*, text-*, font-weight, and svg size are injected by size variants.
export const buttonBaseClasses = [
  "inline-flex shrink-0 items-center justify-center",
  "cursor-pointer",
  "whitespace-nowrap",
  "font-sans",
  "transition-colors duration-150",
  "disabled:cursor-not-allowed disabled:text-text-disabled",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0",
] as const
