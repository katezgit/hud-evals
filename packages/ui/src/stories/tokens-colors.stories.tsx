import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta: Meta = {
  title: "Design Tokens/2. Colors",
  parameters: { layout: "padded" },
};
export default meta;

/* ─── helpers ────────────────────────────────────────────────────────────── */

type SwatchRowProps = {
  token: string;
  label?: string;
  bordered?: boolean;
};

function SwatchRow({ token, label, bordered = false }: SwatchRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 48,
          height: 48,
          borderRadius: "var(--radius-sm)",
          background: `var(${token})`,
          border: bordered ? "1px solid var(--color-border)" : undefined,
        }}
      />
      <div style={{ paddingTop: 4 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
          <code style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-foreground)" }}>
            {token}
          </code>
        </div>
        {label && (
          <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginTop: 3 }}>{label}</p>
        )}
      </div>
    </div>
  );
}

type SectionProps = { title: string; children: React.ReactNode };
function Section({ title, children }: SectionProps) {
  return (
    <div style={{ marginBottom: 48 }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-muted-foreground)",
          marginBottom: 4,
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

/* ─── Surface ────────────────────────────────────────────────────────────── */

export const Surface: StoryObj = {
  name: "Surface",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", padding: 24 }}>
      <Section title="Surface">
        <SwatchRow token="--color-background" label="Page canvas — outermost background" bordered />
        <SwatchRow token="--color-page" label="Recessed page — deep background layer" bordered />
        <SwatchRow token="--color-panel" label="Panel / card — white surface above canvas" bordered />
        <SwatchRow token="--color-elevated" label="Elevated — popover, tooltip, dropdown" bordered />
        <SwatchRow token="--color-muted" label="Muted fill — section dividers, empty states" bordered />
        <SwatchRow token="--color-secondary" label="Secondary fill — chip bg, selected rows" bordered />
        <SwatchRow token="--color-surface-hover" label="Surface hover — interactive highlight" bordered />
        {/* Component-alias surfaces — alias of panel */}
        <SwatchRow token="--color-card" label="Card surface (alias of panel) — Card component fill" bordered />
        <SwatchRow token="--color-popover" label="Popover surface (alias of panel) — Popover/Tooltip/Dropdown fill" bordered />
        {/* Interaction state surfaces */}
        <SwatchRow token="--color-selected" label="Selected row / item (alias of secondary)" bordered />
        <SwatchRow token="--color-hover" label="Hover surface highlight (alias of elevated)" bordered />
      </Section>
    </div>
  ),
};

/* ─── Text ───────────────────────────────────────────────────────────────── */

export const Text: StoryObj = {
  name: "Text",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", padding: 24 }}>
      <Section title="Text">
        <SwatchRow token="--color-foreground" label="Primary text — titles, primary cell values, button labels, model names" />
        <SwatchRow token="--color-muted-foreground" label="Strong secondary — sidebar nav, page subtitles, tab labels, breadcrumbs, form helper text" />
        <SwatchRow token="--color-meta-foreground" label="Scaffolding / glance — table column headers, mono IDs under primary cell values, count badges, separators, axis labels, placeholders" />
        <SwatchRow token="--color-text-disabled" label="Disabled text — non-interactive labels" />
        {/* Component-alias foregrounds */}
        <SwatchRow token="--color-secondary-foreground" label="Foreground on secondary fill (alias of foreground)" />
        <SwatchRow token="--color-card-foreground" label="Foreground on card surface (alias of foreground)" />
        <SwatchRow token="--color-popover-foreground" label="Foreground on popover surface (alias of foreground)" />
      </Section>
    </div>
  ),
};

/* ─── Text secondary tiers — side-by-side comparison ────────────────────── */

