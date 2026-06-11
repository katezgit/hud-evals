interface CostFormulaProps {
  modelCount: number;
  groupSize: number;
  taskCount: number;
}

export default function CostFormula({ modelCount, groupSize, taskCount }: CostFormulaProps) {
  const traces = modelCount * taskCount * groupSize;
  return (
    <span className="font-mono text-meta text-muted-foreground">
      <span className="tabular-nums">{modelCount}</span>
      <span className="px-1 text-meta-foreground">×</span>
      <span className="tabular-nums">{taskCount}</span>
      <span className="px-1 text-meta-foreground">×</span>
      <span className="tabular-nums">{groupSize}</span>
      <span className="px-1 text-meta-foreground">=</span>
      <span className="tabular-nums">{traces}</span> traces
    </span>
  );
}
