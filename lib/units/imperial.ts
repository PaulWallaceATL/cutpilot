/** User-facing imperial; DB remains metric (cm, kg). */

const LB_PER_KG = 2.2046226218;
const CM_PER_INCH = 2.54;

export function kgToLb(kg: number): number {
  return kg * LB_PER_KG;
}

export function lbToKg(lb: number): number {
  return lb / LB_PER_KG;
}

export function cmToTotalInches(cm: number): number {
  return cm / CM_PER_INCH;
}

export function totalInchesToCm(inches: number): number {
  return inches * CM_PER_INCH;
}

/** Split total inches into feet and whole inches remainder (0–11). */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const total = Math.round(cmToTotalInches(cm));
  const feet = Math.floor(total / 12);
  const inches = total % 12;
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches;
  return totalInchesToCm(totalInches);
}

export function formatWeightLb(kg: number | null | undefined, decimals = 0): string {
  if (kg == null || Number.isNaN(kg)) return "—";
  const lb = kgToLb(kg);
  return `${decimals > 0 ? lb.toFixed(decimals) : Math.round(lb)} lb`;
}

export function formatHeightImperial(cm: number | null | undefined): string {
  if (cm == null || Number.isNaN(cm)) return "—";
  const { feet, inches } = cmToFeetInches(cm);
  return `${feet}'${inches}"`;
}

export function parseWeightLbToKg(input: string | number): number | null {
  const n = typeof input === "number" ? input : parseFloat(String(input).replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(n)) return null;
  return lbToKg(n);
}

export function parseFeetInchesToCm(feet: string | number, inches: string | number): number | null {
  const f = typeof feet === "number" ? feet : parseInt(String(feet), 10);
  const i = typeof inches === "number" ? inches : parseInt(String(inches), 10);
  if (Number.isNaN(f) || Number.isNaN(i) || f < 0 || i < 0 || i > 11) return null;
  return feetInchesToCm(f, i);
}
