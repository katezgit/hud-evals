import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta: Meta = {
  title: "Design Tokens/2. Typography",
  parameters: { layout: "padded" },
};
export default meta;

type TypeRowProps = {
  token: string;
  sample: string;
  sizeRem: string;
  sizePx: string;
  weight: string;
  usage: string;
  utility?: string;
};

function TypeRow({ token, sample, sizeRem, sizePx, weight, usage, utility }: TypeRowProps) {
  // Derive the CSS class name from the utility string (strip leading dot).
  // If utility is a placeholder like "(no composite utility — token only)", skip the class.
  const utilityClass =
    utility && utility.startsWith(".") ? utility.slice(1) : undefined;

  return (
    <div
      style={{
        padding: "14px 0",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div style={{ marginBottom: 8 }}>
        <div
          className={utilityClass}
          style={{
            color: "var(--color-foreground)",
            // Fallback inline styles only when no composite utility class applies.
            ...(utilityClass
              ? {}
              : {
                  fontFamily: "var(--font-sans)",
                  fontSize: `var(${token})`,
                  fontWeight: Number(weight),
                }),
          }}
        >
          {sample}
        </div>
        {utility !== undefined && (
          <div style={{ marginTop: 4 }}>
            <code
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 10,
                color: utility.startsWith("(") ? "var(--color-muted-foreground)" : "var(--color-foreground)",
                background: "var(--color-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: 3,
                padding: "1px 5px",
              }}
            >
              {utility}
            </code>
          </div>
        )}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 56px 56px 80px 1fr",
          gap: 12,
          alignItems: "center",
        }}
      >
        <code style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-foreground)" }}>
          {token}
        </code>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-muted-foreground)" }}>
          {sizeRem}
        </span>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-muted-foreground)" }}>
          {sizePx}
        </span>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-muted-foreground)" }}>
          {weight}
        </span>
        <span style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>{usage}</span>
      </div>
    </div>
  );
}

// ─── Eyebrow helper ──────────────────────────────────────────────────────────

function Eyebrow({ label }: { label: string }) {
  return (
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
      {label}
    </p>
  );
}

// ─── Column header row helper ─────────────────────────────────────────────────

function ColHeaders({ cols, template }: { cols: string[]; template: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: template,
        gap: 12,
        padding: "8px 0",
        borderBottom: "1px solid var(--color-border)",
        marginBottom: 4,
      }}
    >
      {cols.map((h) => (
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
  );
}

// ─── Label ───────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-muted-foreground)" }}>
      {children}
    </span>
  );
}

// ─── Stories ──────────────────────────────────────────────────────────────────

export const TypeScale: StoryObj = {
  name: "Type Scale",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", background: "var(--color-background)", padding: 24 }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-muted-foreground)",
          marginBottom: 8,
        }}
      >
        Type Scale — IBM Plex Sans
      </p>

      {/* Composite utility callout */}
      <p
        style={{
          fontSize: 11,
          color: "var(--color-muted-foreground)",
          marginBottom: 12,
          padding: "6px 10px",
          background: "var(--color-secondary)",
          border: "1px solid var(--color-border)",
          borderRadius: 4,
        }}
      >
        <strong style={{ fontWeight: 600 }}>Composite utilities</strong> —{" "}
        <code style={{ fontFamily: "var(--font-sans)", fontSize: 11 }}>.text-display</code>,{" "}
        <code style={{ fontFamily: "var(--font-sans)", fontSize: 11 }}>.text-subtitle</code>, and{" "}
        <code style={{ fontFamily: "var(--font-sans)", fontSize: 11 }}>.text-body</code> bundle
        font-family + size + line-height + letter-spacing + weight into a single class and override
        Tailwind&apos;s auto-generated <code style={{ fontFamily: "var(--font-sans)", fontSize: 11 }}>text-*</code> utilities
        from primitive.css. Source: <code style={{ fontFamily: "var(--font-sans)", fontSize: 11 }}>utilities.css</code>.
      </p>

      {/* Column headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 56px 56px 80px 1fr",
          gap: 12,
          padding: "8px 0",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: 4,
        }}
      >
        {["Token / Utility", "rem", "px", "Weight", "Usage"].map((h) => (
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

      <TypeRow
        token="--text-display"
        sample="Page title"
        sizeRem="1.5rem"
        sizePx="24px"
        weight="600"
        utility=".text-display"
        usage="Page title (H1) — hero / display heading. Also used for metric tile numbers."
      />
      <TypeRow
        token="--text-subtitle"
        sample="Section heading"
        sizeRem="1rem"
        sizePx="16px"
        weight="600"
        utility=".text-subtitle"
        usage="Section title (H2) — dialog title, drawer header, sheet header, section headings."
      />
      <TypeRow
        token="--text-body"
        sample="The quick brown fox jumps over the lazy dog"
        sizeRem="0.875rem"
        sizePx="14px"
        weight="400"
        utility=".text-body"
        usage="Universal paragraph font — default reading text, table cell prose. Use this whenever in doubt."
      />
    </div>
  ),
};

// ─── Weights ──────────────────────────────────────────────────────────────────

const WEIGHTS = [
  {
    token: "--font-weight-regular",
    value: 400,
    label: "Regular",
    usedFor: "Body prose, table cell values, input text, timestamp copy, helper text. The default — everything that isn't being emphasized.",
  },
  {
    token: "--font-weight-semibold",
    value: 600,
    label: "Semibold",
    usedFor: "Page titles (H1), metric display numbers, stat tiles, run name in a hero position. Error severity labels and FAILED / OOM badges.",
  },
];

export const Weights: StoryObj = {
  name: "Weights",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", background: "var(--color-background)", padding: 24, maxWidth: 640 }}>
      <Eyebrow label="Weights — IBM Plex Sans" />
      <ColHeaders cols={["Token", "Value", "Used for"]} template="200px 60px 1fr" />

      {WEIGHTS.map(({ token, value, usedFor }) => (
        <div
          key={token}
          style={{
            display: "grid",
            gridTemplateColumns: "200px 60px 1fr",
            gap: 12,
            padding: "16px 0",
            borderBottom: "1px solid var(--color-border)",
            alignItems: "start",
          }}
        >
          {/* Sample text */}
          <div style={{ gridColumn: "1 / -1", fontFamily: "var(--font-sans)", fontSize: "var(--text-body)", fontWeight: value, color: "var(--color-foreground)", marginBottom: 6 }}>
            The quick brown fox jumps over the lazy dog
          </div>

          {/* Metadata row */}
          <code style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-foreground)" }}>
            {token}
          </code>
          <Label>{value}</Label>
          <span style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>{usedFor}</span>
        </div>
      ))}
    </div>
  ),
};

