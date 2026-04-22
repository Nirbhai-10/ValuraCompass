export interface ScoreComponent {
  id: string;
  label: string;
  value: number; // 0..100 contribution
  weight: number; // 0..1
}

export interface Score {
  id: string;
  label: string;
  value: number; // 0..100
  band: string;
  narrative: string;
  components: ScoreComponent[];
  confidence: number; // 0..1
}

export interface ScoreSet {
  FHS: Score;
  ERS: Score;
  CFS: Score;
  IDS: Score;
  PAS: Score;
  DSS: Score;
  RRS: Score;
  LAS: Score;
  HFS: Score;
  FDRS: Score;
  TES: Score;
  CRS: Score;
  ESS: Score;
  RPS: Score;
  ISS: Score;
  DCS: Score;
  PCS: Score;
  FTS: Score;
  AUI: Score;
  GFS_AVG: Score;
}

export interface CashFlowSnapshot {
  monthlyNetIncome: number;
  essentialMonthlyExpenses: number;
  discretionaryMonthlyExpenses: number;
  totalEMI: number;
  monthlySurplus: number;
  savingsRate: number; // 0..1
}

export interface AllocationSnapshot {
  total: number;
  byClass: Record<string, number>;
  liquid: number; // t0 + t2
  liquid30d: number;
  illiquid: number;
  concentrationTop: { label: string; share: number } | null;
}
