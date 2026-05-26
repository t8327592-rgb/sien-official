"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OriginalPage() {
  // Use state and effect for dynamic data later
  useEffect(() => {
    // client-side logic placeholder
  }, []);

  return (
    <>
      

    {/**/}
    <div className="page-header">
        <div className="container">
            <h1>オリジナル楽曲制作</h1>
            <p>世界に一つだけのオリジナル楽曲を制作します。</p>
        </div>
    </div>

    <section className="section">
        <div className="container text-center">

            {/**/}
            <div id="plan-list-orig" className="price-grid center-2-col mt-5"></div>

            <div className="options-box mt-4" style={{ maxWidth: "600px", margin: "30px auto" }}>
                <h4>オプション</h4>
                <div id="option-list-orig"></div>
            </div>

            {/**/}
            <section id="schedule" className="section-flow" style={{ marginTop: "60px" }}>
                <div className="container">
                    <h2 className="section-title">制作スケジュール・流れ</h2>
                    <p className="section-desc">
                        ご依頼から納品まで、おおよそ<strong>45〜60日程度</strong> を目安に進めてまいります。<br />
                        <small>※修正内容やスケジュールの混雑状況によっては、期間が延長となる場合がございます。</small>
                    </p>

                    <div className="flow-steps">
                        <div className="step-item">
                            <span className="step-num">STEP 01</span>
                            <h3>お支払い・制作開始</h3>
                            <p>お支払い確認後、ワンコーラスデモを制作。<br />期間：約1〜2週間</p>
                        </div>
                        <div className="step-item">
                            <span className="step-num">STEP 02</span>
                            <h3>方向性の確認・修正</h3>
                            <p>デモ音源をご確認いただき、イメージをすり合わせます。</p>
                        </div>
                        <div className="step-item">
                            <span className="step-num">STEP 03</span>
                            <h3>フルコーラス制作</h3>
                            <p>デモを元に全体を構築。<br />期間：約2〜3週間</p>
                        </div>
                        <div className="step-item">
                            <span className="step-num">STEP 04</span>
                            <h3>ボーカル収録・提出</h3>
                            <p>最終確認後、お客様にて収録されたデータをお送りください。</p>
                        </div>
                        <div className="step-item">
                            <span className="step-num">STEP 05</span>
                            <h3>MIX・マスタリング</h3>
                            <p>ボーカルとオケを馴染ませ仕上げます。<br />期間：約1〜2週間</p>
                        </div>
                        <div className="step-item">
                            <span className="step-num">STEP 06</span>
                            <h3>完成データ納品</h3>
                            <p>最終調整を終え、完成した音源を納品いたします。</p>
                        </div>
                    </div>
                </div>
            </section>

            {/**/}
            <section id="faq" className="section" style={{ paddingTop: "0" }}>
                <div className="container text-center">
                    <h2 className="section-title">よくある質問</h2>
                    <p className="section-desc">ご依頼に関するご質問にお答えします。</p>
                    <a href="faq.html" className="btn btn-outline" style={{ borderRadius: "30px", padding: "10px 40px" }}>
                        よくある質問はこちら <i className="fa-solid fa-chevron-right"></i>
                    </a>
                </div>
            </section>

            {/**/}
            <div className="portfolio-section mt-5">
                <h3 className="widget-title text-center">制作実績</h3>
                <p className="section-desc">過去の制作事例</p>

                <div className="video-grid" id="original-portfolio">
                    {/**/}
                </div>
            </div>


        </div>
    </section>

    
    </>
  );
}
