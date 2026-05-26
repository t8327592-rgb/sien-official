"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function FaqPage() {
  // Use state and effect for dynamic data later
  useEffect(() => {
    // client-side logic placeholder
  }, []);

  return (
    <>
      

    {/**/}
    <div className="page-header">
        <div className="container">
            <h1>よくある質問</h1>
            <p>Q&A</p>
        </div>
    </div>

    {/**/}
    <section className="section">
        <div className="container">
            <div className="faq-grid">

                <h3 className="faq-section-title">ご依頼・お支払いについて</h3>

                {/**/}
                <details className="faq-item">
                    <summary>Q. お支払い方法について教えてください。</summary>
                    <div className="faq-content">
                        A. クレジットカード決済、または銀行振込に対応しております。<br />
                        ※法人様からのご依頼は、原則として銀行振込にて承っております。請求書払い等の支払時期については事前にご相談ください。
                    </div>
                </details>

                {/**/}
                <details className="faq-item">
                    <summary>Q. 見積もりだけの相談でも大丈夫ですか？</summary>
                    <div className="faq-content">
                        A. はい、大歓迎です。「正式に依頼するか迷っている」「まずは予算感を知りたい」という場合でも、お気軽にお問い合わせください。<br />
                        フォームの「ご要望・ご質問」欄に「見積もり希望」と記載いただければ、無料で概算をお出しします。
                    </div>
                </details>

                {/**/}
                <details className="faq-item">
                    <summary>Q. コラボなどの場合、支払いを別々にすることはできますか？</summary>
                    <div className="faq-content">
                        A. 「銀行振込」の場合のみ、個別のお支払いが可能です。<br />
                        クレジットカード決済の場合はシステム上分割ができないため、代表者様による一括決済をお願いしております。なお、制作作業は全員分のご入金（または決済）が確認できてからの着手となりますのでご了承ください。
                    </div>
                </details>


                <h3 className="faq-section-title">制作・納期について</h3>

                {/**/}
                <details className="faq-item">
                    <summary>Q. スマホで録音した音源でも依頼できますか？</summary>
                    <div className="faq-content">
                        A. はい、可能です。<br />
                        ノイズ除去や音質調整を行い、可能な限りクオリティを引き出します。ただし、音割れや部屋の反響が強すぎる場合は、再録音をご提案させていただくこともございます。ご不安な場合は、一度音源をお送りいただければ確認いたします。
                    </div>
                </details>

                {/**/}
                <details className="faq-item">
                    <summary>Q. 「納期」の当日に、完成品が手に入りますか？</summary>
                    <div className="faq-content">
                        A. 提示する「納期」は、原則として「第一稿（初回の確認用音源）をお渡しする日」となります。<br />
                        そこから修正（リテイク）が入る場合は、完了までに追加の日数がかかります。「〇月〇日の投稿に間に合わせたい」という決まった期限がある場合は、修正期間を見越して余裕を持ったスケジュールでご相談ください。
                    </div>
                </details>

                <h3 className="faq-section-title">その他</h3>

                {/**/}
                <details className="faq-item">
                    <summary>Q. Twitter（X）のDMで連絡を取りたいのですが。</summary>
                    <div className="faq-content">
                        A. はい、可能です。<br />
                        ご依頼フォームの「Twitter
                        ID」欄にご自身のIDを入力いただければ、DMでのご連絡を優先させていただきます。スムーズにやり取りを行うため、当アカウント（@sien_mc09）のフォロー、またはDMの開放設定（すべてのアカウントからのメッセージ許可）をお願いいたします。
                    </div>
                </details>

            </div>

            <div className="text-center mt-5">
                <a href="order.html" className="btn btn-primary btn-lg">お見積もり・相談する</a>
            </div>
        </div>
    </section>

    
    </>
  );
}
