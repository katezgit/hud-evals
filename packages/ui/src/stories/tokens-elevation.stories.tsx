import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

type OverlayCardProps = {
  bgToken: string;
  bgResolvedValue: string;
  blurToken: string;
  blurResolvedValue: string;
  label: string;
  usage: string;
};

/** Generic dashboard content rendered behind the overlay so dim + blur are visible. */
function DashboardBehindOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--color-background)",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Header row: page title + action buttons */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-primary)" }} />
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--color-foreground)" }}>
            job-2847
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              padding: "1px 6px",
              borderRadius: "var(--radius-full)",
              background: "var(--color-secondary)",
              color: "var(--color-secondary-foreground)",
            }}
          >
            active
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <div
            style={{
              height: 22,
              paddingLeft: 8,
              paddingRight: 8,
              borderRadius: "var(--radius-sm)",
              background: "var(--color-secondary)",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 10, color: "var(--color-muted-foreground)" }}>Export</span>
          </div>
          <div
            style={{
              height: 22,
              paddingLeft: 8,
              paddingRight: 8,
              borderRadius: "var(--radius-sm)",
              background: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 10, color: "var(--color-primary-foreground)" }}>Cancel</span>
          </div>
        </div>
      </div>

      {/* Mini metric row */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { label: "Items", value: "1,204" },
          { label: "Success", value: "84.2%" },
          { label: "Avg time", value: "312ms" },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              flex: 1,
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              padding: "5px 8px",
            }}
          >
            <div style={{ fontSize: 9, color: "var(--color-muted-foreground)" }}>{label}</div>
            <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--font-sans)", color: "var(--color-foreground)" }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Mini table */}
      <div
        style={{
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-sm)",
          overflow: "hidden",
          fontSize: 10,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            background: "var(--color-muted)",
            padding: "4px 8px",
            color: "var(--color-muted-foreground)",
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          <span>ID</span>
          <span>Value</span>
          <span>Status</span>
        </div>
        {[
          { id: "item-0041", score: "98.2", status: "pass" },
          { id: "item-0042", score: "61.0", status: "fail" },
          { id: "item-0043", score: "88.5", status: "pass" },
        ].map(({ id, score, status }) => (
          <div
            key={id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              padding: "4px 8px",
              borderTop: "1px solid var(--color-border)",
              color: "var(--color-foreground)",
            }}
          >
            <span style={{ fontFamily: "var(--font-sans)" }}>{id}</span>
            <span style={{ fontFamily: "var(--font-sans)" }}>{score}</span>
            <span style={{ color: status === "pass" ? "var(--color-primary)" : "var(--color-destructive)" }}>
              {status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OverlayCard({ bgToken, bgResolvedValue, blurToken, blurResolvedValue, label, usage }: OverlayCardProps) {
  return (
    <div>
      {/* Demo frame: real dashboard content visible through the overlay */}
      <div
        style={{
          position: "relative",
          borderRadius: "var(--radius-lg)",
          height: 220,
          overflow: "hidden",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Dashboard content behind the overlay — gives blur + dim something to act on */}
        <DashboardBehindOverlay />

        {/* Overlay: uses actual CSS tokens so values resolve from components.css */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `var(${bgToken})`,
            backdropFilter: `blur(var(${blurToken}))`,
            WebkitBackdropFilter: `blur(var(${blurToken}))`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--color-foreground)",
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              padding: "4px 10px",
              boxShadow: "var(--shadow-1)",
            }}
          >
            {label}
          </span>
        </div>
      </div>

      {/* Token metadata */}
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 3 }}>
        <div>
          <code
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              color: "var(--color-foreground)",
              display: "block",
            }}
          >
            {bgToken}
          </code>
          <code
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              color: "var(--color-muted-foreground)",
              display: "block",
            }}
          >
            {bgResolvedValue}
          </code>
        </div>
        <div>
          <code
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              color: "var(--color-foreground)",
              display: "block",
            }}
          >
            {blurToken}
          </code>
          <code
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              color: "var(--color-muted-foreground)",
              display: "block",
            }}
          >
            {blurResolvedValue}
          </code>
        </div>
        <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginTop: 1 }}>{usage}</p>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Design Tokens/5. Elevation",
  parameters: { layout: "padded" },
};
export default meta;

type ElevationCardProps = {
  shadowToken: string;
  label: string;
  usage: string;
};