export const TextSecondaryTiers: StoryObj = {
  name: "Text — muted-foreground vs meta-foreground",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", padding: 24 }}>
      <Section title="Picking between muted-foreground and meta-foreground">
        <p style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 20, lineHeight: 1.6 }}>
          Both are &quot;secondary&quot; — the difference is reading mode.{" "}
          <strong style={{ color: "var(--color-foreground)" }}>muted-foreground</strong>{" "}
          is text the user actively reads (sidebar nav, subtitle, helper text): should feel present.{" "}
          <strong style={{ color: "var(--color-foreground)" }}>meta-foreground</strong>{" "}
          is scaffolding (column headers, axis labels, count badges, mono IDs): glanced to orient, then ignored.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>

          {/* Left: sidebar-style chrome — uses muted-foreground */}
          <div
            style={{
              background: "var(--color-panel)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: 16,
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-meta-foreground)",
                marginBottom: 12,
              }}
            >
              Sidebar nav label
            </p>
            {["Overview", "Reports", "Configuration", "Settings"].map((item) => (
              <div
                key={item}
                style={{
                  padding: "6px 8px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 13,
                  color: "var(--color-muted-foreground)",
                  marginBottom: 2,
                }}
              >
                {item}
              </div>
            ))}
            <div
              style={{
                marginTop: 12,
                padding: "8px 10px",
                background: "var(--color-muted)",
                borderRadius: "var(--radius-sm)",
                fontSize: 10,
                fontFamily: "var(--font-sans)",
                color: "var(--color-muted-foreground)",
              }}
            >
              --color-muted-foreground
            </div>
            <p style={{ fontSize: 11, color: "var(--color-meta-foreground)", marginTop: 6 }}>
              Strong secondary. Chrome that should feel present. Sidebar / subtitle / tab.
            </p>
          </div>

          {/* Right: table row — uses meta for headers + mono ID */}
          <div
            style={{
              background: "var(--color-panel)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            {/* Table header row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr",
                padding: "8px 16px",
                borderBottom: "1px solid var(--color-border)",
                background: "var(--color-muted)",
              }}
            >
              {["Model", "Score", "Runs"].map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--color-meta-foreground)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
            {/* Table body rows */}
            {[
              { name: "Item Alpha", id: "item-alpha-001", score: "0.87", runs: "128" },
              { name: "Item Beta",  id: "item-beta-002",  score: "0.81", runs: "96" },
            ].map((row) => (
              <div
                key={row.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  padding: "10px 16px",
                  borderBottom: "1px solid var(--color-border)",
                  alignItems: "start",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: "var(--color-foreground)", fontWeight: 500 }}>
                    {row.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-sans)",
                      color: "var(--color-meta-foreground)",
                      marginTop: 2,
                    }}
                  >
                    {row.id}
                  </div>
                </div>
                <span style={{ fontSize: 13, color: "var(--color-foreground)" }}>{row.score}</span>
                <span style={{ fontSize: 13, color: "var(--color-meta-foreground)" }}>{row.runs}</span>
              </div>
            ))}
            <div
              style={{
                padding: "8px 16px",
                fontSize: 10,
                fontFamily: "var(--font-sans)",
                color: "var(--color-muted-foreground)",
                background: "var(--color-muted)",
              }}
            >
              --color-meta
            </div>
            <p style={{ fontSize: 11, color: "var(--color-meta-foreground)", padding: "4px 16px 12px" }}>
              Weak secondary. Scanning recede. Column headers / mono IDs under primary.
            </p>
          </div>
        </div>
      </Section>
    </div>
  ),
};

/* ─── Border ─────────────────────────────────────────────────────────────── */

export const Border: StoryObj = {
  name: "Border",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", padding: 24 }}>
      <Section title="Border">
        <SwatchRow token="--color-border" label="Border — rgba alpha tint, composites on any surface" />
        <SwatchRow token="--color-border-strong" label="+10pp alpha for selected/active edges" />
        <SwatchRow token="--color-border-disabled" label="PINNED neutral-adjacent — disabled control borders" />
      </Section>
    </div>
  ),
};

