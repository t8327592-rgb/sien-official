export const orderPageClass = "min-h-screen bg-brand-bg py-10 md:py-20 font-sans";
export const orderContainerClass = "container mx-auto px-4 max-w-3xl relative";
export const orderHeaderClass = "text-center mb-6 md:mb-12";
export const orderTitleClass = "text-3xl md:text-4xl font-extrabold text-slate-900 mb-6";
export const orderSectionClass = "bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group";
export const orderSectionTitleClass = "text-xl md:text-2xl font-bold text-slate-900 mb-5 md:mb-8 flex items-center gap-3";
export const orderSectionNumberClass = "w-10 h-10 rounded-full bg-orange-500/10 text-orange-700 flex items-center justify-center text-sm font-black tracking-tighter";
export const orderInputClass = "w-full min-h-12 p-3 text-base scroll-mt-40 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all";
export const orderRequiredClass = "ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 border border-red-200 align-middle";
export const orderOptionalClass = "ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 align-middle";
export const orderCheckboxClass = "w-5 h-5 text-orange-700 focus:ring-orange-500 rounded border-slate-300 shrink-0 mt-0.5";
export const orderReviewClass = "scroll-mt-24 bg-orange-50 border border-orange-100 p-5 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden";
export const orderSubmitClass = "w-full px-6 h-12 md:h-16 text-base md:text-lg font-bold rounded-full shadow-xl shadow-orange-500/20 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:brightness-95 hover:scale-105 transition-all";

export function orderOptionClass(selected: boolean) {
  return `cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col gap-1 ${selected ? "border-orange-500 bg-orange-500/5" : "border-slate-200 bg-slate-50 hover:border-orange-500/30 text-slate-600"}`;
}

export function orderReferenceClass(selected: boolean) {
  return `flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all ${selected ? "border-orange-500 bg-orange-500/5" : "border-transparent hover:bg-slate-50"}`;
}