function ElevationCard({ shadowToken, label, usage }: ElevationCardProps) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--radius-lg)",
          height: 100,
          background: "var(--color-card)",
          boxShadow: `var(${shadowToken})`,
          fontSize: 12,
          fontWeight: 500,
          color: "var(--color-muted-foreground)",
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 10 }}>
        <code
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            color: "var(--color-foreground)",
            display: "block",
          }}
        >
          {shadowToken}
        </code>
        <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginTop: 3 }}>{usage}</p>
      </div>
    </div>
  );
}

export const ShadowScale: StoryObj = {
  name: "Shadow Scale",
  render: () => (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        background: "var(--color-background)",
        padding: 40,
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-muted-foreground)",
          marginBottom: 24,
        }}
      >
        Primitive shadow scale
      </p>
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, marginBottom: 48 }}
      >
        <ElevationCard
          shadowToken="--shadow-1"
          label="shadow-1"
          usage="Cards, surface lift"
        />
        <ElevationCard
          shadowToken="--shadow-2"
          label="shadow-2"
          usage="Popovers, dropdowns"
        />
        <ElevationCard
          shadowToken="--shadow-3"
          label="shadow-3"
          usage="Modals, command palette, drawers"
        />
      </div>

      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-muted-foreground)",
          marginBottom: 24,
        }}
      >
        Semantic aliases
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, marginBottom: 48 }}>
        <ElevationCard
          shadowToken="--shadow-card"
          label="shadow-card"
          usage="→ shadow-1"
        />
        <ElevationCard
          shadowToken="--shadow-popover"
          label="shadow-popover"
          usage="→ shadow-2"
        />
        <ElevationCard
          shadowToken="--shadow-modal"
          label="shadow-modal"
          usage="→ shadow-3"
        />
      </div>

      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-muted-foreground)",
          marginBottom: 24,
        }}
      >
        Special purpose
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
        <ElevationCard
          shadowToken="--shadow-chip"
          label="shadow-chip"
          usage="Compact lift for tags / badges"
        />
        <ElevationCard
          shadowToken="--shadow-scroll-cue"
          label="shadow-scroll-cue"
          usage="Sticky header scroll cue (dialog/drawer)"
        />
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-lg)",
              height: 100,
              background: "var(--color-card)",
              border: "1px solid var(--color-destructive)",
              boxShadow: "var(--shadow-focus-errored)",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--color-muted-foreground)",
            }}
          >
            shadow-focus-errored
          </div>
          <div style={{ marginTop: 10 }}>
            <code
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                color: "var(--color-foreground)",
                display: "block",
              }}
            >
              --shadow-focus-errored
            </code>
            <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginTop: 3 }}>
              3px outer halo — error focus state
            </p>
          </div>
        </div>

        <ElevationCard
          shadowToken="--shadow-command"
          label="shadow-command"
          usage="→ shadow-3 — command palette"
        />
        <ElevationCard
          shadowToken="--shadow-drawer"
          label="shadow-drawer"
          usage="→ shadow-3 — side drawer panel"
        />
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-lg)",
              height: 100,
              background: "var(--color-card)",
              boxShadow: "var(--shadow-drawer-edge)",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--color-muted-foreground)",
            }}
          >
            shadow-drawer-edge
          </div>
          <div style={{ marginTop: 10 }}>
            <code style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-foreground)", display: "block" }}>
              --shadow-drawer-edge
            </code>
            <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginTop: 3 }}>
              shadow-3 + inset 1px border — drawer with inset edge separation
            </p>
          </div>
        </div>

        <ElevationCard
          shadowToken="--shadow-scroll-cue-inverted"
          label="shadow-scroll-cue-inverted"
          usage="Footer scroll cue (upward direction)"
        />
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-lg)",
              height: 100,
              background: "var(--color-card)",
              outline: "2px solid var(--color-ring)",
              outlineOffset: 2,
              boxShadow: "var(--shadow-focus-ring)",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--color-muted-foreground)",
            }}
          >
            shadow-focus-ring
          </div>
          <div style={{ marginTop: 10 }}>
            <code style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-foreground)", display: "block" }}>
              --shadow-focus-ring
            </code>
            <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginTop: 3 }}>
              Base focus ring: 2px #fff + 2px ring color
            </p>
          </div>
        </div>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-sm)",
              height: 100,
              background: "var(--color-card)",
              boxShadow: "var(--shadow-sw-thumb-off)",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--color-muted-foreground)",
            }}
          >
            shadow-sw-thumb-off
          </div>
          <div style={{ marginTop: 10 }}>
            <code style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-foreground)", display: "block" }}>
              --shadow-sw-thumb-off
            </code>
            <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginTop: 3 }}>
              Switch off-state thumb — sole separation cue (no border)
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};