/* ─── Primary (teal — CTA fill) ──────────────────────────────────────────── */

export const Primary: StoryObj = {
  name: "Primary",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", padding: 24 }}>
      <Section title="Primary — teal CTA fill (Primary button, switches, tabs active, checkbox, progress)">
        <SwatchRow
          token="--color-primary"
          label="Teal CTA fill — light: #087A6C  dark: #2BE0C8. Powers Button primary, Switch ON, Tabs active, Checkbox checked, Progress default."
        />
        <SwatchRow token="--color-primary-foreground" label="Text on --color-primary fill" bordered />
        <SwatchRow token="--color-primary-hover" label="Hover state of primary" />
        <SwatchRow token="--color-primary-glow" label="Glow halo — focus / active primary chrome" bordered />
        <SwatchRow token="--color-primary-soft" label="10% alpha tint — badges, selection pills" bordered />
        <SwatchRow token="--color-primary-border" label="25% alpha tint — outlined chips" bordered />
        <SwatchRow token="--color-primary-disabled" label="PINNED desaturated teal — disabled primary state (reads as less prominent, not darker)" bordered />
      </Section>
    </div>
  ),
};

/* ─── Destructive ────────────────────────────────────────────────────────── */

export const Destructive: StoryObj = {
  name: "Destructive",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", padding: 24 }}>
      <Section title="Destructive">
        <SwatchRow token="--color-destructive" label="Destructive fill — delete, error CTA" />
        <SwatchRow token="--color-destructive-foreground" label="Text on --color-destructive fill" bordered />
        <SwatchRow token="--color-destructive-hover" label="Hover state" />
        <SwatchRow token="--color-destructive-active" label="Active/pressed state" />
      </Section>
    </div>
  ),
};

/* ─── Status families ────────────────────────────────────────────────────── */

type StatusFamilyProps = {
  name: string;
  usage: string;
  solid: string;
  subtle: string;
  textToken: string;
};

