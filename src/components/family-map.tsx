import type { Person, Relationship } from "@prisma/client";

/**
 * Household Intelligence Map — a minimal SVG visualization of the household.
 * Primary earner at the centre; other earners on an inner ring; dependents on
 * an outer ring. Edges show relationships; thicker/solid lines mean financially
 * linked.
 */
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
        No people added yet. Your household map will appear here as you add people and relationships.
      </div>
    );
  }

  const width = 760;
  const height = 380;
  const cx = width / 2;
  const cy = height / 2;
  const rInner = 96;
  const rOuter = 160;

  const primary = persons.filter((p) => p.isPrimary);
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
  } else if (primary.length > 1) {
    pointsOnCircle(primary.length, rInner * 0.55).forEach((pt, i) => coords.set(primary[i].id, pt));
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
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto"
      >
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#D4EDDA" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#F5F7FA" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={cx} cy={cy} r={rOuter + 30} fill="url(#mapGlow)" />

        {/* Relationship edges */}
        {relationships.map((r) => {
          const a = coords.get(r.fromId);
          const b = coords.get(r.toId);
          if (!a || !b) return null;
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          const dashed = !r.financiallyLinked;
          const label = r.type.replace(/_/g, " ").toLowerCase();
          return (
            <g key={r.id}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#0F5132"
                strokeWidth={r.financiallyLinked ? 1.8 : 1}
                strokeDasharray={dashed ? "4 3" : ""}
                opacity={0.35}
              />
              <text x={midX} y={midY - 4} textAnchor="middle" fontSize="10" fill="#64748B">
                {label}
              </text>
            </g>
          );
        })}

        {/* Person nodes */}
        {persons.map((p) => {
          const pt = coords.get(p.id)!;
          const fill = p.isPrimary ? "#0F5132" : p.isDependent ? "#D4EDDA" : "#FFFFFF";
          const stroke = p.isPrimary ? "#0F5132" : "#CBD5E1";
          const textFill = p.isPrimary ? "#FFFFFF" : "#0F172A";
          const initials = (p.preferredName ?? p.fullName)
            .split(/\s+/)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase() ?? "")
            .join("") || "?";
          const radius = p.isPrimary ? 28 : 24;
          return (
            <g key={p.id} transform={`translate(${pt.x} ${pt.y})`}>
              <circle r={radius} fill={fill} stroke={stroke} strokeWidth={1.4} />
              <text textAnchor="middle" dy="5" fontSize="12" fontWeight="600" fill={textFill}>
                {initials}
              </text>
              <text textAnchor="middle" y={radius + 16} fontSize="11" fill="#334155">
                {p.preferredName ?? p.fullName}
              </text>
              {p.specialNeedsFlag ? (
                <circle r={4} cx={radius - 8} cy={-radius + 8} fill="#A16207">
                  <title>Special-needs planning considerations</title>
                </circle>
              ) : null}
              {p.elderlyFlag ? (
                <circle r={4} cx={-(radius - 8)} cy={-radius + 8} fill="#64748B">
                  <title>Elderly dependent</title>
                </circle>
              ) : null}
              {p.isCaregiver ? (
                <circle r={4} cx={radius - 8} cy={radius - 8} fill="#0E7490">
                  <title>Primary caregiver</title>
                </circle>
              ) : null}
            </g>
          );
        })}
      </svg>
      <div className="mt-3 text-[11px] text-ink-500 flex items-center gap-4 flex-wrap justify-center">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-brand-deep" /> Primary / earner
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-brand-mint" /> Dependent
        </span>
        <span>— financially linked</span>
        <span>-- not linked</span>
        <span className="text-severity-medium">· special-needs</span>
        <span className="text-ink-500">· elderly</span>
        <span className="text-severity-low">· caregiver</span>
      </div>
    </div>
  );
}
