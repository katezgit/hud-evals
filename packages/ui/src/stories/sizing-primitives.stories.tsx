import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Button } from "../components/button";
import { IconButton } from "../components/icon-button";
import { Input } from "../components/input";
import { Checkbox } from "../components/checkbox";
import { Switch } from "../components/switch";
import { Settings, MoreHorizontal, RefreshCw, Plus } from "lucide-react";

const meta: Meta = {
  title: "Design Tokens/4. Sizing",
  parameters: { layout: "padded" },
};
export default meta;

const EYEBROW: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--color-muted-foreground)",
  marginBottom: 4,
  fontFamily: "var(--font-sans)",
};

const META: React.CSSProperties = {
  fontSize: 12,
  color: "var(--color-muted-foreground)",
  fontFamily: "var(--font-sans)",
  marginBottom: 0,
};

const LABEL: React.CSSProperties = {
  fontSize: 10,
  color: "var(--color-muted-foreground)",
  fontFamily: "var(--font-sans)",
  textAlign: "center",
  marginTop: 4,
};

const SECTION: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  background: "var(--color-background)",
  padding: 24,
};

const DIVIDER: React.CSSProperties = {
  height: 1,
  background: "var(--color-border)",
  margin: "32px 0",
};

export const Sizing: StoryObj = {
  name: "Sizing",
  render: () => (
    <div style={{ ...SECTION, maxWidth: 720 }}>
      <p style={EYEBROW}>Design Tokens / Sizing</p>
      <p style={{ ...META, marginBottom: 32 }}>
        One height (32px) across Button, IconButton, and Input. Hierarchy via variant, not size.
        IconButton has a second 24px size for table-cell trailing actions only.
      </p>

      {/* ── Toolbar alignment centerpiece ── */}
      <p style={{ ...EYEBROW, marginBottom: 12 }}>Toolbar alignment — 32px baseline</p>
      <p style={{ ...META, marginBottom: 16 }}>
        Button + IconButton + Input + Checkbox + Switch on one horizontal baseline.
        Checkbox and Switch are flex-centered, not height-matched.
      </p>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: "var(--color-muted)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-sm)",
          marginBottom: 8,
          position: "relative",
        }}
      >
        <Input placeholder="Search tasksets…" style={{ width: 180 }} />
        <IconButton size="md" variant="secondary" aria-label="Refresh">
          <RefreshCw />
        </IconButton>
        <Button variant="secondary">Filter</Button>
        <Checkbox aria-label="Select all" />
        <Switch aria-label="Live updates" />
        <Button variant="primary">
          <Plus />
          New Taskset
        </Button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
        <div style={{ width: 180, height: 1, background: "var(--color-primary)", opacity: 0.4, borderTop: "1px dashed var(--color-primary)" }} />
        <span style={{ fontSize: 9, fontFamily: "var(--font-sans)", color: "var(--color-primary)", opacity: 0.7 }}>32px</span>
      </div>

      <div style={DIVIDER} />

      {/* ── Table-cell context ── */}
      <p style={{ ...EYEBROW, marginBottom: 12 }}>Table-cell context — IconButton sm (24px)</p>
      <p style={{ ...META, marginBottom: 16 }}>
        The 24px IconButton is a table-cell-only primitive. Never alongside a Button or Input in the same horizontal band.
      </p>
      <div
        style={{
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-sm)",
          overflow: "hidden",
          fontFamily: "var(--font-sans)",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "18px 1fr 120px 80px 48px",
            columnGap: 12,
            background: "var(--color-muted)",
            padding: "6px 12px",
            borderBottom: "1px solid var(--color-border)",
            alignItems: "center",
          }}
        >
          {["", "Taskset", "Status", "Runs", ""].map((h, i) => (
            <span
              key={i}
              style={{
                fontSize: 10,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-muted-foreground)",
              }}
            >
              {h}
            </span>
          ))}
        </div>
        {[
          { name: "webagent-v3-eval", status: "Active", runs: 12 },
          { name: "browsergym-tasks", status: "Archived", runs: 5 },
        ].map((row) => (
          <div
            key={row.name}
            style={{
              display: "grid",
              gridTemplateColumns: "18px 1fr 120px 80px 48px",
              gap: 12,
              padding: "0 12px",
              borderBottom: "1px solid var(--color-border)",
              alignItems: "center",
              height: 40,
            }}
          >
            <Checkbox size="sm" aria-label={`Select ${row.name}`} />
            <span style={{ fontSize: 12, color: "var(--color-foreground)" }}>{row.name}</span>
            <span style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>{row.status}</span>
            <span style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>{row.runs}</span>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton size="sm" variant="ghost" aria-label="More actions">
                <MoreHorizontal />
              </IconButton>
            </div>
          </div>
        ))}
      </div>
      <p style={{ ...META, fontSize: 11 }}>
        24px sits in a 40px row — 8px margin T/B absorbed by flex items-center. No Button in the same row.
      </p>

      <div style={DIVIDER} />

      {/* ── Compared heights: chosen vs rejected ── */}
      <p style={{ ...EYEBROW, marginBottom: 12 }}>Chosen vs rejected</p>

      <p style={{ ...EYEBROW, fontSize: 10, marginBottom: 8 }}>Button</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <Button variant="primary">New Taskset</Button>
          <span style={LABEL}>md · 32px ✓</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: 0.35 }}>
          <div
            style={{
              height: 28,
              padding: "0 14px",
              background: "var(--color-primary)",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 11, fontFamily: "var(--font-sans)", color: "var(--color-primary-foreground)", fontWeight: 600 }}>
              New Taskset
            </span>
          </div>
          <span style={LABEL}>28px — rejected</span>
          <span style={{ fontSize: 9, fontFamily: "var(--font-sans)", color: "var(--color-muted-foreground)", textAlign: "center", maxWidth: 80 }}>
            too thin; hierarchy collapses to color alone
          </span>
        </div>
      </div>
      <p style={{ ...META, fontSize: 11, marginBottom: 24 }}>
        36px option rejected: breaks toolbar alignment — 4px optical gap next to 32px Input.
      </p>

      <p style={{ ...EYEBROW, fontSize: 10, marginBottom: 8 }}>IconButton</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <IconButton size="md" variant="secondary" aria-label="Settings md">
            <Settings />
          </IconButton>
          <span style={LABEL}>md · 32px — toolbar</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <IconButton size="sm" variant="ghost" aria-label="Settings sm">
            <Settings />
          </IconButton>
          <span style={LABEL}>sm · 24px — table cell</span>
        </div>
      </div>

      <p style={{ ...EYEBROW, fontSize: 10, marginBottom: 8 }}>Input</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <Input placeholder="Filter by name…" style={{ width: 180 }} />
          <span style={LABEL}>32px ✓</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: 0.35 }}>
          <div
            style={{
              height: 28,
              width: 180,
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              background: "var(--color-background)",
              display: "flex",
              alignItems: "center",
              paddingLeft: 8,
            }}
          >
            <span style={{ fontSize: 10, color: "var(--color-muted-foreground)", fontFamily: "var(--font-sans)" }}>
              Filter by name…
            </span>
          </div>
          <span style={LABEL}>28px — rejected</span>
          <span style={{ fontSize: 9, fontFamily: "var(--font-sans)", color: "var(--color-muted-foreground)", textAlign: "center", maxWidth: 80 }}>
            sm anchor gone; both contexts → 32px
          </span>
        </div>
      </div>

      <div style={DIVIDER} />

      {/* ── Checkbox + Switch ── */}
      <p style={{ ...EYEBROW, marginBottom: 12 }}>Checkbox + Switch</p>
      <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <p style={{ ...EYEBROW, fontSize: 10, margin: 0 }}>Checkbox sizes</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <Checkbox size="xs" aria-label="xs checkbox" />
              <span style={LABEL}>xs · 14px</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <Checkbox size="sm" aria-label="sm checkbox" />
              <span style={LABEL}>sm · 18px</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <Checkbox size="md" aria-label="md checkbox" />
              <span style={LABEL}>md · 20px</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <p style={{ ...EYEBROW, fontSize: 10, margin: 0 }}>Switch sizes</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <Switch size="sm" aria-label="sm switch" />
              <span style={LABEL}>sm · 18px track</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <Switch size="md" aria-label="md switch" />
              <span style={LABEL}>md · 20px track</span>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          padding: "10px 14px",
          background: "var(--color-muted)",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-border)",
        }}
      >
        <p style={{ ...META, fontSize: 11 }}>
          Neither Checkbox nor Switch is height-matched to Button/Input (32px). They are flex-centered inside
          their container row. Row height is determined by context (table ~40px, form ~32–40px), not by the
          control&apos;s intrinsic size.
        </p>
      </div>
    </div>
  ),
};
