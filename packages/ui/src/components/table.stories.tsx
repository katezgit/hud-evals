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
        <p className="text-label text-muted-foreground">Default — 40px rows</p>
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
        <p className="text-label text-muted-foreground">Compact — 32px rows (scan-mode only, no inline editing)</p>
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
        next.has(id) ? next.delete(id) : next.add(id)
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
