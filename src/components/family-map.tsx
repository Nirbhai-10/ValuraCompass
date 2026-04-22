import type { Person, Relationship } from "@prisma/client";

/** Minimal, non-animated household map: arranges people in concentric zones based on role. */
export function FamilyMap({
  persons,
  relationships,
}: {
  persons: Person[];
  relationships: (Relationship & { from: Person; to: Person })[];
}) {
  if (persons.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-ink-500 border border-dashed border-line-200 rounded-card">
        No people added yet. Your Household Map will appear here as you add people and relationships.
      </div>
    );
  }

  const width = 720;
  const height = 360;
  const cx = width / 2;
  const cy = height / 2;
  const rInner = 80;
  const rOuter = 150;

  const primary = persons.filter((p) => p.isPrimary);
  const earnersNonPrimary: Person[] = [];
  const dependents = persons.filter((p) => p.isDependent);
  const others = persons.filter((p) => !p.isPrimary && !p.isDependent);

  function pointsOnCircle(n: number, r: number, offset = 0): { x: number; y: number }[] {
    if (n === 0) return [];
    const step = (2 * Math.PI) / n;
    return Array.from({ length: n }, (_, i) => ({
      x: cx + r * Math.cos(-Math.PI / 2 + i * step + offset),
      y: cy + r * Math.sin(-Math.PI / 2 + i * step + offset),
    }));
  }

  const coords = new Map<string, { x: number; y: number }>();
  if (primary.length === 1) {
    coords.set(primary[0].id, { x: cx, y: cy });
  } else {
    pointsOnCircle(primary.length, rInner * 0.6).forEach((pt, i) => coords.set(primary[i].id, pt));
  }

  others.forEach((p, i, arr) => {
    const pt = pointsOnCircle(arr.length, rInner)[i];
    coords.set(p.id, pt);
  });
  dependents.forEach((p, i, arr) => {
    const pt = pointsOnCircle(arr.length, rOuter, Math.PI / 6)[i];
    coords.set(p.id, pt);
  });

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
        {/* Edges */}
        {relationships.map((r) => {
          const a = coords.get(r.fromId);
          const b = coords.get(r.toId);
          if (!a || !b) return null;
          const dashed = !r.financiallyLinked;
          return (
            <line
              key={r.id}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#0F5132"
              strokeWidth={r.financiallyLinked ? 1.6 : 1}
              strokeDasharray={dashed ? "4 3" : ""}
              opacity={0.35}
            />
          );
        })}
        {/* Nodes */}
        {persons.map((p) => {
          const pt = coords.get(p.id)!;
          const fill = p.isPrimary ? "#0F5132" : p.isDependent ? "#D4EDDA" : "#FFFFFF";
          const stroke = p.isPrimary ? "#0F5132" : "#CBD5E1";
          const textFill = p.isPrimary ? "#FFFFFF" : "#0F172A";
          const initials = p.fullName
            .split(/\s+/)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase() ?? "")
            .join("");
          return (
            <g key={p.id} transform={`translate(${pt.x} ${pt.y})`}>
              <circle r={26} fill={fill} stroke={stroke} strokeWidth={1.2} />
              <text textAnchor="middle" dy="5" fontSize="12" fontWeight="600" fill={textFill}>
                {initials || "?"}
              </text>
              <text textAnchor="middle" y={44} fontSize="11" fill="#334155">
                {p.preferredName ?? p.fullName}
              </text>
              {p.specialNeedsFlag ? (
                <circle r={4} cx={20} cy={-20} fill="#A16207" />
              ) : null}
              {p.elderlyFlag ? (
                <circle r={4} cx={-20} cy={-20} fill="#64748B" />
              ) : null}
            </g>
          );
        })}
      </svg>
      <div className="mt-3 text-[11px] text-ink-500 flex items-center gap-4 justify-center">
        <span>● Primary · earners</span>
        <span>◐ Dependents</span>
        <span>— financially linked</span>
        <span>-- not linked</span>
        <span className="text-severity-medium">◦ special-needs tag</span>
      </div>
    </div>
  );
}
