import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

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
        <div className="bg-emerald-100/50 px-5 py-3 border-b border-emerald-100 flex items-center gap-2">
          <ThumbsUp className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-emerald-800">メリット</span>
        </div>
        <div className="p-5 text-slate-700 font-medium [&>ul]:list-none [&>ul]:p-0 [&>ul>li]:flex [&>ul>li]:items-start [&>ul>li]:gap-2 [&>ul>li]:mb-3 [&>ul>li::before]:hidden">
          {prosList ? (() => {
            const ulElement = prosList as React.ReactElement<any>;
            return React.cloneElement(ulElement, {}, 
              React.Children.map(ulElement.props.children, (li) => {
                if (React.isValidElement(li)) {
                  const liElement = li as React.ReactElement<any>;
                  return (
                    <li className="flex items-start gap-2 mb-3">
                      <span className="flex-shrink-0 text-emerald-500 mt-0.5">●</span>
                      <span className="flex-1 pt-0.5">{liElement.props.children}</span>
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
        <div className="bg-rose-100/50 px-5 py-3 border-b border-rose-100 flex items-center gap-2">
          <ThumbsDown className="w-5 h-5 text-rose-600" />
          <span className="font-bold text-rose-800">デメリット</span>
        </div>
        <div className="p-5 text-slate-700 font-medium [&>ul]:list-none [&>ul]:p-0 [&>ul>li]:flex [&>ul>li]:items-start [&>ul>li]:gap-2 [&>ul>li]:mb-3 [&>ul>li::before]:hidden">
          {consList ? (() => {
            const ulElement = consList as React.ReactElement<any>;
            return React.cloneElement(ulElement, {}, 
              React.Children.map(ulElement.props.children, (li) => {
                if (React.isValidElement(li)) {
                  const liElement = li as React.ReactElement<any>;
                  return (
                    <li className="flex items-start gap-2 mb-3">
                      <span className="flex-shrink-0 text-rose-500 mt-0.5">●</span>
                      <span className="flex-1 pt-0.5">{liElement.props.children}</span>
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
