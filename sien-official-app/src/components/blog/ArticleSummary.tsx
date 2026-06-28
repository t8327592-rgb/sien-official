import React from "react";
import { Check } from "lucide-react";

export function ArticleSummary({ children }: { children: React.ReactNode }) {
  // children (ul/liのリスト想定) からテキストを抽出してチェックマーク付きリストにする
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 my-10 shadow-sm">
      <div className="text-center mb-5">
        <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 text-sm font-black tracking-wider rounded-full uppercase shadow-sm border border-orange-200">
          この記事でわかること
        </span>
      </div>
      <div className="text-slate-700 font-bold md:text-lg space-y-4 [&>ul]:list-none [&>ul]:p-0 [&>ul>li]:flex [&>ul>li]:items-start [&>ul>li]:gap-3 md:[&>ul>li]:gap-4 [&>ul>li]:mb-4 md:[&>ul>li]:mb-5 [&>ul>li::before]:hidden">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === "ul") {
             const ulElement = child as React.ReactElement<any>;
             return React.cloneElement(ulElement, {}, 
                React.Children.map(ulElement.props.children, (li) => {
                  if (React.isValidElement(li)) {
                    const liElement = li as React.ReactElement<any>;
                    return (
                      <li className="flex items-start gap-3 md:gap-4 mb-4 md:mb-5">
                        <span className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full bg-orange-500 text-white flex items-center justify-center mt-0.5 md:mt-0 shadow-sm">
                          <Check className="w-4 h-4 md:w-5 md:h-5 stroke-[3]" />
                        </span>
                        <span className="flex-1 pt-0.5">{liElement.props.children}</span>
                      </li>
                    );
                  }
                  return li;
                })
             );
          }
          return child;
        })}
      </div>
    </div>
  );
}
