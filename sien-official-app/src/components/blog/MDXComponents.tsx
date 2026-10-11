import React from "react";
import Image from "next/image";
import type { Components, ExtraProps } from "react-markdown";
import { InfoBox } from "./InfoBox";
import { ArticleSummary } from "./ArticleSummary";
import { KeyPoints } from "./KeyPoints";
import { ProsCons } from "./ProsCons";
import { SummaryCard } from "./SummaryCard";



// MarkdownのHTMLをReactコンポーネントにマッピングする
function htmlProps<T extends ExtraProps>(props: T) {
  const clean = { ...props };
  delete clean.node;
  return clean;
}

export const MDXComponents: Components & { articlesummary: typeof ArticleSummary; keypoints: typeof KeyPoints; proscons: typeof ProsCons; summarycard: typeof SummaryCard } = {
  // blockquote (GitHub Alerts対応)
  blockquote: ({ children, ...props }) => {
    // childrenからテキストを抽出し、GitHub Alertの記法かチェックする
    const textContext = React.Children.toArray(children)
      .map(child => {
        if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
          return React.Children.toArray(child.props.children).join('');
        }
        return child;
      })
      .join('');

    const isAlert = textContext.match(/^\[!(NOTE|IMPORTANT|WARNING|CAUTION|SUCCESS|TIP)\]/i);

    if (isAlert) {
      const type = isAlert[1].toUpperCase() as "NOTE" | "IMPORTANT" | "WARNING" | "CAUTION" | "SUCCESS" | "TIP";
      // 先頭の [!TYPE] を除去したものを渡す
      const content = React.Children.map(children, (child) => {
        if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
          // pタグの中身のテキストを置換
          const innerArray = React.Children.toArray(child.props.children);
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
      <blockquote className="border-l-4 border-slate-200 pl-4 py-1 italic text-slate-600 bg-slate-50 rounded-r-lg" {...htmlProps(props)}>
        {children}
      </blockquote>
    );
  },

  // 見出し2
  h2: ({ children, ...props }) => {
    return (
      <h2
        className="mt-20 md:mt-24 mb-6 md:mb-8 text-[28px] md:text-[32px] font-extrabold text-slate-900 pb-4 border-b border-slate-200 relative before:absolute before:bottom-[-1px] before:left-0 before:w-16 before:h-[3px] before:bg-gradient-to-r before:from-orange-500 before:to-amber-500"
        {...htmlProps(props)}
      >
        {children}
      </h2>
    );
  },

  // 見出し3
  h3: ({ children, ...props }) => {
    return (
      <h3
        className="text-[22px] md:text-[24px] font-bold mt-12 mb-6 text-slate-900 flex items-center gap-3 pl-4 border-l-4 border-orange-500 bg-slate-50 py-2 rounded-r-lg"
        {...htmlProps(props)}
      >
        {children}
      </h3>
    );
  },

  // カスタムHTMLタグのマッピング
  articlesummary: ArticleSummary,
  keypoints: KeyPoints,
  proscons: ProsCons,
  summarycard: SummaryCard,

  // テーブル (レスポンシブ対応)
  table: ({ children, ...props }) => (
    <div className="w-full overflow-x-auto my-12 rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-left border-collapse min-w-[600px]" {...htmlProps(props)}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th className="bg-slate-50 p-4 font-bold text-slate-700 border-b border-slate-200 whitespace-nowrap text-lg" {...htmlProps(props)}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="p-4 border-b border-slate-100 text-slate-600 align-top text-lg" {...htmlProps(props)}>
      {children}
    </td>
  ),

  // 画像 (小さめに、中央寄せ。キャプションとの余白をセットにする)
  img: ({ src, alt, ...props }) => {
    return (
      <span className="flex flex-col items-center mt-8 mb-10 md:mt-10 md:mb-12">
        <span className="block w-full max-w-[480px] relative rounded-2xl overflow-hidden shadow-md">
          <Image
            src={typeof src === "string" ? src : "/profile.jpg"}
            unoptimized
            alt={alt || ""}
            className="w-full h-auto object-cover m-0 rounded-2xl"
            loading="lazy"
            {...htmlProps(props)} width={480} height={270}
          />
        </span>
        {alt && (
          <span className="block text-center text-[15px] text-slate-500 mt-3 mb-0 font-medium">
            {alt}
          </span>
        )}
      </span>
    );
  },

  // FAQアコーディオン (details / summary)
  details: ({ children, ...props }) => (
    <details className="group bg-white border border-slate-200 rounded-xl mb-4 shadow-sm overflow-hidden open:shadow-md transition-all duration-200" {...htmlProps(props)}>
      {children}
    </details>
  ),
  summary: ({ children, ...props }) => (
    <summary className="font-bold text-lg p-5 cursor-pointer list-none flex justify-between items-center text-slate-800 group-open:bg-slate-50 transition-colors" {...htmlProps(props)}>
      <div className="flex gap-3 items-center">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">Q</span>
        <span>{children}</span>
      </div>
      <span className="text-slate-600 group-open:rotate-180 transition-transform duration-200">
        ▼
      </span>
    </summary>
  ),
};
