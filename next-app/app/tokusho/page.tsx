"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TokushoPage() {
  // Use state and effect for dynamic data later
  useEffect(() => {
    // client-side logic placeholder
  }, []);

  return (
    <>
      

    {/**/}
    <div className="page-header">
        <div className="container">
            <h1>特定商取引法に基づく表記</h1>
            <p>Legal Information</p>
        </div>
    </div>

    {/**/}
    <section className="section">
        <div className="container">
            <div className="legal-container">
                <table className="legal-table">
                    <tbody>
                        <tr>
                            <th>販売事業者名（屋号）</th>
                            <td>Sien（屋号）</td>
                        </tr>
                        <tr>
                            <th>運営責任者</th>
                            <td>佐藤 翼</td>
                        </tr>
                        <tr>
                            <th>所在地</th>
                            <td>ご請求があった場合、遅滞なく開示いたします。</td>
                        </tr>
                        <tr>
                            <th>電話番号</th>
                            <td>ご請求があった場合、遅滞なく開示いたします。</td>
                        </tr>
                        <tr>
                            <th>メールアドレス</th>
                            <td>px.sien@gmail.com</td>
                        </tr>
                        <tr>
                            <th>販売価格</th>
                            <td>各サービスページに税込価格として記載しております。</td>
                        </tr>
                        <tr>
                            <th>商品代金以外の必要料金</th>
                            <td>銀行振込の場合、振込手数料はお客様のご負担となります。</td>
                        </tr>
                        <tr>
                            <th>支払方法</th>
                            <td>銀行振込、クレジットカード決済</td>
                        </tr>
                        <tr>
                            <th>支払時期</th>
                            <td>ご依頼内容確定後、当方が指定する期日までにお支払いください。</td>
                        </tr>
                        <tr>
                            <th>引き渡し時期</th>
                            <td>制作完了後、音源データを納品いたします。</td>
                        </tr>
                        <tr>
                            <th>返品・キャンセルについて</th>
                            <td>サービスの性質上、制作開始後のキャンセルおよび返金は原則としてお受けできません。</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>

    
    </>
  );
}