const Z_TIERS = [
  {
    token: "--z-sticky",
    value: "10",
    utility: "z-sticky",
    role: "Sticky elements within scroll — table thead, sticky toolbars",
    color: "var(--color-muted)",
    labelColor: "var(--color-foreground)",
  },
  {
    token: "--z-overlay",
    value: "50",
    utility: "z-overlay",
    role: "All portaled overlays — dialog/drawer backdrop + content, popover, tooltip, select, dropdown-menu, combobox listbox, command palette",
    // --accent/--accent-foreground don't exist in this system; --color-primary/--color-primary-foreground
    // reads as the salient layer above sticky chrome (semantic middle tier).
    color: "var(--color-primary)",
    labelColor: "var(--color-primary-foreground)",
  },
  {
    token: "--z-toast",
    value: "60",
    utility: "z-toast",
    role: "Notifications — always above modals",
    color: "var(--color-foreground)",
    labelColor: "var(--color-background)",
  },
] as const;

export const ZIndex: StoryObj = {
  name: "Z-Index",
  render: () => {
    const CARD_W = 220;
    const CARD_H = 64;
    const STEP_X = 28;
    const STEP_Y = 20;
    const STACK_COUNT = Z_TIERS.length;
    const CANVAS_W = CARD_W + STEP_X * (STACK_COUNT - 1) + 40;
    const CANVAS_H = CARD_H + STEP_Y * (STACK_COUNT - 1) + 40;

    return (
      <div
        style={{
          fontFamily: "var(--font-sans)",
          background: "var(--color-background)",
          padding: 40,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-muted-foreground)",
            marginBottom: 24,
          }}
        >
          Z-Index stacking tiers
        </p>

        {/* Stacking diagram */}
        <div
          style={{
            position: "relative",
            width: CANVAS_W,
            height: CANVAS_H,
            marginBottom: 48,
          }}
        >
          {Z_TIERS.map((tier, i) => (
            <div
              key={tier.token}
              style={{
                position: "absolute",
                left: i * STEP_X,
                top: (STACK_COUNT - 1 - i) * STEP_Y,
                width: CARD_W,
                height: CARD_H,
                borderRadius: 6,
                background: tier.color,
                border: "1px solid rgba(28,32,36,.12)",
                boxShadow: "0 2px 6px rgba(28,32,36,.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                zIndex: Number(tier.value),
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  fontWeight: 600,
                  color: tier.labelColor,
                  opacity: 0.9,
                }}
              >
                {tier.utility}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  fontWeight: 700,
                  color: tier.labelColor,
                  opacity: 0.6,
                }}
              >
                {tier.value}
              </span>
            </div>
          ))}
        </div>

        {/* Token table */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 20,
          }}
        >
          {Z_TIERS.map((tier) => (
            <div key={tier.token}>
              {/* Color swatch */}
              <div
                style={{
                  width: "100%",
                  height: 8,
                  borderRadius: 2,
                  background: tier.color,
                  border: "1px solid rgba(28,32,36,.1)",
                  marginBottom: 10,
                }}
              />
              <code
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  color: "var(--color-foreground)",
                  display: "block",
                  marginBottom: 2,
                }}
              >
                {tier.token}
              </code>
              <code
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 10,
                  color: "var(--color-muted-foreground)",
                  display: "block",
                  marginBottom: 2,
                }}
              >
                {tier.value} · {tier.utility}
              </code>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--color-muted-foreground)",
                  marginTop: 3,
                  lineHeight: 1.4,
                }}
              >
                {tier.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const Overlays: StoryObj = {
  name: "Overlays",
  render: () => (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        background: "var(--color-background)",
        padding: 40,
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-muted-foreground)",
          marginBottom: 24,
        }}
      >
        Overlays
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 32 }}>
        <OverlayCard
          bgToken="--color-overlay-dialog"
          bgResolvedValue="color-mix(in srgb, var(--neutral-950) 10%, transparent) → #1c20241a"
          blurToken="--blur-overlay-dialog"
          blurResolvedValue="var(--blur-xs) → 4px"
          label="overlay-dialog"
          usage="Modal — enforces focus. Heavier dim + blur; content behind recedes."
        />
        <OverlayCard
          bgToken="--color-overlay-drawer"
          bgResolvedValue="color-mix(in srgb, var(--neutral-950) 2%, transparent) → #1c202405"
          blurToken="--blur-overlay-drawer"
          blurResolvedValue="2px"
          label="overlay-drawer"
          usage="Side panel — background reads through. Lighter dim + blur; content stays legible."
        />
      </div>
    </div>
  ),
};
