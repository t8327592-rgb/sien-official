import { orderInputClass } from "./order-form-styles";
import { isPackagePlan, type TrackDraft } from "@/lib/order-tracks";
import { formatYen } from "@/lib/public-format";
import { VOCAL_KEYS } from "@/lib/order-vocal-keys";
import { VOCAL_GUIDES, isHumanVocalGuide } from "@/lib/vocal-guide";
import { REFERENCE_FIDELITY_OPTIONS } from "@/lib/order-reference";

type Plan = { id: string; name: string };
type Option = { id: string; name: string; priceText: string };

export function AdditionalTrackFields({ track, position, plans, options, original, sale, price, onChange, onRemove }: {
  track: TrackDraft; position: number; plans: Plan[]; options: Option[]; original: boolean; sale: boolean; price: number | null;
  onChange: (patch: Partial<TrackDraft>) => void; onRemove: () => void;
}) {
  const label = "block space-y-1 text-sm font-semibold text-slate-700";
  const guideOption = original ? options.find(isHumanVocalGuide) : undefined;
  const plan = plans.find(plan => plan.id === track.planId);

  return <fieldset className="space-y-4 rounded-2xl border border-slate-200 p-4 sm:p-5">
    <legend className="px-2 font-bold text-slate-900">{position}曲目</legend>
    <div className="flex items-center justify-between gap-4 text-sm">
      <strong className="text-slate-700">{price === null ? "要お見積もり" : formatYen(price)}</strong>
      <button type="button" aria-label={`${position}曲目を削除`} onClick={onRemove} className="px-2 py-1 text-red-700 underline">削除</button>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={label}><span>曲名{sale ? "（未定可）" : "（必須）"}</span><input id={`${track.key}-title`} className={orderInputClass} required={!sale} maxLength={300} value={track.songTitle} onChange={event => onChange({ songTitle: event.target.value })} /></label>
      <label className={label}><span>素材URL</span><input className={orderInputClass} type="url" maxLength={2000} value={track.materialsUrl} onChange={event => onChange({ materialsUrl: event.target.value })} /></label>
      <label className={label}><span>プラン</span><select className={orderInputClass} required value={track.planId} onChange={event => onChange({ planId: event.target.value })}><option value="">プランを選択</option>{plans.filter(plan => !isPackagePlan(plan.name)).map(plan => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></label>
      <label className={label}><span>参考曲URL</span><input className={orderInputClass} type="url" maxLength={2000} value={track.referenceUrl} onChange={event => onChange({ referenceUrl: event.target.value })} /></label>
      <label className={label}><span>希望納期</span><input className={orderInputClass} maxLength={120} value={track.deadline} onChange={event => onChange({ deadline: event.target.value })} /></label>
      {original ? <label className={label}><span>ジャンル（必須）</span><input className={orderInputClass} required maxLength={300} value={track.genre} onChange={event => onChange({ genre: event.target.value })} /></label> :
        <label className={label}><span>歌唱キー</span><select className={orderInputClass} value={track.vocalKey} onChange={event => onChange({ vocalKey: event.target.value })}>{VOCAL_KEYS.map(key => <option key={key}>{key}</option>)}</select></label>}
      {track.referenceUrl && <label className={label}><span>参考曲との近さ</span><select className={orderInputClass} value={track.referenceFidelity} onChange={event => onChange({ referenceFidelity: event.target.value })}>{REFERENCE_FIDELITY_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>}
      {original && !/フルパッケージ|作詞持ち込み/.test(plan?.name ?? "") && <label className={label}><span>作詞</span><select className={orderInputClass} value={track.lyricsStatus} onChange={event => onChange({ lyricsStatus: event.target.value })}>{["未定", "歌詞あり", "作詞から依頼したい"].map(value => <option key={value}>{value}</option>)}</select></label>}
      {original && <label className={label}><span>仮歌</span><select className={orderInputClass} value={track.vocalGuideStatus} onChange={event => {
        const vocalGuideStatus = event.target.value;
        const optionIds = track.optionIds.filter(id => id !== guideOption?.id);
        onChange({ vocalGuideStatus, optionIds: vocalGuideStatus === "人間による仮歌" && guideOption ? [...optionIds, guideOption.id] : optionIds });
      }}>{VOCAL_GUIDES.filter(value => value !== "人間による仮歌" || guideOption).map(value => <option key={value}>{value}</option>)}</select></label>}
    </div>
    {options.some(option => option.id !== guideOption?.id) && <fieldset className="space-y-2"><legend className="mb-2 text-sm font-bold">オプション</legend>
      {options.filter(option => option.id !== guideOption?.id).map(option => {
        const checked = track.optionIds.includes(option.id);
        return <div key={option.id} className="space-y-2">
          <label className="flex items-start gap-2 text-sm"><input className="mt-1" type="checkbox" checked={checked} onChange={event => onChange({ optionIds: event.target.checked ? [...track.optionIds, option.id] : track.optionIds.filter(id => id !== option.id) })} /><span>{option.name}（{option.priceText}）</span></label>
          {checked && option.name.includes("カットアップ") && <label className={`${label} pl-6`}><span>カットアップの長さ（秒）</span><input type="number" min={1} max={3600} step={1} required className={`${orderInputClass} max-w-36`} value={track.cutSeconds[option.id] ?? 10} onChange={event => onChange({ cutSeconds: { ...track.cutSeconds, [option.id]: Number(event.target.value) } })} /></label>}
        </div>;
      })}
    </fieldset>}
    <label className={label}><span>この曲へのご要望</span><textarea className={orderInputClass} rows={2} maxLength={1000} value={track.note} onChange={event => onChange({ note: event.target.value })} /></label>
  </fieldset>;
}