function StatusFamily({ name, usage, solid, subtle, textToken }: StatusFamilyProps) {
  return (
    <div
      style={{
        background: "var(--color-panel)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: 12,
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: `var(${solid})`,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-foreground)" }}>{name}</span>
        <span style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>{usage}</span>
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        {[
          { token: solid, label: "solid" },
          { token: subtle, label: "subtle" },
          { token: textToken, label: "text" },
        ].map(({ token, label }) => (
          <div key={token} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "var(--radius-sm)",
                background: `var(${token})`,
                boxShadow: "inset 0 0 0 1px var(--color-border)",
              }}
            />
            <code
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 10,
                color: "var(--color-muted-foreground)",
              }}
            >
              {token}
            </code>
            <span style={{ fontSize: 10, color: "var(--color-muted-foreground)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const StatusFamilies: StoryObj = {
  name: "Status Families",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", padding: 24 }}>
      <Section title="Status Families — solid / subtle / text triads">
        <StatusFamily
          name="scored"
          usage="success — task passed, item complete"
          solid="--color-state-scored"
          subtle="--color-state-scored-subtle"
          textToken="--color-state-scored-text"
        />
        <StatusFamily
          name="running"
          usage="in-progress — operation underway"
          solid="--color-state-running"
          subtle="--color-state-running-subtle"
          textToken="--color-state-running-text"
        />
        <StatusFamily
          name="errored"
          usage="failure — error thrown, task failed"
          solid="--color-state-errored"
          subtle="--color-state-errored-subtle"
          textToken="--color-state-errored-text"
        />
        <StatusFamily
          name="warning"
          usage="caution — threshold exceeded, degraded signal"
          solid="--color-state-warning"
          subtle="--color-state-warning-subtle"
          textToken="--color-state-warning-text"
        />
        <div
          style={{
            background: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "var(--color-state-not-run)",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-foreground)" }}>
              not-run
            </span>
            <span style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>
              queued — not yet started
            </span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { token: "--color-state-not-run", label: "solid" },
              { token: "--color-state-not-run-subtle", label: "subtle" },
            ].map(({ token, label }) => (
              <div key={token} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "var(--radius-sm)",
                    background: `var(${token})`,
                    boxShadow: "inset 0 0 0 1px var(--color-border)",
                  }}
                />
                <code
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 10,
                    color: "var(--color-muted-foreground)",
                  }}
                >
                  {token}
                </code>
                <span style={{ fontSize: 10, color: "var(--color-muted-foreground)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  ),
};

/* ─── Focus chrome ───────────────────────────────────────────────────────── */

export const FocusChrome: StoryObj = {
  name: "Focus Chrome",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", padding: 24 }}>
      <Section title="Focus / Interaction">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "var(--color-muted-foreground)",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Focus ring + glow (default)
            </p>
            <div
              style={{
                borderRadius: "var(--radius-md)",
                padding: "0 12px",
                height: 34,
                background: "var(--color-panel)",
                border: "1px solid var(--color-border)",
                outline: "2px solid var(--color-ring)",
                outlineOffset: 2,
                boxShadow: "0 0 0 3px var(--color-ring-glow)",
                display: "flex",
                alignItems: "center",
                fontSize: 13,
                color: "var(--color-muted-foreground)",
              }}
            >
              focused input
            </div>
            <div style={{ marginTop: 10 }}>
              <code style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: "var(--color-muted-foreground)", display: "block" }}>
                --color-ring → teal-700/teal-500 (light: #087A6C / dark: #1A9183)
              </code>
              <code style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: "var(--color-muted-foreground)", display: "block" }}>
                --color-ring-glow → rgba teal glow
              </code>
            </div>
          </div>
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "var(--color-muted-foreground)",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Focus ring — errored state
            </p>
            <div
              style={{
                borderRadius: "var(--radius-md)",
                padding: "0 12px",
                height: 34,
                background: "var(--color-panel)",
                border: "1px solid var(--color-state-errored)",
                outline: "2px solid var(--color-state-errored)",
                outlineOffset: 2,
                boxShadow: "0 0 0 3px var(--color-state-errored-subtle)",
                display: "flex",
                alignItems: "center",
                fontSize: 13,
                color: "var(--color-muted-foreground)",
              }}
            >
              error state input
            </div>
            <div style={{ marginTop: 10 }}>
              <code style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: "var(--color-muted-foreground)", display: "block" }}>
                --color-state-errored border + outline
              </code>
              <code style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: "var(--color-muted-foreground)", display: "block" }}>
                --color-state-errored-subtle glow halo
              </code>
            </div>
          </div>
        </div>
      </Section>
    </div>
  ),
};

/* ─── Brand isolation ────────────────────────────────────────────────────── */

export const BrandIsolation: StoryObj = {
  name: "Brand Isolation",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", padding: 24 }}>
      <Section title="Brand — logo/mark surfaces only. Never interactive.">
        <p style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 16, lineHeight: 1.6 }}>
          Brand tokens are defined in <code style={{ fontFamily: "var(--font-sans)" }}>@theme</code> and generate
          Tailwind utilities (<code style={{ fontFamily: "var(--font-sans)" }}>bg-brand</code>, etc.).
          Use only for logo/mark surfaces — never as interactive CTA fill.
          Distinct hue from warning to avoid status ambiguity.
        </p>
        <SwatchRow token="--color-brand" label="--gold (#f7b717) — logo stripe, mark fill" />
        <SwatchRow token="--color-brand-foreground" label="AA-contrast foreground on brand fill" />
        <SwatchRow token="--color-brand-hover" label="#D49A0E — darkened gold for hover; not a palette step (PINNED)" />
        <SwatchRow token="--color-brand-glow" label="16% alpha gold — glow halo for brand chrome" bordered />
        <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginTop: 12 }}>
          Warning state uses{" "}
          <code style={{ fontFamily: "var(--font-sans)" }}>--color-state-warning</code>{" "}
          (light: <samp>#C47A0A</samp> / dark: <samp>#E5A52E</samp>) — a distinct oranger hue.
        </p>
      </Section>
    </div>
  ),
};

