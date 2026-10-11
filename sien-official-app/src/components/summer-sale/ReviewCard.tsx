import { Star } from "lucide-react";

interface ReviewCardProps {
  name: string;
  comment: string;
  rating?: number;
}

export default function ReviewCard({ name, comment, rating = 5 }: ReviewCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200 group-hover:bg-cyan-400 transition-colors"></div>
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${i < rating ? "fill-amber-400 text-amber-800" : "fill-slate-100 text-slate-200"}`}
          />
        ))}
      </div>
      <p className="text-slate-700 font-medium leading-relaxed mb-6 flex-1 text-sm md:text-base">
        「{comment}」
      </p>
      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-50">
        <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-sm">
          {name.charAt(0)}
        </div>
        <span className="font-bold text-slate-900 text-sm">{name} 様</span>
      </div>
    </div>
  );
}
