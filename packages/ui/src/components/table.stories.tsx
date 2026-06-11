import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { Copy, Pin } from "lucide-react"

import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableSelectionBar,
  TableEmptyRow,
  TableErrorBand,
  TableSkeletonRow,
} from "./table"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card"
import { Checkbox } from "./checkbox"
import { IconButton } from "./icon-button"
import { Button } from "./button"

const meta: Meta = {
  title: "Components/Table",
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof meta>

// ── Fixtures ──────────────────────────────────────────────────────────────────

type RunRow = {
  id: string
  jobId: string
  timestamp: string
  status: "scored" | "running" | "errored" | "not-run"
  reward: number | null
}

const RUNS: RunRow[] = [
  { id: "r1", jobId: "job-8xkp3a",  timestamp: "2026-06-08 14:32",  status: "scored",  reward: 0.812 },
  { id: "r2", jobId: "job-9fmq1b",  timestamp: "2026-06-08 14:28",  status: "scored",  reward: 0.654 },
  { id: "r3", jobId: "job-2zrv7c",  timestamp: "2026-06-08 14:19",  status: "running", reward: null },
  { id: "r4", jobId: "job-5ywt4d",  timestamp: "2026-06-08 13:55",  status: "errored", reward: null },
  { id: "r5", jobId: "job-1pnx6e",  timestamp: "2026-06-08 13:41",  status: "scored",  reward: 0.491 },
]

const STATUS_LABEL: Record<RunRow["status"], string> = {
  scored:  "Scored",
  running: "Running",
  errored: "Errored",
  "not-run": "Not run",
}

const WIDE_RUNS = Array.from({ length: 12 }, (_, i) => ({
  ...RUNS[i % RUNS.length]!,
  id: `r${i + 1}`,
  jobId: `job-${String(i + 1).padStart(4, "0")}xy`,
  model: `frontier-reasoning-v${i % 3 + 1}`,
  env: `env-sandbox-${String(i % 4 + 1).padStart(2, "0")}`,
  duration: `${120 + i * 17}ms`,
}))

// ── Playground ────────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: () => (
    <div style={{ width: 680 }}>
      <Table totalCount={5} pageOffset={0}>
        <TableHeader>
          <tr>
            <TableHeaderCell label="Job ID" sticky="left" />
            <TableHeaderCell label="Timestamp" />
            <TableHeaderCell label="Status" />
            <TableHeaderCell label="Reward" numeric />
            <TableHeaderCell label="" sticky="right" style={{ width: 56 }} />
          </tr>
        </TableHeader>
        <TableBody>
          {RUNS.map((row) => (
            <TableRow key={row.id} outcome={row.status} onDrill={() => {}}>
              <TableCell variant="id" sticky>{row.jobId}</TableCell>
              <TableCell>{row.timestamp}</TableCell>
              <TableCell>{STATUS_LABEL[row.status]}</TableCell>
              <TableCell variant="numeric">{row.reward != null ? row.reward.toFixed(3) : "—"}</TableCell>
              <TableCell className="sticky right-0 bg-background w-14 text-right pr-3">
                <div className="flex items-center justify-end gap-1">
                  <IconButton size="sm" variant="ghost" aria-label={`Copy ID for ${row.jobId}`}>
                    <Copy />
                  </IconButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-2 text-body text-muted-foreground">5 Runs</div>
    </div>
  ),
}

// ── Density Comparison ────────────────────────────────────────────────────────

export const DensityComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-8" style={{ width: 680 }}>
      <div className="flex flex-col gap-2">
        <p className="text-label text-muted-foreground">Default — 40px rows · header 32px in both</p>
        <Table totalCount={3} pageOffset={0} density="default">
          <TableHeader>
            <tr>
              <TableHeaderCell label="Job ID" sticky="left" />
              <TableHeaderCell label="Status" />
              <TableHeaderCell label="Reward" numeric />
              <TableHeaderCell label="" sticky="right" style={{ width: 56 }} />
            </tr>
          </TableHeader>
          <TableBody>
            {RUNS.slice(0, 3).map((row) => (
              <TableRow key={row.id} outcome={row.status}>
                <TableCell variant="id" sticky>{row.jobId}</TableCell>
                <TableCell>{STATUS_LABEL[row.status]}</TableCell>
                <TableCell variant="numeric">{row.reward != null ? row.reward.toFixed(3) : "—"}</TableCell>
                <TableCell className="sticky right-0 bg-background w-14 text-right pr-3">
                  <IconButton size="sm" variant="ghost" aria-label="Copy ID"><Copy /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-label text-muted-foreground">Compact — 36px rows · header 32px in both</p>
        <Table totalCount={3} pageOffset={0} density="compact">
          <TableHeader>
            <tr>
              <TableHeaderCell label="Job ID" sticky="left" />
              <TableHeaderCell label="Status" />
              <TableHeaderCell label="Reward" numeric />
              <TableHeaderCell label="" sticky="right" style={{ width: 56 }} />
            </tr>
          </TableHeader>
          <TableBody>
            {RUNS.slice(0, 3).map((row) => (
              <TableRow key={row.id} outcome={row.status}>
                <TableCell variant="id" sticky>{row.jobId}</TableCell>
                <TableCell>{STATUS_LABEL[row.status]}</TableCell>
                <TableCell variant="numeric">{row.reward != null ? row.reward.toFixed(3) : "—"}</TableCell>
                <TableCell className="sticky right-0 bg-background w-14 text-right pr-3">
                  <IconButton size="sm" variant="ghost" aria-label="Copy ID"><Copy /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  ),
}

// ── Selection ─────────────────────────────────────────────────────────────────

export const Selection: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const toggle = (id: string) =>
      setSelected((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id); else next.add(id)
        return next
      })
    const allSelected = selected.size === RUNS.length
    const someSelected = selected.size > 0 && !allSelected

    return (
      <div style={{ width: 680 }}>
        <Table totalCount={RUNS.length} pageOffset={0}>
          <TableHeader>
            <tr>
              <th className="sticky top-0 left-0 z-table-corner w-10 bg-elevated border-b border-border px-3 align-middle">
                <Checkbox
                  size="sm"
                  aria-label="Select all"
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={() => {
                    if (allSelected) setSelected(new Set())
                    else setSelected(new Set(RUNS.map((r) => r.id)))
                  }}
                />
              </th>
              <TableHeaderCell label="Job ID" />
              <TableHeaderCell label="Status" />
              <TableHeaderCell label="Reward" numeric />
            </tr>
          </TableHeader>
          <TableBody>
            {selected.size > 0 && (
              <TableSelectionBar
                count={selected.size}
                onClear={() => setSelected(new Set())}
                actions={
                  <Button variant="ghost">Archive</Button>
                }
              />
            )}
            {RUNS.map((row) => (
              <TableRow
                key={row.id}
                selected={selected.has(row.id)}
                onDrill={() => {}}
              >
                <td
                  className="sticky left-0 z-table-col w-10 bg-background border-b border-border px-3 align-middle"
                  onClick={(e) => { e.preventDefault(); toggle(row.id) }}
                >
                  <Checkbox
                    size="sm"
                    aria-label={`Select ${row.jobId}`}
                    checked={selected.has(row.id)}
                    onCheckedChange={() => toggle(row.id)}
                  />
                </td>
                <TableCell variant="id">{row.jobId}</TableCell>
                <TableCell>{STATUS_LABEL[row.status]}</TableCell>
                <TableCell variant="numeric">{row.reward != null ? row.reward.toFixed(3) : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  },
}

// ── Sticky scroll ─────────────────────────────────────────────────────────────

export const StickyScroll: Story = {
  name: "Sticky columns (narrow viewport)",
  render: () => (
    <div style={{ width: 460 }}>
      <p className="mb-2 text-label text-muted-foreground">
        ID column sticky-left, actions sticky-right — middle columns truncate + scroll-x.
      </p>
      <Table totalCount={WIDE_RUNS.length} pageOffset={0}>
        <TableHeader>
          <tr>
            <TableHeaderCell label="Job ID" sticky="left" style={{ minWidth: 140 }} />
            <TableHeaderCell label="Model" style={{ minWidth: 180 }} />
            <TableHeaderCell label="Environment" style={{ minWidth: 160 }} />
            <TableHeaderCell label="Duration" numeric style={{ minWidth: 100 }} />
            <TableHeaderCell label="Reward" numeric style={{ minWidth: 80 }} />
            <TableHeaderCell label="" sticky="right" style={{ width: 56 }} />
          </tr>
        </TableHeader>
        <TableBody>
          {WIDE_RUNS.slice(0, 6).map((row) => (
            <TableRow key={row.id} onDrill={() => {}}>
              <TableCell variant="id" sticky>{row.jobId}</TableCell>
              <TableCell className="max-w-[180px] truncate">{row.model}</TableCell>
              <TableCell className="max-w-[160px] truncate">{row.env}</TableCell>
              <TableCell variant="numeric">{row.duration}</TableCell>
              <TableCell variant="numeric">{row.reward != null ? row.reward.toFixed(3) : "—"}</TableCell>
              <TableCell className="sticky right-0 bg-background w-14 text-right pr-3">
                <div className="flex items-center justify-end gap-1">
                  <IconButton size="sm" variant="ghost" aria-label={`Pin ${row.jobId}`}><Pin /></IconButton>
                  <IconButton size="sm" variant="ghost" aria-label={`Copy ${row.jobId}`}><Copy /></IconButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

// ── Empty + Loading + Error ───────────────────────────────────────────────────

export const EmptyLoadingError: Story = {
  name: "Empty / Loading / Error states",
  render: () => (
    <div className="flex flex-col gap-8" style={{ width: 560 }}>
      <div className="flex flex-col gap-2">
        <p className="text-label text-muted-foreground">Empty — CLI command pattern</p>
        <Table totalCount={0} pageOffset={0}>
          <TableHeader>
            <tr>
              <TableHeaderCell label="Job ID" />
              <TableHeaderCell label="Status" />
              <TableHeaderCell label="Reward" numeric />
            </tr>
          </TableHeader>
          <TableBody>
            <TableEmptyRow
              colSpan={3}
              cliCommand="hud eval <taskset>"
              docHref="https://hud.ai/docs/jobs"
            />
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-label text-muted-foreground">Loading — skeleton rows at density height</p>
        <Table totalCount={0} pageOffset={0}>
          <TableHeader>
            <tr>
              <TableHeaderCell label="Job ID" />
              <TableHeaderCell label="Status" />
              <TableHeaderCell label="Reward" numeric />
            </tr>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }, (_, i) => (
              <TableSkeletonRow key={i} colCount={3} />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-label text-muted-foreground">Error — cause stated, no apology</p>
        <Table totalCount={0} pageOffset={0}>
          <TableHeader>
            <tr>
              <TableHeaderCell label="Job ID" />
              <TableHeaderCell label="Status" />
              <TableHeaderCell label="Reward" numeric />
            </tr>
          </TableHeader>
          <TableBody>
            <TableErrorBand
              colSpan={3}
              cause="Failed to load Runs — API timeout. Retry or check status."
              onRetry={() => {}}
            />
          </TableBody>
        </Table>
      </div>
    </div>
  ),
}

// ── Inside Card ───────────────────────────────────────────────────────────────

export const InsideCard: Story = {
  name: "Inside Card (header bg vs card bg)",
  render: () => (
    <div className="flex flex-col gap-6" style={{ width: 560 }}>
      <p className="text-label text-muted-foreground">
        Header inherits bg-background — no elevated band competing with the Card container.
      </p>
      <Card className="overflow-hidden p-0">
        <Table totalCount={3} pageOffset={0}>
          <TableHeader>
            <tr>
              <TableHeaderCell label="Job ID" sticky="left" />
              <TableHeaderCell label="Status" />
              <TableHeaderCell label="Reward" numeric />
            </tr>
          </TableHeader>
          <TableBody>
            {RUNS.slice(0, 3).map((row) => (
              <TableRow key={row.id} outcome={row.status}>
                <TableCell variant="id" sticky>{row.jobId}</TableCell>
                <TableCell>{STATUS_LABEL[row.status]}</TableCell>
                <TableCell variant="numeric">{row.reward != null ? row.reward.toFixed(3) : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <p className="text-label text-muted-foreground">
        Freestanding on page bg — same header bg, reads cleanly.
      </p>
      <Table totalCount={3} pageOffset={0}>
        <TableHeader>
          <tr>
            <TableHeaderCell label="Job ID" sticky="left" />
            <TableHeaderCell label="Status" />
            <TableHeaderCell label="Reward" numeric />
          </tr>
        </TableHeader>
        <TableBody>
          {RUNS.slice(0, 3).map((row) => (
            <TableRow key={row.id} outcome={row.status}>
              <TableCell variant="id" sticky>{row.jobId}</TableCell>
              <TableCell>{STATUS_LABEL[row.status]}</TableCell>
              <TableCell variant="numeric">{row.reward != null ? row.reward.toFixed(3) : "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

// ── Deployment Patterns ───────────────────────────────────────────────────────

export const PatternA_PageSection: Story = {
  name: "Pattern A — Page-section table (bordered)",
  parameters: {
    docs: {
      description: {
        story:
          "Use `<Table bordered>` when the table IS the page section — no Card wrapper. " +
          "The `bordered` prop adds `rounded-md border border-border overflow-hidden` to the outer wrapper, " +
          "giving the table its own chrome. The last body row's `border-b-0` (applied by TableBody) " +
          "ensures no doubled bottom edge inside the outer border.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-3" style={{ width: 560 }}>
      <div>
        <h2 className="text-heading font-semibold text-foreground">API Keys</h2>
        <p className="mt-1 text-body text-muted-foreground">
          Keys are scoped to this workspace. Revoke any key at any time.
        </p>
      </div>
      <Table totalCount={3} pageOffset={0} bordered>
        <TableHeader>
          <tr>
            <TableHeaderCell label="Name" />
            <TableHeaderCell label="Created" />
            <TableHeaderCell label="Last used" />
            <TableHeaderCell label="Scope" />
          </tr>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>prod-ci</TableCell>
            <TableCell>2026-06-01</TableCell>
            <TableCell>2026-06-10</TableCell>
            <TableCell>read:write</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>staging</TableCell>
            <TableCell>2026-05-14</TableCell>
            <TableCell>2026-06-08</TableCell>
            <TableCell>read:write</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>local-dev</TableCell>
            <TableCell>2026-04-20</TableCell>
            <TableCell>2026-06-09</TableCell>
            <TableCell>read:write</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
}

export const PatternB_InsideCard: Story = {
  name: "Pattern B — Card-contained table (no bordered)",
  parameters: {
    docs: {
      description: {
        story:
          "Use plain `<Table>` (no `bordered`) when the table is one panel among others. " +
          "The Card carries its own heading + subtitle and provides all outer chrome via `border` + `bg-panel`. " +
          "The table adds no outer border — the Card IS the container. " +
          "Use `overflow-hidden p-0` on the Card so the table flush-fills the card's rounded corners.",
      },
    },
  },
  render: () => (
    <div style={{ width: 560 }}>
      <Card className="overflow-hidden p-0">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle>Billing history</CardTitle>
          <CardDescription>Invoices for the last 12 months.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table totalCount={3} pageOffset={0}>
            <TableHeader>
              <tr>
                <TableHeaderCell label="Invoice" />
                <TableHeaderCell label="Date" />
                <TableHeaderCell label="Amount" numeric />
                <TableHeaderCell label="Status" />
              </tr>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell variant="id">INV-0042</TableCell>
                <TableCell>2026-06-01</TableCell>
                <TableCell variant="numeric">$120.00</TableCell>
                <TableCell>Paid</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="id">INV-0041</TableCell>
                <TableCell>2026-05-01</TableCell>
                <TableCell variant="numeric">$120.00</TableCell>
                <TableCell>Paid</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="id">INV-0040</TableCell>
                <TableCell>2026-04-01</TableCell>
                <TableCell variant="numeric">$80.00</TableCell>
                <TableCell>Paid</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  ),
}

export const Antipattern_DoubleChrome: Story = {
  name: "Anti-pattern — Double chrome (do not copy)",
  parameters: {
    docs: {
      description: {
        story:
          "DO NOT do this. `<Card><Table bordered>` stacks two sets of border + rounded corners. " +
          "The Card border and the `bordered` Table border fight each other, producing doubled edges " +
          "and mismatched radii. Use Pattern A (bordered, no Card) or Pattern B (Card, no bordered) — never both.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-3" style={{ width: 560 }}>
      <div className="flex items-center gap-2 rounded-md border border-state-errored-border bg-state-errored-subtle px-3 py-2">
        <span className="text-label font-semibold text-state-errored-text">Anti-pattern</span>
        <span className="text-label text-state-errored-text">
          Don&apos;t do this — double border + double bg. Use Pattern A or Pattern B.
        </span>
      </div>
      <Card className="overflow-hidden p-0">
        <Table totalCount={3} pageOffset={0} bordered>
          <TableHeader>
            <tr>
              <TableHeaderCell label="Job ID" />
              <TableHeaderCell label="Status" />
              <TableHeaderCell label="Reward" numeric />
            </tr>
          </TableHeader>
          <TableBody>
            {RUNS.slice(0, 3).map((row) => (
              <TableRow key={row.id} outcome={row.status}>
                <TableCell variant="id">{row.jobId}</TableCell>
                <TableCell>{STATUS_LABEL[row.status]}</TableCell>
                <TableCell variant="numeric">{row.reward != null ? row.reward.toFixed(3) : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  ),
}

// ── Wrapping Content ──────────────────────────────────────────────────────────

export const WrappingContent: Story = {
  name: "Wrapping content (rows grow past min-h)",
  render: () => (
    <div className="flex flex-col gap-8" style={{ width: 560 }}>
      <div className="flex flex-col gap-2">
        <p className="text-label text-muted-foreground">
          Default density — long cell text wraps; row grows past 40px min-h, separators track correctly.
        </p>
        <Table totalCount={3} pageOffset={0} density="default">
          <TableHeader>
            <tr>
              <TableHeaderCell label="Job ID" sticky="left" />
              <TableHeaderCell label="Description" />
              <TableHeaderCell label="Reward" numeric />
            </tr>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell variant="id" sticky>job-8xkp3a</TableCell>
              <TableCell className="whitespace-normal max-w-xs">
                Short description — fits in one line.
              </TableCell>
              <TableCell variant="numeric">0.812</TableCell>
            </TableRow>
            <TableRow>
              <TableCell variant="id" sticky>job-9fmq1b</TableCell>
              <TableCell className="whitespace-normal max-w-xs">
                A much longer description that deliberately wraps across multiple lines to verify the row grows beyond the 40px minimum height without clipping text or collapsing the bottom border separator.
              </TableCell>
              <TableCell variant="numeric">0.654</TableCell>
            </TableRow>
            <TableRow>
              <TableCell variant="id" sticky>job-2zrv7c</TableCell>
              <TableCell className="whitespace-normal max-w-xs">
                Medium-length description — wraps once.
              </TableCell>
              <TableCell variant="numeric">—</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-label text-muted-foreground">
          Compact density — same wrapping test at 36px min-h baseline.
        </p>
        <Table totalCount={3} pageOffset={0} density="compact">
          <TableHeader>
            <tr>
              <TableHeaderCell label="Job ID" sticky="left" />
              <TableHeaderCell label="Description" />
              <TableHeaderCell label="Reward" numeric />
            </tr>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell variant="id" sticky>job-8xkp3a</TableCell>
              <TableCell className="whitespace-normal max-w-xs">
                Short description — fits in one line.
              </TableCell>
              <TableCell variant="numeric">0.812</TableCell>
            </TableRow>
            <TableRow>
              <TableCell variant="id" sticky>job-9fmq1b</TableCell>
              <TableCell className="whitespace-normal max-w-xs">
                A much longer description that deliberately wraps across multiple lines to verify the row grows beyond the 36px compact minimum height without clipping text or collapsing the bottom border separator.
              </TableCell>
              <TableCell variant="numeric">0.654</TableCell>
            </TableRow>
            <TableRow>
              <TableCell variant="id" sticky>job-2zrv7c</TableCell>
              <TableCell className="whitespace-normal max-w-xs">
                Medium-length description — wraps once.
              </TableCell>
              <TableCell variant="numeric">—</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  ),
}
