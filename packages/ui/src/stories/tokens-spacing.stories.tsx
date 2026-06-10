import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta: Meta = {
  title: "Design Tokens/3. Spacing",
  parameters: { layout: "padded" },
};
export default meta;

const SPACING_STEPS = [
  { multiplier: 1,   rem: "0.25rem",   px: "4px",  pxNum: 4,  usage: "mb-1 title → description, micro vertical stacks" },
  { multiplier: 1.5, rem: "0.375rem",  px: "6px",  pxNum: 6,  usage: "DropdownMenu item padding, button icon gap; form: label ↔ control" },
  { multiplier: 2,   rem: "0.5rem",    px: "8px",  pxNum: 8,  usage: "inline siblings (button + label, badge + dot), Input internal padding; form: actions row button gap" },
  { multiplier: 3,   rem: "0.75rem",   px: "12px", pxNum: 12, usage: "Alert icon ↔ content gap, px-3 in form-field controls" },
  { multiplier: 4,   rem: "1rem",      px: "16px", pxNum: 16, usage: "gap-4 between blocks, card/alert padding; form: field ↔ field" },
  { multiplier: 6,   rem: "1.5rem",    px: "24px", pxNum: 24, usage: "gap-6 between sections inside a panel; form: last field ↔ actions row" },
  { multiplier: 8,   rem: "2rem",      px: "32px", pxNum: 32, usage: "gap-8 between major regions, pl-8 left-icon inset offset" },
] as const;

const BAR_WIDTH = 56;

export const SpacingScale: StoryObj = {
  name: "Spacing Scale",
  render: () => {
    const maxBarHeight = Math.max(...SPACING_STEPS.map((s) => s.pxNum));

    return (
      <div style={{ fontFamily: "var(--font-sans)", background: "var(--color-background)", padding: 24 }}>
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
          Spacing Scale
        </p>
        <p style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 28 }}>
          Base unit: 4px —{" "}
          <code style={{ fontFamily: "var(--font-sans)" }}>--spacing: 0.25rem</code>
          {" "}is explicitly declared in <code style={{ fontFamily: "var(--font-sans)" }}>primitive.css</code> (Tailwind v4 does NOT ship a default <code style={{ fontFamily: "var(--font-sans)" }}>--spacing</code>; the declaration is required). Tailwind multiplies by the numeric class suffix (<code style={{ fontFamily: "var(--font-sans)" }}>spacing-1</code> = 4px, <code style={{ fontFamily: "var(--font-sans)" }}>spacing-2</code> = 8px, …).
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 12,
            borderBottom: "1px solid var(--color-border)",
            paddingBottom: 0,
            overflowX: "auto",
          }}
        >

          {SPACING_STEPS.map(({ multiplier, rem, px, pxNum, usage }) => {
            const barHeight = pxNum;
            const tokenSuffix = String(multiplier);

            return (
              <div
                key={multiplier}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-sans)",
                    color: "var(--color-muted-foreground)",
                    marginBottom: 4,
                    whiteSpace: "nowrap",
                  }}
                >
                  {px}
                </span>

                <div style={{ flex: 1, minHeight: maxBarHeight - barHeight }} />
                <div
                  title={`spacing-${tokenSuffix} · ${rem} · ${px} · ${usage}`}
                  style={{
                    width: BAR_WIDTH,
                    height: barHeight,
                    borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
                    background: "var(--color-primary)",
                    opacity: 0.85,
                  }}
                />
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            paddingTop: 6,
            overflowX: "auto",
          }}
        >
          {SPACING_STEPS.map(({ multiplier, rem }) => (
            <div
              key={multiplier}
              style={{
                width: BAR_WIDTH,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-sans)",
                  color: "var(--color-foreground)",
                  whiteSpace: "nowrap",
                }}
              >
                {multiplier}
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontFamily: "var(--font-sans)",
                  color: "var(--color-muted-foreground)",
                  whiteSpace: "nowrap",
                }}
              >
                {rem}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 32,
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "100px 60px 60px 1fr",
              gap: 0,
              background: "var(--color-muted)",
              padding: "6px 12px",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            {["Token", "rem", "px", "Usage"].map((h) => (
              <span
                key={h}
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
          {SPACING_STEPS.map(({ multiplier, rem, px, usage }) => (
            <div
              key={multiplier}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 60px 60px 1fr",
                gap: 0,
                padding: "6px 12px",
                borderBottom: "1px solid var(--color-border)",
                alignItems: "center",
              }}
            >
              <code style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-foreground)" }}>
                spacing-{multiplier}
              </code>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-muted-foreground)" }}>
                {rem}
              </span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-muted-foreground)" }}>
                {px}
              </span>
              <span style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>{usage}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};