/* ─── Chart Series ───────────────────────────────────────────────────────── */

// Multi-series line chart data — gentle upward trend with variance
// 8 series, 40 points each. Generated deterministically (no Math.random).
const W = 560;
const H = 180;
const PT = 40;

function makeWave(
  baseline: number,
  amplitude: number,
  freq: number,
  phase: number,
  trend: number,
): [number, number][] {
  return Array.from({ length: PT }, (_, i) => {
    const t = i / (PT - 1);
    const y =
      baseline -
      trend * t * (H - 40) +
      amplitude * Math.sin(freq * t * Math.PI * 2 + phase) +
      (amplitude * 0.4) * Math.sin(freq * 1.7 * t * Math.PI * 2 + phase * 1.3);
    return [(i / (PT - 1)) * W, Math.max(10, Math.min(H - 10, y))];
  });
}

const lineSeries: Array<{ token: string; dash?: string; points: [number, number][] }> = [
  // chart-1 through chart-6
  { token: "--color-chart-1", points: makeWave(140, 18, 1.1, 0.0, 0.55) },
  { token: "--color-chart-2", points: makeWave(110, 22, 0.9, 1.2, 0.45) },
  { token: "--color-chart-3", points: makeWave(90,  16, 1.3, 2.1, 0.35) },
  { token: "--color-chart-4", points: makeWave(70,  20, 0.8, 0.7, 0.60) },
  { token: "--color-chart-5", points: makeWave(55,  14, 1.5, 3.0, 0.30) },
  { token: "--color-chart-6", points: makeWave(45,  18, 1.0, 1.8, 0.50) },
  // Comparison: --color-primary (same hex as chart-1 in dark, very close in light)
  { token: "--color-primary",        dash: "6 3", points: makeWave(150, 12, 0.7, 0.5, 0.65) },
  // Comparison: --color-state-running (identical to chart-7 in both themes)
  { token: "--color-state-running", dash: "3 3", points: makeWave(160, 15, 1.2, 2.5, 0.40) },
];

