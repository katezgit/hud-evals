import { render } from "@testing-library/react"
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
  Table,
  TableHeader,
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
  it("contains bg-muted-surface", () => {
    expect(tableHeaderClass).toContain("bg-muted-surface")
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
  it("contains border-t bg-muted-surface font-medium", () => {
    expect(tableFooterClass).toContain("border-t")
    expect(tableFooterClass).toContain("bg-muted-surface")
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

  it("default density includes px-3 and sticky (no per-cell bg — inherits from thead)", () => {
    const cls = tableHeadVariants()
    expect(cls).toContain("sticky")
    expect(cls).not.toContain("bg-background")
    expect(cls).toContain("text-muted-foreground")
    expect(cls).toContain("border-b")
    expect(cls).toContain("uppercase")
    expect(cls).toContain("font-medium")
    expect(cls).toContain("px-3")
  })

  it("compact density includes min-h-8 py-2 px-3", () => {
    const cls = tableHeadVariants({ density: "compact" })
    expect(cls).toContain("min-h-8")
    expect(cls).toContain("py-2")
    expect(cls).toContain("px-3")
  })

  it("default density includes min-h-8 py-2 px-3 (density-invariant 32px header)", () => {
    const cls = tableHeadVariants({ density: "default" })
    expect(cls).toContain("min-h-8")
    expect(cls).toContain("py-2")
    expect(cls).toContain("px-3")
  })
})

// ---------------------------------------------------------------------------
// tableRowVariants
// ---------------------------------------------------------------------------

describe("tableRowVariants", () => {
  it("returns a string", () => {
    expect(typeof tableRowVariants()).toBe("string")
  })

  it("includes hover bg-hover-surface and border-b border-border", () => {
    const cls = tableRowVariants()
    expect(cls).toContain("hover:bg-hover-surface")
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

  it("default density includes min-h-10", () => {
    const cls = tableRowVariants({ density: "default" })
    expect(cls).toContain("min-h-10")
  })

  it("compact density includes min-h-9", () => {
    const cls = tableRowVariants({ density: "compact" })
    expect(cls).toContain("min-h-9")
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

  it("default density includes py-2 px-4", () => {
    const cls = tableCellVariants()
    expect(cls).toContain("py-2")
    expect(cls).toContain("px-4")
  })

  it("compact density includes py-1.5 px-3", () => {
    const cls = tableCellVariants({ density: "compact" })
    expect(cls).toContain("py-1.5")
    expect(cls).toContain("px-3")
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

// ---------------------------------------------------------------------------
// First / last cell inset — pl-6 / pr-6
// ---------------------------------------------------------------------------

describe("tableHeadVariants — first:pl-6 last:pr-6 in base", () => {
  it("includes first:pl-6 in base string (aligns first th with Card/section heading)", () => {
    const cls = tableHeadVariants()
    expect(cls).toContain("first:pl-6")
  })

  it("includes last:pr-6 in base string", () => {
    const cls = tableHeadVariants()
    expect(cls).toContain("last:pr-6")
  })

  it("first:pl-6 is present for both densities", () => {
    expect(tableHeadVariants({ density: "default" })).toContain("first:pl-6")
    expect(tableHeadVariants({ density: "compact" })).toContain("first:pl-6")
  })
})

describe("tableCellVariants — first:pl-6 last:pr-6 in base", () => {
  it("includes first:pl-6 in base string (aligns first td with Card/section heading)", () => {
    const cls = tableCellVariants()
    expect(cls).toContain("first:pl-6")
  })

  it("includes last:pr-6 in base string", () => {
    const cls = tableCellVariants()
    expect(cls).toContain("last:pr-6")
  })

  it("first:pl-6 is present for both densities", () => {
    expect(tableCellVariants({ density: "default" })).toContain("first:pl-6")
    expect(tableCellVariants({ density: "compact" })).toContain("first:pl-6")
  })

  it("first:pl-6 is present for all variants (mono, truncated, row-action)", () => {
    expect(tableCellVariants({ variant: "mono" })).toContain("first:pl-6")
    expect(tableCellVariants({ variant: "truncated" })).toContain("first:pl-6")
    expect(tableCellVariants({ variant: "row-action" })).toContain("first:pl-6")
  })
})

// ---------------------------------------------------------------------------
// Table — bordered prop
// ---------------------------------------------------------------------------

describe("Table bordered prop", () => {
  it("adds border + bg-card to the wrapper when bordered=true", () => {
    const { getByTestId } = render(
      <Table totalCount={0} pageOffset={0} bordered data-testid="table-root" />
    )
    const wrapper = getByTestId("table-root")
    expect(wrapper.className).toContain("border")
    expect(wrapper.className).toContain("rounded-md")
    expect(wrapper.className).toContain("overflow-hidden")
    expect(wrapper.className).toContain("bg-card")
  })

  it("does NOT add border class when bordered is omitted", () => {
    const { getByTestId } = render(
      <Table totalCount={0} pageOffset={0} data-testid="table-root" />
    )
    const wrapper = getByTestId("table-root")
    // Should have the base overflow-x-auto but not the bordered set
    expect(wrapper.className).toContain("overflow-x-auto")
    expect(wrapper.className).not.toContain("rounded-md")
  })
})

// ---------------------------------------------------------------------------
// TableHeader — bg-muted-surface structural band
// ---------------------------------------------------------------------------

describe("TableHeader", () => {
  it("renders with bg-muted-surface regardless of bordered context", () => {
    const { container } = render(
      <table>
        <TableHeader data-testid="thead">
          <tr><th>Col</th></tr>
        </TableHeader>
      </table>
    )
    const thead = container.querySelector("thead")
    expect(thead?.className).toContain("bg-muted-surface")
  })
})
