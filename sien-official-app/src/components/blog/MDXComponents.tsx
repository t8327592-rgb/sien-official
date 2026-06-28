import React from "react";
import { InfoBox } from "./InfoBox";
import { ArticleSummary } from "./ArticleSummary";
import { KeyPoints } from "./KeyPoints";
import { ProsCons } from "./ProsCons";

// MarkdownのHTMLをReactコンポーネントにマッピングする
export const MDXComponents: any = {
  // blockquote (GitHub Alerts対応)
  blockquote: ({ node, children, ...props }: any) => {
    // childrenからテキストを抽出し、GitHub Alertの記法かチェックする
    const textContext = React.Children.toArray(children)
      .map(child => {
        if (React.isValidElement(child) && (child.props as any).children) {
          return React.Children.toArray((child.props as any).children).join('');
        }
        return child;
      })
      .join('');

    const isAlert = textContext.match(/^\[!(NOTE|IMPORTANT|WARNING|CAUTION|SUCCESS|TIP)\]/i);
    
    if (isAlert) {
      const type = isAlert[1].toUpperCase() as "NOTE" | "IMPORTANT" | "WARNING" | "CAUTION" | "SUCCESS" | "TIP";
      // 先頭の [!TYPE] を除去したものを渡す
      const content = React.Children.map(children, (child) => {
        if (React.isValidElement(child) && (child.props as any).children) {
          // pタグの中身のテキストを置換
          const innerArray = React.Children.toArray((child.props as any).children);
          const firstText = innerArray[0];
          if (typeof firstText === 'string') {
            const newText = firstText.replace(/^\[!(NOTE|IMPORTANT|WARNING|CAUTION|SUCCESS|TIP)\]\s*/i, '');
            return React.cloneElement(child as React.ReactElement, {}, newText, ...innerArray.slice(1));
          }
        }
        return child;
      });

      return <InfoBox type={type}>{content}</InfoBox>;
    }

    return (
      <blockquote className="border-l-4 border-slate-200 pl-4 py-1 italic text-slate-600 bg-slate-50 rounded-r-lg" {...props}>
        {children}
      </blockquote>
    );
  },

  // 見出し2
  h2: ({ node, children, ...props }: any) => {
    return (
      <h2 
        className="text-2xl md:text-3xl font-bold mt-12 mb-6 pb-2 border-b-2 border-slate-100 flex items-center relative pl-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:bg-orange-500 before:rounded-full"
        {...props}
      >
        {children}
      </h2>
    );
  },

  // 見出し3
  h3: ({ node, children, ...props }: any) => {
    return (
      <h3 
        className="text-xl md:text-2xl font-bold mt-8 mb-4 text-slate-800"
        {...props}
      >
        {children}
      </h3>
    );
  },

  // カスタムHTMLタグのマッピング
  articlesummary: ArticleSummary,
  keypoints: KeyPoints,
  proscons: ProsCons,
  
  // テーブル (レスポンシブ対応)
  table: ({ node, children, ...props }: any) => (
    <div className="w-full overflow-x-auto my-8 rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-left border-collapse min-w-[600px]" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ node, children, ...props }: any) => (
    <th className="bg-slate-50 p-4 font-bold text-slate-700 border-b border-slate-200 whitespace-nowrap" {...props}>
      {children}
    </th>
  ),
  td: ({ node, children, ...props }: any) => (
    <td className="p-4 border-b border-slate-100 text-slate-600 align-top" {...props}>
      {children}
    </td>
  ),

  // 画像 (大きく、角丸、影)
  img: ({ node, src, alt, ...props }: any) => {
    return (
      <span className="block my-10 md:my-14 -mx-4 md:-mx-8">
        <span className="block max-w-[900px] mx-auto relative rounded-2xl overflow-hidden shadow-md">
          <img 
            src={src} 
            alt={alt || ""} 
            className="w-full h-auto object-cover m-0 rounded-2xl" 
            loading="lazy"
            {...props} 
          />
        </span>
        {alt && (
          <span className="block text-center text-sm text-slate-500 mt-3 font-medium">
            {alt}
          </span>
        )}
      </span>
    );
  },

  // FAQアコーディオン (details / summary)
  details: ({ node, children, ...props }: any) => (
    <details className="group bg-white border border-slate-200 rounded-xl mb-4 shadow-sm overflow-hidden open:shadow-md transition-all duration-200" {...props}>
      {children}
    </details>
  ),
  summary: ({ node, children, ...props }: any) => (
    <summary className="font-bold text-lg p-5 cursor-pointer list-none flex justify-between items-center text-slate-800 group-open:bg-slate-50 transition-colors" {...props}>
      <div className="flex gap-3 items-center">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">Q</span>
        <span>{children}</span>
      </div>
      <span className="text-slate-400 group-open:rotate-180 transition-transform duration-200">
        ▼
      </span>
    </summary>
  ),
};
