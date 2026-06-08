import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";

const meta: Meta = {
  title: "Design Tokens/6. Motion",
  parameters: { layout: "padded" },
};
export default meta;

// ─── Duration scale ───────────────────────────────────────────────────────────

type DurationRowProps = {
  token: string;
  label: string;
  usage: string;
  widthPct: number;
};

function DurationRow({ token, label, usage, widthPct }: DurationRowProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
      <code
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          color: "var(--color-foreground)",
          width: 160,
          flexShrink: 0,
        }}
      >
        {token}
      </code>
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          color: "var(--color-muted-foreground)",
          width: 44,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 6,
          background: "var(--color-secondary)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${widthPct}%`,
            background: "var(--color-foreground)",
            borderRadius: "var(--radius-full)",
          }}
        />
      </div>
      <span style={{ fontSize: 11, color: "var(--color-muted-foreground)", width: 220, flexShrink: 0 }}>
        {usage}
      </span>
    </div>
  );
}

export const DurationScale: StoryObj = {
  name: "Duration Scale",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", background: "var(--color-background)", padding: 40 }}>
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
        Duration scale — 4 steps, 80–220ms ceiling
      </p>
      <DurationRow token="--duration-instant" label="80ms"  usage="Hover bg, press overlay" widthPct={36} />
      <DurationRow token="--duration-fast"    label="120ms" usage="Focus ring, badge state change, icon swap" widthPct={54} />
      <DurationRow token="--duration-subtle"  label="180ms" usage="Button press scale, row select highlight" widthPct={82} />
      <DurationRow token="--duration-base"    label="220ms" usage="Modal/popover enter, row reveal, skeleton shimmer" widthPct={100} />
      <p
        style={{
          marginTop: 24,
          fontSize: 11,
          color: "var(--color-muted-foreground)",
          borderLeft: "2px solid var(--color-border)",
          paddingLeft: 12,
        }}
      >
        Reduced-motion: all durations collapse to 0ms via{" "}
        <code style={{ fontFamily: "var(--font-sans)" }}>
          @media (prefers-reduced-motion: reduce)
        </code>
        . Loop animations (shimmer, pulse) are suppressed via{" "}
        <code style={{ fontFamily: "var(--font-sans)" }}>--motion-continuous: none</code>.
      </p>
    </div>
  ),
};

// ─── Easing curves ────────────────────────────────────────────────────────────

type EasingCardProps = {
  token: string;
  value: string;
  usage: string;
  svgPath: string;
};

function EasingCard({ token, value, usage, svgPath }: EasingCardProps) {
  const [playing, setPlaying] = useState(false);

  function play() {
    if (playing) return;
    setPlaying(true);
    setTimeout(() => setPlaying(false), 700);
  }

  return (
    <div
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: 16,
      }}
    >
      <code style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, color: "var(--color-foreground)", display: "block", marginBottom: 2 }}>
        {token}
      </code>
      <code style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: "var(--color-muted-foreground)", display: "block", marginBottom: 12 }}>
        {value}
      </code>
      <svg viewBox="0 0 80 80" style={{ width: "100%", height: 80 }}>
        <line x1="0" y1="0"  x2="80" y2="0"  stroke="var(--color-border)" strokeWidth={0.5} />
        <line x1="0" y1="80" x2="80" y2="80" stroke="var(--color-border)" strokeWidth={0.5} />
        <line x1="0" y1="0"  x2="0"  y2="80" stroke="var(--color-border)" strokeWidth={0.5} />
        <line x1="80" y1="0" x2="80" y2="80" stroke="var(--color-border)" strokeWidth={0.5} />
        <path d={svgPath} fill="none" stroke="var(--color-foreground)" strokeWidth={1.5} />
      </svg>
      {/* Live track — click to play */}
      <div
        onClick={play}
        style={{
          position: "relative",
          marginTop: 12,
          height: 32,
          background: "var(--color-muted)",
          borderRadius: "var(--radius-sm)",
          overflow: "hidden",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            marginTop: -12,
            width: 24,
            height: 24,
            borderRadius: "var(--radius-sm)",
            background: "var(--color-foreground)",
            // Use token for timing-function; duration is hardcoded to 600ms only here
            // because we need the dot to travel the full track width regardless of the
            // token value — this is the DEMO, not a consumer. The token name is shown above.
            transition: `left 600ms var(${token})`,
            left: playing ? "calc(100% - 28px)" : 4,
          }}
        />
      </div>
      <p style={{ marginTop: 8, fontSize: 11, color: "var(--color-muted-foreground)" }}>
        {usage}
      </p>
      <p style={{ marginTop: 4, fontSize: 10, color: "var(--color-muted-foreground)" }}>
        Click track to play
      </p>
    </div>
  );
}

