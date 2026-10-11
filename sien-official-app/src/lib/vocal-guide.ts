export const VOCAL_GUIDES = ["不要", "ボーカロイド仮歌（無料）", "人間による仮歌"] as const;
export type VocalGuide = typeof VOCAL_GUIDES[number];
export function isHumanVocalGuide(option: { name: string }) {
  return option.name.includes("人間") && option.name.includes("仮歌");
}
export function vocalGuideFromOptions(status: string, options: { name: string }[]): VocalGuide {
  if (options.some(isHumanVocalGuide)) return "人間による仮歌";
  return status === "ボーカロイド仮歌（無料）" ? status : "不要";
}
