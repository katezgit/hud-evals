import {
  tableClass,
  tableHeaderClass,
  tableBodyClass,
  tableFooterClass,
  tableCaptionClass,
  tableHeadVariants,
  tableRowVariants,
  tableCellVariants,
  tableEmptyCellClass,
} from "./table"

// ---------------------------------------------------------------------------
// tableClass
// ---------------------------------------------------------------------------

describe("tableClass", () => {
  it("contains w-full border-collapse bg-background", () => {
    expect(tableClass).toContain("w-full")
    expect(tableClass).toContain("border-collapse")
    expect(tableClass).toContain("bg-background")
  })
})

// ---------------------------------------------------------------------------
// tableHeaderClass
// ---------------------------------------------------------------------------

describe("tableHeaderClass", () => {
  it("contains bg-background", () => {
    expect(tableHeaderClass).toContain("bg-background")
  })
})

// ---------------------------------------------------------------------------
// tableBodyClass
// ---------------------------------------------------------------------------

describe("tableBodyClass", () => {
  it("contains last-row no-border rule", () => {
    expect(tableBodyClass).toContain("[&_tr:last-child]:border-b-0")
  })
})

// ---------------------------------------------------------------------------
// tableFooterClass
// ---------------------------------------------------------------------------

describe("tableFooterClass", () => {
  it("contains border-t bg-muted font-medium", () => {
    expect(tableFooterClass).toContain("border-t")
    expect(tableFooterClass).toContain("bg-muted")
    expect(tableFooterClass).toContain("font-medium")
  })
})

// ---------------------------------------------------------------------------
// tableCaptionClass
// ---------------------------------------------------------------------------

describe("tableCaptionClass", () => {
  it("contains text-caption text-muted-foreground", () => {
    expect(tableCaptionClass).toContain("text-caption")
    expect(tableCaptionClass).toContain("text-muted-foreground")
  })
})

// ---------------------------------------------------------------------------
// tableHeadVariants
// ---------------------------------------------------------------------------

describe("tableHeadVariants", () => {
  it("returns a string", () => {
    expect(typeof tableHeadVariants()).toBe("string")
  })

  it("default density includes px-4 py-2 and sticky bg-background", () => {
    const cls = tableHeadVariants()
    expect(cls).toContain("sticky")
    expect(cls).toContain("bg-background")
    expect(cls).toContain("text-muted-foreground")
    expect(cls).toContain("border-b")
    expect(cls).toContain("uppercase")
    expect(cls).toContain("font-medium")
    expect(cls).toContain("px-4")
    expect(cls).toContain("py-2")
  })

  it("compact density includes px-3 py-1.5", () => {
    const cls = tableHeadVariants({ density: "compact" })
    expect(cls).toContain("px-3")
    expect(cls).toContain("py-1.5")
  })

  it("default variant does not include compact padding", () => {
    const cls = tableHeadVariants({ density: "default" })
    expect(cls).not.toContain("px-3")
  })
})

// ---------------------------------------------------------------------------
// tableRowVariants
// ---------------------------------------------------------------------------

describe("tableRowVariants", () => {
  it("returns a string", () => {
    expect(typeof tableRowVariants()).toBe("string")
  })

  it("includes hover bg-hover and border-b border-border", () => {
    const cls = tableRowVariants()
    expect(cls).toContain("hover:bg-hover")
    expect(cls).toContain("border-b")
    expect(cls).toContain("border-border")
  })

  it("includes selected-state rail classes", () => {
    const cls = tableRowVariants()
    expect(cls).toContain("data-[state=selected]:border-l-2")
    expect(cls).toContain("data-[state=selected]:border-l-primary")
  })

  it("includes motion transition classes", () => {
    const cls = tableRowVariants()
    expect(cls).toContain("duration-fast")
    expect(cls).toContain("ease-out-standard")
  })

  it("compact density variant returns a string without error", () => {
    expect(typeof tableRowVariants({ density: "compact" })).toBe("string")
  })
})

// ---------------------------------------------------------------------------
// tableCellVariants
// ---------------------------------------------------------------------------

describe("tableCellVariants", () => {
  it("returns a string", () => {
    expect(typeof tableCellVariants()).toBe("string")
  })

  it("default includes align-middle text-foreground font-normal", () => {
    const cls = tableCellVariants()
    expect(cls).toContain("align-middle")
    expect(cls).toContain("text-foreground")
    expect(cls).toContain("font-normal")
  })

  it("default density includes px-4 py-2", () => {
    const cls = tableCellVariants()
    expect(cls).toContain("px-4")
    expect(cls).toContain("py-2")
  })

  it("compact density includes px-3 py-1.5", () => {
    const cls = tableCellVariants({ density: "compact" })
    expect(cls).toContain("px-3")
    expect(cls).toContain("py-1.5")
  })

  it("mono variant includes font-mono text-code", () => {
    const cls = tableCellVariants({ variant: "mono" })
    expect(cls).toContain("font-mono")
    expect(cls).toContain("text-code")
  })

  it("truncated variant includes overflow-hidden text-ellipsis", () => {
    const cls = tableCellVariants({ variant: "truncated" })
    expect(cls).toContain("overflow-hidden")
    expect(cls).toContain("text-ellipsis")
  })

  it("row-action variant includes text-right w-12", () => {
    const cls = tableCellVariants({ variant: "row-action" })
    expect(cls).toContain("text-right")
    expect(cls).toContain("w-12")
  })
})

// ---------------------------------------------------------------------------
// tableEmptyCellClass
// ---------------------------------------------------------------------------

describe("tableEmptyCellClass", () => {
  it("contains py-8 text-center text-muted-foreground", () => {
    expect(tableEmptyCellClass).toContain("py-8")
    expect(tableEmptyCellClass).toContain("text-center")
    expect(tableEmptyCellClass).toContain("text-muted-foreground")
  })
})