// ─── Line Height ──────────────────────────────────────────────────────────────

const LINE_HEIGHT_ROWS = [
  {
    token: "--text-display",
    sizePx: "24px",
    lineHeightCss: "2rem",
    lineHeightRatio: "1.33",
    role: "Metric tiles, hero stat numbers",
    sample: [
      "Active users: 1,204",
      "Conversion rate: 84.2%",
      "Avg response: 312ms",
    ],
    weight: 600,
    mono: false,
  },
  {
    token: "--text-subtitle",
    sizePx: "16px",
    lineHeightCss: "1.375rem",
    lineHeightRatio: "1.375",
    role: "Dialog title, drawer header, sheet header, section headings",
    sample: [
      "Account settings",
      "Environment configuration",
      "Delete item",
    ],
    weight: 600,
    mono: false,
  },
  {
    token: "--text-body",
    sizePx: "14px",
    lineHeightCss: "1.375rem",
    lineHeightRatio: "1.57",
    role: "Default body text, table cell prose",
    sample: [
      "Tap any field to edit. Changes save automatically.",
      "Select a row to view details, or use the filters above.",
      "The quick brown fox jumps over the lazy dog.",
    ],
    weight: 400,
    mono: false,
  },
];

export const LineHeight: StoryObj = {
  name: "Line Height",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", background: "var(--color-background)", padding: 24, maxWidth: 720 }}>
      <Eyebrow label="Line Height" />
      <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginBottom: 16, marginTop: 4 }}>
        Each block shows 3 lines of representative text so leading differences are visible.
        Ratios reflect the authoritative guideline §4.
      </p>

      {LINE_HEIGHT_ROWS.map(({ token, sizePx, lineHeightCss, lineHeightRatio, role, sample, weight }) => (
        <div
          key={token}
          style={{
            padding: "16px 0",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          {/* Multi-line paragraph */}
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: `var(${token})`,
              fontWeight: weight,
              lineHeight: lineHeightCss,
              color: "var(--color-foreground)",
              marginBottom: 10,
              whiteSpace: "pre-line",
            }}
          >
            {sample.join("\n")}
          </div>

          {/* Annotation row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "200px 80px 220px 1fr",
              gap: 12,
              alignItems: "center",
            }}
          >
            <code style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-foreground)" }}>
              {token}
            </code>
            <Label>{sizePx}</Label>
            <Label>{lineHeightRatio}</Label>
            <span style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>{role}</span>
          </div>
        </div>
      ))}
    </div>
  ),
};

// ─── Letter Spacing ───────────────────────────────────────────────────────────

const LETTER_SPACING_ROWS = [
  {
    token: "--text-display",
    tracking: "-0.02em",
    trackingLabel: "-0.02em",
    role: "Metric tiles, hero stat numbers",
    sample: "Page title",
    weight: 600,
    fontSize: "var(--text-display)",
    uppercase: false,
  },
  {
    token: "--text-subtitle",
    tracking: "-0.01em",
    trackingLabel: "-0.01em",
    role: "Dialog title, drawer header, sheet header, section headings",
    sample: "Section heading",
    weight: 600,
    fontSize: "var(--text-subtitle)",
    uppercase: false,
  },
  {
    token: "--text-body",
    tracking: "0",
    trackingLabel: "0",
    role: "Default body text, table cell prose",
    sample: "The quick brown fox jumps over the lazy dog",
    weight: 400,
    fontSize: "var(--text-body)",
    uppercase: false,
  },
];

export const LetterSpacing: StoryObj = {
  name: "Letter Spacing",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", background: "var(--color-background)", padding: 24, maxWidth: 720 }}>
      <Eyebrow label="Letter Spacing" />
      <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginBottom: 16, marginTop: 4 }}>
        Tracking values from typography.css.
      </p>

      <ColHeaders cols={["Token", "Tracking", "Role", "Sample"]} template="200px 100px 260px 1fr" />

      {LETTER_SPACING_ROWS.map(({ token, tracking, trackingLabel, role, sample, weight, fontSize, uppercase }) => (
        <div
          key={token}
          style={{
            display: "grid",
            gridTemplateColumns: "200px 100px 260px 1fr",
            gap: 12,
            padding: "14px 0",
            borderBottom: "1px solid var(--color-border)",
            alignItems: "center",
          }}
        >
          <code style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-foreground)" }}>
            {token}
          </code>
          <Label>{trackingLabel}</Label>
          <span style={{ fontSize: 11, color: "var(--color-muted-foreground)" }}>{role}</span>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize,
              fontWeight: weight,
              letterSpacing: tracking,
              textTransform: uppercase ? "uppercase" : "none",
              color: "var(--color-foreground)",
            }}
          >
            {sample}
          </div>
        </div>
      ))}
    </div>
  ),
};

// ─── Tabular Figures ──────────────────────────────────────────────────────────

const NUMERIC_SAMPLES = ["1,204.00", "98.50", "100.00", "7.30", "512.80"];

export const TabularFigures: StoryObj = {
  name: "Tabular Figures",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", background: "var(--color-background)", padding: 24, maxWidth: 560 }}>
      <Eyebrow label="Tabular Figures" />
      <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginBottom: 20, marginTop: 4 }}>
        Proportional figures cause column drift in numeric cells (a &quot;1&quot; is narrower than an &quot;8&quot;).
        Tabular + lining numerals keep decimal points locked across rows.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: "1px solid var(--color-border)", borderRadius: 6, overflow: "hidden" }}>
        {/* Left column — proportional (default) */}
        <div style={{ borderRight: "1px solid var(--color-border)" }}>
          <div
            style={{
              padding: "8px 16px",
              borderBottom: "1px solid var(--color-border)",
              background: "var(--color-secondary)",
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-muted-foreground)" }}>
              Proportional
            </span>
            <div style={{ display: "block", marginTop: 2, fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-muted-foreground)" }}>
              default
            </div>
          </div>
          {NUMERIC_SAMPLES.map((score) => (
            <div
              key={`prop-${score}`}
              style={{
                padding: "7px 16px",
                borderBottom: "1px solid var(--color-border)",
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-body)",
                fontWeight: 400,
                color: "var(--color-foreground)",
              }}
            >
              {score}
            </div>
          ))}
        </div>

        {/* Right column — tabular + lining */}
        <div>
          <div
            style={{
              padding: "8px 16px",
              borderBottom: "1px solid var(--color-border)",
              background: "var(--color-secondary)",
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-muted-foreground)" }}>
              Tabular + Lining
            </span>
            <div style={{ display: "block", marginTop: 2, fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-muted-foreground)" }}>
              {"font-feature-settings: 'tnum' 1, 'lnum' 1"}
            </div>
          </div>
          {NUMERIC_SAMPLES.map((score) => (
            <div
              key={`tab-${score}`}
              style={{
                padding: "7px 16px",
                borderBottom: "1px solid var(--color-border)",
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-body)",
                fontWeight: 400,
                color: "var(--color-foreground)",
                fontFeatureSettings: "'tnum' 1, 'lnum' 1",
              }}
            >
              {score}
            </div>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginTop: 12 }}>
        Apply <code style={{ fontFamily: "var(--font-sans)", fontSize: 11 }}>font-feature-settings: &apos;tnum&apos; 1, &apos;lnum&apos; 1</code> to all
        numeric table cells, metric tile values, and counters.
      </p>
    </div>
  ),
};

// ─── Font Families ────────────────────────────────────────────────────────────

export const FontFamilies: StoryObj = {
  name: "Font Families",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", background: "var(--color-background)", padding: 24 }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-muted-foreground)",
          marginBottom: 16,
        }}
      >
        Font Families
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <div
          style={{
            background: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: 20,
          }}
        >
          <code
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              background: "var(--color-secondary)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              padding: "1px 6px",
              color: "var(--color-muted-foreground)",
              display: "inline-block",
              marginBottom: 10,
            }}
          >
            --font-sans
          </code>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 600, color: "var(--color-foreground)" }}>
            IBM Plex Sans
          </div>
          <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginTop: 2 }}>
            Primary UI typeface. All body, labels, headings.
          </p>
        </div>
      </div>
    </div>
  ),
};