function toPolyline(pts: [number, number][]): string {
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

// Bar chart: 8 bars each in chart-N color, varied heights
const barData = [
  { token: "--color-chart-1", h: 130, label: "1" },
  { token: "--color-chart-2", h: 95,  label: "2" },
  { token: "--color-chart-3", h: 160, label: "3" },
  { token: "--color-chart-4", h: 75,  label: "4" },
  { token: "--color-chart-5", h: 110, label: "5" },
  { token: "--color-chart-6", h: 145, label: "6" },
  { token: "--color-chart-7", h: 85,  label: "7" },
  { token: "--color-chart-8", h: 60,  label: "8" },
];

// Pie chart: 6 slices
type PieSlice = { token: string; label: string; deg: number };
const pieSlices: PieSlice[] = [
  { token: "--color-chart-1", label: "series-1", deg: 72  },
  { token: "--color-chart-2", label: "series-2", deg: 54  },
  { token: "--color-chart-3", label: "series-3", deg: 60  },
  { token: "--color-chart-4", label: "series-4", deg: 48  },
  { token: "--color-chart-5", label: "series-5", deg: 66  },
  { token: "--color-chart-6", label: "series-6", deg: 60  },
];

function polarToXY(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function buildPiePaths(slices: PieSlice[], cx: number, cy: number, r: number) {
  let start = 0;
  return slices.map((s) => {
    const end = start + s.deg;
    const [x1, y1] = polarToXY(cx, cy, r, start);
    const [x2, y2] = polarToXY(cx, cy, r, end);
    const large = s.deg > 180 ? 1 : 0;
    const d = `M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`;
    start = end;
    return { ...s, d };
  });
}

const piePaths = buildPiePaths(pieSlices, 80, 80, 72);

// Horizontal bar chart data
const hBarData = [
  { token: "--color-chart-1", label: "category-a", pct: 82 },
  { token: "--color-chart-2", label: "category-b", pct: 67 },
  { token: "--color-chart-3", label: "category-c", pct: 54 },
  { token: "--color-chart-4", label: "category-d", pct: 48 },
  { token: "--color-chart-5", label: "category-e", pct: 39 },
  { token: "--color-chart-6", label: "category-f", pct: 31 },
  { token: "--color-chart-7", label: "category-g", pct: 22 },
  { token: "--color-chart-8", label: "category-h", pct: 14 },
];

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "var(--color-muted-foreground)",
  marginBottom: 8,
};

export const ChartSeries: StoryObj = {
  name: "Chart series — 8-color palette + sample patterns",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", padding: 24, display: "flex", flexDirection: "column", gap: 40 }}>

      {/* ── Section 1: Swatch grid ─────────────────────────────────────── */}
      <section>
        <p style={LABEL_STYLE}>Series swatches — chart-1…8</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {([1,2,3,4,5,6,7,8] as const).map((n) => {
            const token = `--color-chart-${n}`;
            return (
              <div key={n} style={{ display: "flex", flexDirection: "column", gap: 4, width: 64 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "var(--radius-md)",
                    background: `var(${token})`,
                    boxShadow: "inset 0 0 0 1px var(--color-border)",
                  }}
                />
                <code style={{ fontFamily: "var(--font-sans)", fontSize: 9, color: "var(--color-muted-foreground)", wordBreak: "break-all" }}>
                  {token}
                </code>
              </div>
            );
          })}
        </div>

        {/* Collision callout */}
        <div
          style={{
            marginTop: 16,
            padding: "10px 14px",
            background: "var(--color-state-warning-subtle)",
            border: "1px solid var(--color-state-warning)",
            borderRadius: "var(--radius-md)",
            fontSize: 11,
            color: "var(--color-foreground)",
            lineHeight: 1.6,
          }}
        >
          <strong>Collision audit</strong> — tokens that resolve to the same computed value:
          <ul style={{ margin: "6px 0 0 16px", padding: 0 }}>
            <li>
              <code style={{ fontFamily: "var(--font-sans)" }}>--color-chart-1</code>{" "}
              = <code style={{ fontFamily: "var(--font-sans)" }}>--color-primary</code>{" "}
              (light: chart-1 <samp>#0E9888</samp> / primary <samp>#087A6C</samp> — very close; dark: both <samp>#2BE0C8</samp> — <strong>identical</strong>)
            </li>
            <li>
              <code style={{ fontFamily: "var(--font-sans)" }}>--color-chart-7</code>{" "}
              = <code style={{ fontFamily: "var(--font-sans)" }}>--color-state-running</code>{" "}
              (light: both <samp>#2462C5</samp> — <strong>identical</strong>; dark: both <samp>#4FA8FF</samp> — <strong>identical</strong>)
            </li>
            <li>
              Dark only: chart-3 <samp>#F46EB0</samp> vs chart-6 <samp>#FF7066</samp> — distinct hues but similar warmth / lightness
            </li>
          </ul>
        </div>
      </section>

      {/* ── Section 2: Multi-line overlay ─────────────────────────────── */}
      <section>
        <p style={LABEL_STYLE}>Multi-line trend (chart-1…6 solid, + accent dashed, + running dotted)</p>
        <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginBottom: 8 }}>
          Dashed line = <code style={{ fontFamily: "var(--font-sans)" }}>--color-primary</code> (compare to chart-1 solid above it).
          Dotted line = <code style={{ fontFamily: "var(--font-sans)" }}>--color-state-running</code> (compare to chart-7 — not shown but identical).
        </p>
        <div
          style={{
            background: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: 16,
          }}
        >
          <svg
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            style={{ display: "block", overflow: "visible" }}
          >
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map((f) => (
              <line
                key={f}
                x1={0} y1={H * f}
                x2={W} y2={H * f}
                stroke="var(--color-border)"
                strokeWidth={1}
              />
            ))}
            {lineSeries.map(({ token, dash, points }) => (
              <polyline
                key={token}
                points={toPolyline(points)}
                fill="none"
                stroke={`var(${token})`}
                strokeWidth={dash ? 2 : 2.5}
                strokeDasharray={dash}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={dash ? 0.85 : 1}
              />
            ))}
          </svg>
          {/* Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", marginTop: 12 }}>
            {lineSeries.map(({ token, dash }) => (
              <div key={token} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width={24} height={4} style={{ flexShrink: 0 }}>
                  <line
                    x1={0} y1={2} x2={24} y2={2}
                    stroke={`var(${token})`}
                    strokeWidth={dash ? 2 : 2.5}
                    strokeDasharray={dash}
                  />
                </svg>
                <code style={{ fontFamily: "var(--font-sans)", fontSize: 9, color: "var(--color-muted-foreground)" }}>
                  {token}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Vertical bar chart ─────────────────────────────── */}
      <section>
        <p style={LABEL_STYLE}>Vertical bar chart — one bar per series color</p>
        <div
          style={{
            background: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "16px 16px 8px",
          }}
        >
          <svg width={320} height={180} viewBox="0 0 320 180" style={{ display: "block" }}>
            {/* Baseline */}
            <line x1={0} y1={168} x2={320} y2={168} stroke="var(--color-border)" strokeWidth={1} />
            {barData.map(({ token, h, label }, i) => {
              const barW = 28;
              const gap = 12;
              const x = i * (barW + gap) + 8;
              const y = 168 - h;
              return (
                <g key={token}>
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={h}
                    fill={`var(${token})`}
                    rx={3}
                  />
                  <text
                    x={x + barW / 2}
                    y={180}
                    textAnchor="middle"
                    fontSize={9}
                    fill="var(--color-muted-foreground)"
                    fontFamily="var(--font-sans)"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      {/* ── Section 4: Pie chart ──────────────────────────────────────── */}
      <section>
        <p style={LABEL_STYLE}>Pie chart — environment distribution (6 segments, stroke = --color-panel)</p>
        <div
          style={{
            background: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: 16,
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
        >
          <svg width={160} height={160} viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
            {piePaths.map(({ token, label, d }) => (
              <path
                key={label}
                d={d}
                fill={`var(${token})`}
                stroke="var(--color-panel)"
                strokeWidth={2}
              />
            ))}
          </svg>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {pieSlices.map(({ token, label, deg }) => (
              <div key={token} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: `var(${token})`,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 11, color: "var(--color-muted-foreground)", fontFamily: "var(--font-sans)" }}>
                  {label}
                </span>
                <span style={{ fontSize: 11, color: "var(--color-meta-foreground)" }}>
                  {Math.round((deg / 360) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: Horizontal bar chart ──────────────────────────── */}
      <section>
        <p style={LABEL_STYLE}>Horizontal bar chart — category distribution</p>
        <div
          style={{
            background: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: 16,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {hBarData.map(({ token, label, pct }) => (
              <div key={token} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 80,
                    fontSize: 11,
                    color: "var(--color-muted-foreground)",
                    fontFamily: "var(--font-sans)",
                    flexShrink: 0,
                    textAlign: "right",
                  }}
                >
                  {label}
                </span>
                <div
                  style={{
                    height: 16,
                    width: `${pct * 2.4}px`,
                    background: `var(${token})`,
                    borderRadius: 3,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 10, color: "var(--color-meta-foreground)", fontFamily: "var(--font-sans)" }}>
                  {pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  ),
};
