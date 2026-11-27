export const MAX_ORDER_TRACKS = 12;
export const TRACK_STATUS_LABELS = { PENDING: "未着手", WORKING: "作業中", COMPLETED: "納品済み" } as const;
export function isPackagePlan(name: string) {
  return /\d+\s*(?:本|曲)\s*セット/.test(name.normalize("NFKC"));
}

export const emptyTrackFields = {
  songTitle: "", materialsUrl: "", referenceUrl: "", referenceFidelity: "1", vocalKey: "±0（原曲キー）",
  deadline: "", activityPurpose: "", genre: "", lyricsStatus: "未定", vocalGuideStatus: "不要", note: "",
};

export type TrackDraft = typeof emptyTrackFields & { key: string; planId: string; optionIds: string[]; cutSeconds: Record<string, number> };
