const categories = {
  MIX: ["MIX", "ボーカルMIX", "ボーカルミックス"],
  ORIGINAL: ["ORIGINAL", "オリジナル楽曲制作"],
} as const;
export function serviceCategory(value: string | null | undefined) {
  if (categories.MIX.some(category => category === value)) return "MIX";
  if (categories.ORIGINAL.some(category => category === value)) return "ORIGINAL";
  return null;
}
export function categoryValues(value: string) {
  const category = serviceCategory(value);
  return category ? [...categories[category]] : [value];
}