export const EasingCurves: StoryObj = {
  name: "Easing Curves",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", background: "var(--color-background)", padding: 40 }}>
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
        Easing curves — 5 named curves, all exit-weighted
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        <EasingCard
          token="--ease-out-standard"
          value="cubic-bezier(0.2, 0, 0, 1)"
          usage="General state changes: hover, focus ring, badge swap"
          svgPath="M0,80 C16,80 0,0 80,0"
        />
        <EasingCard
          token="--ease-out-emphasized"
          value="cubic-bezier(0.05, 0.7, 0.1, 1)"
          usage="Enter: modal open, row reveal, slide-up"
          svgPath="M0,80 C4,24 8,0 80,0"
        />
        <EasingCard
          token="--ease-in-accelerated"
          value="cubic-bezier(0.3, 0, 1, 1)"
          usage="Exit: modal close, tooltip dismiss, clearing the stage"
          svgPath="M0,80 C24,80 80,0 80,0"
        />
        <EasingCard
          token="--ease-linear"
          value="linear"
          usage="Loops only: skeleton shimmer, indeterminate progress"
          svgPath="M0,80 L80,0"
        />
        <EasingCard
          token="--ease-natural"
          value="cubic-bezier(0.25, 0.1, 0.25, 1)"
          usage="Drawer panel enter — drawer-only. Non-zero initial velocity (CSS ease keyword) so the panel moves from frame one; --ease-out-emphasized's near-flat start would introduce windup from the viewport edge."
          svgPath="M0,80 C20,60 20,0 80,0"
        />
      </div>
    </div>
  ),
};

// ─── Composite semantic roles ─────────────────────────────────────────────────

type RoleRowProps = {
  token: string;
  resolvedValue: string;
  usage: string;
};

function RoleRow({ token, resolvedValue, usage }: RoleRowProps) {
  return (
    <tr>
      <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border)", verticalAlign: "top" }}>
        <code style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-foreground)" }}>
          {token}
        </code>
      </td>
      <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border)", verticalAlign: "top" }}>
        <code style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-muted-foreground)" }}>
          {resolvedValue}
        </code>
      </td>
      <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border)", verticalAlign: "top", fontSize: 11, color: "var(--color-muted-foreground)" }}>
        {usage}
      </td>
    </tr>
  );
}

