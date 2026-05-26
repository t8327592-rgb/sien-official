"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MixPage() {
  // Use state and effect for dynamic data later
  useEffect(() => {
    // client-side logic placeholder
  }, []);

  return (
    <>
      

    {/**/}
    <div className="page-header">
        <div className="container">
            <h1>ミックス／マスタリング</h1>
            <p>楽曲のポテンシャルを最大限に引き出す、確かなクオリティ。</p>
        </div>
    </div>

    {/**/}
    <section className="section">
        <div className="container">
            <div className="audio-compare-lite">
                <h3 className="widget-title"><i className="fa-solid fa-headphones"></i> 音質比較 (Before / After)</h3>
                <p className="widget-desc">楽曲ジャンル: ロック / ポップス<br />聴きどころ: ピッチやタイミングの自然な補正と、オケに馴染むボーカル処理をご確認ください。</p>

                <div className="compare-item-lite" style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <span className="song-label">モニタリング（DECO*27）</span>
                    <div className="player-controls">
                        <div className="toggle-switch">
                            <input type="radio" id="s1-before" name="sample1-type" value="before" checked />
                            <label htmlFor="s1-before">Before</label>
                            <input type="radio" id="s1-after" name="sample1-type" value="after" />
                            <label htmlFor="s1-after">After</label>
                        </div>
                        <button className="play-btn wave-play-btn" data-sample="1"><i className="fa-solid fa-play"></i></button>
                    </div>

                    <div className="seek-container" style={{ display: "none" }}>
                        <span className="curr-time" id="time-1">0:00</span>
                        <input type="range" className="seek-bar" id="seek-1" value="0" min="0" max="100" step="0.1" />
                        <span className="total-time" id="total-1">0:00</span>
                    </div>

                    <div style={{ position: "relative", width: "100%", height: "60px", marginTop: "15px" }}>
                        <div id="waveform-1-before" style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100%" }}></div>
                        <div id="waveform-1-after" style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100%", display: "none" }}></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "5px", width: "100%" }}>
                        <span id="wave-time-1">0:00</span>
                        <span id="wave-total-1">0:00</span>
                    </div>

                    {/**/}
                    <audio id="audio-1-before" src="./assets/sample1_before.mp3"></audio>
                    <audio id="audio-1-after" src="./assets/sample1_after.mp3"></audio>
                </div>
            </div>

            {/**/}
            {/**/}
            <div id="plan-list-mix" className="price-grid mt-5"></div>

            <div className="options-box">
                <h4>オプション</h4>
                <div id="option-list-mix"></div>
            </div>

            {/**/}
            <section id="faq" className="section" style={{ paddingTop: "60px", paddingBottom: "0" }}>
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

                <div className="video-grid" id="mix-portfolio">
                    {/**/}
                </div>

                <div className="text-center mt-4">
                    <button id="show-more-btn" className="btn btn-outline"
                        style={{ borderRadius: "30px", padding: "8px 25px", fontSize: "0.9rem" }}>
                        制作実績をもっと見る <i className="fa-solid fa-chevron-down"></i>
                    </button>
                </div>
            </div>


        </div>
    </section>

    
    </>
  );
}
