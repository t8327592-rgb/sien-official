import React from "react";
import { ThumbsDown } from "lucide-react";

export function ProsCons({ children }: { children: React.ReactNode }) {
  // childrenを調べて、最初のulをpros、次のulをconsとして扱う
  const lists = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === "ul"
  );

  const prosList = lists[0];
  const consList = lists[1];

  return (
    <div className="grid md:grid-cols-2 gap-4 my-10">
      {/* メリット */}
      <div className="bg-emerald-50 rounded-2xl border border-emerald-100 overflow-hidden shadow-sm">
        <div className="p-5 md:p-6 text-slate-700 font-medium [&>ul]:list-none [&>ul]:p-0 [&>ul>li]:flex [&>ul>li]:items-start [&>ul>li]:gap-2 md:[&>ul>li]:gap-3 [&>ul>li]:mb-4 md:[&>ul>li]:mb-5 [&>ul>li::before]:hidden">
          {prosList ? (() => {
            const ulElement = prosList as React.ReactElement<{ children?: React.ReactNode }>;
            return React.cloneElement(ulElement, {},
              React.Children.map(ulElement.props.children, (li) => {
                if (React.isValidElement(li)) {
                  const liElement = li as React.ReactElement<{ children?: React.ReactNode }>;
                  return (
                    <li className="flex items-start gap-2 md:gap-3 mb-4 md:mb-5">
                      <span className="flex-shrink-0 text-emerald-500 mt-0.5 md:mt-1">●</span>
                      <span className="flex-1 pt-0.5 leading-relaxed">{liElement.props.children}</span>
                    </li>
                  );
                }
                return li;
              })
            );
          })() : (
            <p className="text-sm text-slate-500">メリットが設定されていません</p>
          )}
        </div>
      </div>

      {/* デメリット */}
      <div className="bg-rose-50 rounded-2xl border border-rose-100 overflow-hidden shadow-sm">
        <div className="bg-rose-100/50 px-5 py-3 md:py-4 border-b border-rose-100 flex items-center gap-2">
          <ThumbsDown className="w-5 h-5 md:w-6 md:h-6 text-rose-600" />
          <span className="font-bold md:text-lg text-rose-800">デメリット</span>
        </div>
        <div className="p-5 md:p-6 text-slate-700 font-medium [&>ul]:list-none [&>ul]:p-0 [&>ul>li]:flex [&>ul>li]:items-start [&>ul>li]:gap-2 md:[&>ul>li]:gap-3 [&>ul>li]:mb-4 md:[&>ul>li]:mb-5 [&>ul>li::before]:hidden">
          {consList ? (() => {
            const ulElement = consList as React.ReactElement<{ children?: React.ReactNode }>;
            return React.cloneElement(ulElement, {},
              React.Children.map(ulElement.props.children, (li) => {
                if (React.isValidElement(li)) {
                  const liElement = li as React.ReactElement<{ children?: React.ReactNode }>;
                  return (
                    <li className="flex items-start gap-2 md:gap-3 mb-4 md:mb-5">
                      <span className="flex-shrink-0 text-rose-500 mt-0.5 md:mt-1">●</span>
                      <span className="flex-1 pt-0.5 leading-relaxed">{liElement.props.children}</span>
                    </li>
                  );
                }
                return li;
              })
            );
          })() : (
            <p className="text-sm text-slate-500">デメリットが設定されていません</p>
          )}
        </div>
      </div>
    </div>
  );
}