export const SemanticRoles: StoryObj = {
  name: "Semantic Composite Roles",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", background: "var(--color-background)", padding: 40 }}>
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
        Semantic aliases — use these in components, not raw primitives
      </p>
      <div
        style={{
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "var(--color-muted)" }}>
              {["Token", "Resolves to", "Use when…"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    fontWeight: 600,
                    fontSize: 11,
                    letterSpacing: "0.03em",
                    color: "var(--color-muted-foreground)",
                    padding: "6px 12px",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <RoleRow
              token="--motion-state-change"
              resolvedValue="var(--duration-fast) var(--ease-out-standard)"
              usage="Hover bg, focus ring, badge state swap"
            />
            <RoleRow
              token="--motion-micro"
              resolvedValue="var(--duration-subtle) var(--ease-out-standard)"
              usage="Button press scale, row select highlight"
            />
            <RoleRow
              token="--motion-enter"
              resolvedValue="var(--duration-base) var(--ease-out-emphasized)"
              usage="Modal/popover open, row reveal, tooltip appear"
            />
            <RoleRow
              token="--motion-exit"
              resolvedValue="var(--duration-fast) var(--ease-in-accelerated)"
              usage="Modal/popover close, tooltip dismiss"
            />
            <RoleRow
              token="--motion-continuous"
              resolvedValue="1800ms var(--ease-linear) infinite"
              usage="Skeleton shimmer, indeterminate progress — loops only"
            />
          </tbody>
        </table>
      </div>
      <p
        style={{
          marginTop: 16,
          fontSize: 11,
          color: "var(--color-muted-foreground)",
          borderLeft: "2px solid var(--color-border)",
          paddingLeft: 12,
        }}
      >
        Tailwind usage: these are{" "}
        <code style={{ fontFamily: "var(--font-sans)" }}>:root</code>
        {" "}variables (not @theme), so reference them with the{" "}
        <code style={{ fontFamily: "var(--font-sans)" }}>prop-(--motion-*)</code>
        {" "}syntax in className strings, or inline via{" "}
        <code style={{ fontFamily: "var(--font-sans)" }}>transition: prop-(--motion-state-change)</code>.
      </p>
    </div>
  ),
};

// ─── Named animations ─────────────────────────────────────────────────────────

type AnimationCardProps = {
  token: string;
  resolvedValue: string;
  usage: string;
  animationStyle: React.CSSProperties;
};

function AnimationCard({ token, resolvedValue, usage, animationStyle }: AnimationCardProps) {
  const [key, setKey] = React.useState(0);

  function replay() {
    setKey((k) => k + 1);
  }

  return (
    <div
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: 16,
      }}
    >
      <code style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, color: "var(--color-foreground)", display: "block", marginBottom: 2 }}>
        {token}
      </code>
      <code style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: "var(--color-muted-foreground)", display: "block", marginBottom: 12 }}>
        {resolvedValue}
      </code>
      {/* Live demo — click to replay */}
      <div
        onClick={replay}
        style={{
          position: "relative",
          height: 56,
          background: "var(--color-muted)",
          borderRadius: "var(--radius-sm)",
          overflow: "hidden",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          key={key}
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--radius-sm)",
            background: "var(--color-foreground)",
            ...animationStyle,
          }}
        />
      </div>
      <p style={{ marginTop: 8, fontSize: 11, color: "var(--color-muted-foreground)" }}>{usage}</p>
      <p style={{ marginTop: 4, fontSize: 10, color: "var(--color-muted-foreground)" }}>Click to replay</p>
    </div>
  );
}

export const Animations: StoryObj = {
  name: "Animations",
  render: () => (
    <div style={{ fontFamily: "var(--font-sans)", background: "var(--color-background)", padding: 40 }}>
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
        Named animation tokens — use via animation: var(--animate-*)
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        <AnimationCard
          token="--animate-fade-in"
          resolvedValue="fade-in var(--duration-base) var(--ease-out-standard)"
          usage="Tooltip appear, overlay reveal"
          animationStyle={{ animation: "var(--animate-fade-in)" }}
        />
        <AnimationCard
          token="--animate-fade-out"
          resolvedValue="fade-out var(--duration-fast) var(--ease-in-accelerated)"
          usage="Tooltip dismiss, overlay hide"
          animationStyle={{ animation: "var(--animate-fade-out)", opacity: 0 }}
        />
        <AnimationCard
          token="--animate-slide-up-in"
          resolvedValue="slide-up-in var(--duration-base) var(--ease-out-emphasized)"
          usage="Dialog/popover panel enter — content-pop, 6px translate"
          animationStyle={{ animation: "var(--animate-slide-up-in)" }}
        />
        <AnimationCard
          token="--animate-slide-down-out"
          resolvedValue="slide-down-out var(--duration-fast) var(--ease-in-accelerated)"
          usage="Dialog/popover panel exit"
          animationStyle={{ animation: "var(--animate-slide-down-out)", opacity: 0 }}
        />
        <AnimationCard
          token="--animate-row-reveal"
          resolvedValue="row-reveal var(--duration-base) var(--ease-out-emphasized) both"
          usage="Streaming table row arrival — 4px translate, fill-mode both for staggered reveal"
          animationStyle={{ animation: "var(--animate-row-reveal)" }}
        />
        <AnimationCard
          token="--animate-shimmer"
          resolvedValue="shimmer 1800ms var(--ease-linear) infinite"
          usage="Skeleton loading placeholder — loops until content loads"
          animationStyle={{ animation: "var(--animate-shimmer)", opacity: 0.4 }}
        />
        <AnimationCard
          token="--animate-running-pulse"
          resolvedValue="running-pulse 1600ms var(--ease-linear) infinite"
          usage="In-progress status indicator pulse"
          animationStyle={{ animation: "var(--animate-running-pulse)", borderRadius: "50%", background: "var(--color-state-running)" }}
        />
      </div>
    </div>
  ),
};
