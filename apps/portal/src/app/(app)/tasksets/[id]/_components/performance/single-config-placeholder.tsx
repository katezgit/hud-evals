import ConfigColorDot from "./config-color-dot";

export default function SingleConfigPlaceholder() {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-dashed border-border bg-card/40 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <ConfigColorDot id="B" className="opacity-50" />
        <span className="text-body font-medium">Config B</span>
      </div>
      <p className="text-caption text-muted-foreground">
        Add a second Job to compare.
      </p>
    </div>
  );
}
